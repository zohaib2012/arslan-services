import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { FirebaseService } from '../config/firebase.config';
import { PrismaService } from '../config/database.config';

@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private onlineUsers = new Map<string, string>();

  constructor(
    private chatService: ChatService,
    private firebaseService: FirebaseService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (!userId) {
      client.disconnect();
      return;
    }

    this.onlineUsers.set(userId, client.id);
    client.join(`user:${userId}`);
    this.logger.log(`User ${userId} connected via socket ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userId = [...this.onlineUsers.entries()].find(
      ([, socketId]) => socketId === client.id,
    )?.[0];

    if (userId) {
      this.onlineUsers.delete(userId);
      this.logger.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('chat:join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: string },
  ) {
    client.join(`booking:${data.bookingId}`);
  }

  @SubscribeMessage('chat:leave-room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: string },
  ) {
    client.leave(`booking:${data.bookingId}`);
  }

  @SubscribeMessage('chat:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      receiverId: string;
      bookingId?: string;
      message: string;
      messageType?: string;
      fileUrl?: string;
    },
  ) {
    const userId = [...this.onlineUsers.entries()].find(
      ([, socketId]) => socketId === client.id,
    )?.[0];

    if (!userId) return;

    const savedMessage = await this.chatService.saveMessage(
      userId,
      data.receiverId,
      data.bookingId || null,
      data.message,
      data.messageType || 'TEXT',
      data.fileUrl,
    );

    this.server.to(`user:${data.receiverId}`).emit('chat:receive', savedMessage);
    this.server.to(`user:${userId}`).emit('chat:receive', savedMessage);

    if (!this.onlineUsers.has(data.receiverId)) {
      const sender = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { fullName: true },
      });
      const receiver = await this.prisma.user.findUnique({
        where: { id: data.receiverId },
        select: { fcmToken: true },
      });

      if (receiver?.fcmToken) {
        await this.firebaseService.sendToDevice(
          receiver.fcmToken,
          sender?.fullName || 'New Message',
          data.message,
          {
            type: 'CHAT_MESSAGE',
            senderId: userId,
            bookingId: data.bookingId || '',
          },
        );
      }

      await this.prisma.notification.create({
        data: {
          userId: data.receiverId,
          type: 'CHAT_MESSAGE',
          title: sender?.fullName || 'New Message',
          body: data.message,
          data: {
            senderId: userId,
            bookingId: data.bookingId || null,
          } as any,
        },
      });
    }
  }

  @SubscribeMessage('chat:typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string; bookingId?: string },
  ) {
    const userId = [...this.onlineUsers.entries()].find(
      ([, socketId]) => socketId === client.id,
    )?.[0];

    if (!userId) return;

    this.server.to(`user:${data.receiverId}`).emit('chat:typing', {
      userId,
      bookingId: data.bookingId,
    });
  }

  @SubscribeMessage('chat:message-read')
  async handleMessageRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { senderId: string },
  ) {
    const userId = [...this.onlineUsers.entries()].find(
      ([, socketId]) => socketId === client.id,
    )?.[0];

    if (!userId) return;

    await this.prisma.chatMessage.updateMany({
      where: { senderId: data.senderId, receiverId: userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    this.server.to(`user:${data.senderId}`).emit('chat:message-read', {
      readBy: userId,
    });
  }
}
