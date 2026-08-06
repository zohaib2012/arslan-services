import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { FirebaseService } from '../config/firebase.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/admin/notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminNotificationsController {
  constructor(
    private prisma: PrismaService,
    private firebaseService: FirebaseService,
  ) {}

  @Post('send')
  async sendNotification(
    @Body('userIds') userIds: string[],
    @Body('title') title: string,
    @Body('body') body: string,
    @Body('type') type: string,
    @Body('data') data: any,
    @Body('sendToAll') sendToAll: boolean,
    @Body('audience') audience: string,
  ) {
    if (sendToAll) {
      const where: any = {};
      if (audience && audience !== 'all') {
        where.role = audience;
      }

      const users = await this.prisma.user.findMany({
        where,
        select: { id: true },
      });

      userIds = users.map((u) => u.id);
    }

    if (!userIds || userIds.length === 0) {
      return { message: 'No recipients', sent: 0 };
    }

    const validTypes = ['BOOKING_UPDATE', 'CHAT_MESSAGE', 'PROMOTION', 'DISPUTE_UPDATE', 'VERIFICATION_UPDATE'];
    const notificationType = validTypes.includes(type) ? type : 'PROMOTION';

    const notifications = userIds.map((userId) => ({
      userId,
      type: notificationType,
      title,
      body,
      data: data || {},
    }));

    await this.prisma.notification.createMany({ data: notifications as any });

    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, fcmToken: true },
    });

    const tokens = users.filter((u) => u.fcmToken).map((u) => u.fcmToken!) as string[];

    if (tokens.length > 0) {
      try {
        await this.firebaseService.sendToMultipleDevices(
          tokens,
          title,
          body,
          data as Record<string, string>,
        );
      } catch {
        return { message: 'Notifications saved, push delivery partially failed', sent: userIds.length, pushFailed: tokens.length };
      }
    }

    return { message: 'Notifications sent', sent: userIds.length, pushSent: tokens.length };
  }
}
