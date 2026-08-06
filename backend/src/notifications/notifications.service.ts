import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { FirebaseService } from '../config/firebase.config';
import { NotificationType } from '../../generated/prisma';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private firebaseService: FirebaseService,
  ) {}

  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    data?: Record<string, any>,
    sendPush = true,
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        data: data as any,
      },
    });

    if (sendPush) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { fcmToken: true },
      });

      if (user?.fcmToken) {
        try {
          await this.firebaseService.sendToDevice(
            user.fcmToken,
            title,
            body,
            data as Record<string, string>,
          );

          await this.prisma.notification.update({
            where: { id: notification.id },
            data: { isPushedViaFcm: true },
          });
        } catch {}
      }
    }

    return notification;
  }

  async sendToAll(
    type: NotificationType,
    title: string,
    body: string,
    data?: Record<string, any>,
    role?: 'CUSTOMER' | 'WORKER',
  ) {
    const users = await this.prisma.user.findMany({
      where: {
        ...(role ? { role } : {}),
        fcmToken: { not: null },
        isBlocked: false,
      },
      select: { id: true, fcmToken: true },
    });

    const notifications = await Promise.all(
      users.map((u) =>
        this.prisma.notification.create({
          data: { userId: u.id, type, title, body, data: data as any },
        }),
      ),
    );

    const tokens = users
      .map((u) => u.fcmToken)
      .filter((t): t is string => !!t);

    if (tokens.length > 0) {
      await this.firebaseService.sendToMultipleDevices(
        tokens,
        title,
        body,
        data as Record<string, string>,
      );
    }

    return notifications;
  }

  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const skip = (Number(page) - 1) * Number(limit);

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return {
      notifications,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    return { unreadCount: count };
  }

  async markAsRead(userId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) return null;

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { message: 'All notifications marked as read' };
  }
}
