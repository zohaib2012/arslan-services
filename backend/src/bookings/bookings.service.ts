import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { FirebaseService } from '../config/firebase.config';
import { CreateBookingDto, RescheduleBookingDto } from './dto/booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private firebaseService: FirebaseService,
  ) {}

  async createBooking(customerId: string, dto: CreateBookingDto) {
    const worker = await this.prisma.workerProfile.findUnique({
      where: { id: dto.workerId },
      include: { user: true },
    });

    if (!worker || worker.verificationStatus !== 'VERIFIED') {
      throw new BadRequestException('Worker not available');
    }

    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
    });

    if (!service || !service.isActive) {
      throw new BadRequestException('Service not available');
    }

    const existing = await this.prisma.booking.findFirst({
      where: {
        customerId,
        workerId: dto.workerId,
        status: { in: ['PENDING', 'ACCEPTED'] },
      },
    });

    if (existing) {
      throw new BadRequestException('You already have an active booking with this worker');
    }

    const expiryMinutes = dto.bookingType === 'EMERGENCY' ? 15 : 60;
    const expiryAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    const booking = await this.prisma.booking.create({
      data: {
        customerId,
        workerId: dto.workerId,
        serviceId: dto.serviceId,
        bookingType: dto.bookingType,
        description: dto.description,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        address: dto.address,
        latitude: dto.latitude,
        longitude: dto.longitude,
        customerNotes: dto.customerNotes,
        expiryAt,
      },
      include: {
        customer: { select: { id: true, fullName: true, profilePhoto: true, phone: true } },
        worker: {
          include: { user: { select: { id: true, fullName: true, profilePhoto: true, phone: true } } },
        },
        service: { select: { id: true, nameEn: true, nameUr: true } },
      },
    });

    if (worker.user.fcmToken) {
      await this.firebaseService.sendToDevice(
        worker.user.fcmToken,
        'New Booking Request',
        `You have a new booking from ${booking.customer.fullName}`,
        { type: 'BOOKING_NEW', bookingId: booking.id },
      );
    }

    await this.prisma.notification.create({
      data: {
        userId: worker.userId,
        type: 'BOOKING_UPDATE',
        title: 'New Booking',
        body: `New booking from ${booking.customer.fullName}`,
        data: { bookingId: booking.id, status: 'PENDING' } as any,
      },
    });

    return booking;
  }

  async getCustomerBookings(customerId: string, status?: string) {
    const where: any = { customerId };
    if (status) where.status = status;

    return this.prisma.booking.findMany({
      where,
      include: {
        worker: {
          include: { user: { select: { id: true, fullName: true, profilePhoto: true, phone: true } } },
        },
        service: { select: { id: true, nameEn: true, nameUr: true, iconUrl: true } },
        review: { select: { id: true, rating: true, comment: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getWorkerBookings(userId: string, status?: string) {
    const profile = await this.prisma.workerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Worker profile not found');

    const where: any = { workerId: profile.id };
    if (status) where.status = status;

    return this.prisma.booking.findMany({
      where,
      include: {
        customer: { select: { id: true, fullName: true, profilePhoto: true, phone: true } },
        service: { select: { id: true, nameEn: true, nameUr: true, iconUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBookingById(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: { select: { id: true, fullName: true, profilePhoto: true, phone: true } },
        worker: {
          include: { user: { select: { id: true, fullName: true, profilePhoto: true, phone: true } } },
        },
        service: { select: { id: true, nameEn: true, nameUr: true, iconUrl: true } },
        review: { select: { id: true, rating: true, comment: true } },
        disputes: true,
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.customerId !== userId && booking.worker.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return booking;
  }

  async acceptBooking(userId: string, bookingId: string) {
    const profile = await this.prisma.workerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Worker profile not found');

    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, workerId: profile.id, status: 'PENDING' },
      include: { customer: true },
    });

    if (!booking) throw new BadRequestException('Booking not found or already processed');

    if (new Date() > booking.expiryAt) {
      await this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestException('Booking has expired');
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'ACCEPTED', acceptedAt: new Date() },
      include: {
        customer: { select: { id: true, fullName: true, profilePhoto: true, phone: true } },
        worker: {
          include: { user: { select: { id: true, fullName: true, profilePhoto: true, phone: true } } },
        },
      },
    });

    if (booking.customer.fcmToken) {
      await this.firebaseService.sendToDevice(
        booking.customer.fcmToken,
        'Booking Accepted',
        `${updated.worker.user.fullName} has accepted your booking`,
        { type: 'BOOKING_ACCEPTED', bookingId },
      );
    }

    await this.prisma.notification.create({
      data: {
        userId: booking.customerId,
        type: 'BOOKING_UPDATE',
        title: 'Booking Accepted',
        body: `${updated.worker.user.fullName} has accepted your booking`,
        data: { bookingId, status: 'ACCEPTED' } as any,
      },
    });

    return updated;
  }

  async rejectBooking(userId: string, bookingId: string, reason?: string) {
    const profile = await this.prisma.workerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Worker profile not found');

    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, workerId: profile.id, status: 'PENDING' },
      include: { customer: true },
    });

    if (!booking) throw new BadRequestException('Booking not found or already processed');

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'REJECTED', workerNotes: reason },
    });

    if (booking.customer.fcmToken) {
      await this.firebaseService.sendToDevice(
        booking.customer.fcmToken,
        'Booking Rejected',
        reason || 'The worker has rejected your booking request',
        { type: 'BOOKING_REJECTED', bookingId },
      );
    }

    await this.prisma.notification.create({
      data: {
        userId: booking.customerId,
        type: 'BOOKING_UPDATE',
        title: 'Booking Rejected',
        body: reason || 'Your booking was rejected',
        data: { bookingId, status: 'REJECTED' } as any,
      },
    });

    return updated;
  }

  async completeBooking(userId: string, bookingId: string) {
    const profile = await this.prisma.workerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Worker profile not found');

    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, workerId: profile.id, status: 'ACCEPTED' },
      include: { customer: true },
    });

    if (!booking) throw new BadRequestException('Booking not found or not in accepted state');

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    await this.prisma.workerProfile.update({
      where: { id: profile.id },
      data: { completedJobs: { increment: 1 } },
    });

    if (booking.customer.fcmToken) {
      await this.firebaseService.sendToDevice(
        booking.customer.fcmToken,
        'Booking Completed',
        'Your booking has been completed. Please leave a review.',
        { type: 'BOOKING_COMPLETED', bookingId },
      );
    }

    await this.prisma.notification.create({
      data: {
        userId: booking.customerId,
        type: 'BOOKING_UPDATE',
        title: 'Booking Completed',
        body: 'Your booking has been completed. Tap to leave a review.',
        data: { bookingId, status: 'COMPLETED' } as any,
      },
    });

    return updated;
  }

  async cancelBooking(userId: string, bookingId: string, reason?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        worker: { include: { user: true } },
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.status !== 'PENDING' && booking.status !== 'ACCEPTED') {
      throw new BadRequestException('Booking cannot be cancelled');
    }

    const isCustomer = booking.customerId === userId;
    const isWorker = booking.worker.userId === userId;

    if (!isCustomer && !isWorker) throw new ForbiddenException('Access denied');

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: isCustomer ? 'CUSTOMER' : 'WORKER',
        cancelReason: reason,
      },
    });

    const notifyUserId = isCustomer ? booking.worker.userId : booking.customerId;
    const notifyUser = isCustomer ? booking.worker.user : booking.customer;

    if (notifyUser.fcmToken) {
      await this.firebaseService.sendToDevice(
        notifyUser.fcmToken,
        'Booking Cancelled',
        reason || 'Booking has been cancelled',
        { type: 'BOOKING_CANCELLED', bookingId },
      );
    }

    await this.prisma.notification.create({
      data: {
        userId: notifyUserId,
        type: 'BOOKING_UPDATE',
        title: 'Booking Cancelled',
        body: reason || 'A booking has been cancelled',
        data: { bookingId, status: 'CANCELLED' } as any,
      },
    });

    return updated;
  }

  async rescheduleBooking(userId: string, bookingId: string, dto: RescheduleBookingDto) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, customerId: userId },
      include: {
        worker: { include: { user: true } },
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.status !== 'PENDING' && booking.status !== 'ACCEPTED') {
      throw new BadRequestException('Booking cannot be rescheduled');
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { scheduledAt: new Date(dto.scheduledAt) },
      include: {
        customer: { select: { id: true, fullName: true, profilePhoto: true, phone: true } },
        worker: {
          include: { user: { select: { id: true, fullName: true, profilePhoto: true, phone: true } } },
        },
      },
    });

    if (booking.worker.user.fcmToken) {
      await this.firebaseService.sendToDevice(
        booking.worker.user.fcmToken,
        'Booking Rescheduled',
        `Booking has been rescheduled to ${new Date(dto.scheduledAt).toLocaleString()}`,
        { type: 'BOOKING_RESCHEDULED', bookingId },
      );
    }

    return updated;
  }
}
