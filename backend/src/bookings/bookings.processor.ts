import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { PrismaService } from '../config/database.config';
import { FirebaseService } from '../config/firebase.config';

@Processor('bookings')
export class BookingsProcessor {
  private readonly logger = new Logger(BookingsProcessor.name);

  constructor(
    private prisma: PrismaService,
    private firebaseService: FirebaseService,
  ) {}

  @Process('expire-booking')
  async handleExpireBooking(job: Job<{ bookingId: string }>) {
    const { bookingId } = job.data;

    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          customer: true,
          worker: { include: { user: true } },
        },
      });

      if (!booking || booking.status !== 'PENDING') return;

      await this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'EXPIRED' },
      });

      if (booking.worker.user.fcmToken) {
        await this.firebaseService.sendToDevice(
          booking.worker.user.fcmToken,
          'Booking Expired',
          `Booking from ${booking.customer.fullName} has expired`,
          { type: 'BOOKING_EXPIRED', bookingId },
        );
      }

      await this.prisma.notification.create({
        data: {
          userId: booking.worker.userId,
          type: 'BOOKING_UPDATE',
          title: 'Booking Expired',
          body: 'A booking request has expired',
          data: { bookingId, status: 'EXPIRED' } as any,
        },
      });

      this.logger.log(`Booking ${bookingId} expired`);
    } catch (error) {
      this.logger.error(`Failed to expire booking ${bookingId}: ${error}`);
    }
  }
}
