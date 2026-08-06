import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/database.config';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async saveMessage(
    senderId: string,
    receiverId: string,
    bookingId: string | null,
    message: string,
    messageType = 'TEXT',
    fileUrl?: string,
  ) {
    const msg = await this.prisma.chatMessage.create({
      data: {
        senderId,
        receiverId,
        bookingId,
        message,
        messageType,
        fileUrl,
      },
      include: {
        sender: { select: { id: true, fullName: true, profilePhoto: true } },
        receiver: { select: { id: true, fullName: true, profilePhoto: true } },
      },
    });

    return msg;
  }

  async getConversations(userId: string) {
    const conversations = await this.prisma.$queryRaw`
      SELECT
        CASE WHEN sender_id = ${userId}::uuid THEN receiver_id ELSE sender_id END AS partner_id,
        MAX(created_at) AS last_message_at,
        (
          SELECT m.message
          FROM chat_messages m
          WHERE (m.sender_id = ${userId}::uuid AND m.receiver_id = partner_id)
             OR (m.sender_id = partner_id AND m.receiver_id = ${userId}::uuid)
          ORDER BY m.created_at DESC LIMIT 1
        ) AS last_message,
        (
          SELECT COUNT(*)
          FROM chat_messages m
          WHERE m.receiver_id = ${userId}::uuid AND m.sender_id = partner_id AND m.is_read = false
        ) AS unread_count
      FROM chat_messages
      WHERE sender_id = ${userId}::uuid OR receiver_id = ${userId}::uuid
      GROUP BY partner_id
      ORDER BY last_message_at DESC
    `;

    const partners = await this.prisma.user.findMany({
      where: {
        id: {
          in: (conversations as any[]).map((c: any) => c.partner_id),
        },
      },
      select: { id: true, fullName: true, profilePhoto: true, phone: true },
    });

    const partnerMap = new Map(partners.map((p) => [p.id, p]));

    return (conversations as any[]).map((c: any) => ({
      partner: partnerMap.get(c.partner_id) || null,
      lastMessage: c.last_message,
      lastMessageAt: c.last_message_at,
      unreadCount: Number(c.unread_count),
    }));
  }

  async getMessages(userId: string, partnerId: string, page = 1, limit = 50) {
    const skip = (Number(page) - 1) * Number(limit);

    const [messages, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: partnerId },
            { senderId: partnerId, receiverId: userId },
          ],
        },
        include: {
          sender: { select: { id: true, fullName: true, profilePhoto: true } },
          receiver: { select: { id: true, fullName: true, profilePhoto: true } },
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.chatMessage.count({
        where: {
          OR: [
            { senderId: userId, receiverId: partnerId },
            { senderId: partnerId, receiverId: userId },
          ],
        },
      }),
    ]);

    return {
      messages: messages.reverse(),
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  async getMessagesByBooking(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    return this.prisma.chatMessage.findMany({
      where: { bookingId },
      include: {
        sender: { select: { id: true, fullName: true, profilePhoto: true } },
        receiver: { select: { id: true, fullName: true, profilePhoto: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
