import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../config/database.config';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, bookingId: string, rating: number, comment?: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, customerId: userId, status: 'COMPLETED' },
    });

    if (!booking) throw new BadRequestException('Booking not found or not completed');

    const existing = await this.prisma.review.findUnique({
      where: { bookingId },
    });

    if (existing) throw new BadRequestException('Review already exists for this booking');

    const review = await this.prisma.review.create({
      data: {
        bookingId,
        customerId: userId,
        workerId: booking.workerId,
        rating,
        comment,
      },
      include: {
        customer: { select: { id: true, fullName: true, profilePhoto: true } },
        booking: { select: { id: true, serviceId: true, createdAt: true } },
      },
    });

    const stats = await this.prisma.review.aggregate({
      where: { workerId: booking.workerId, isVisible: true },
      _avg: { rating: true },
      _count: { id: true },
    });

    await this.prisma.workerProfile.update({
      where: { id: booking.workerId },
      data: {
        avgRating: stats._avg.rating || 0,
        totalReviews: stats._count.id,
      },
    });

    return review;
  }

  async findByBooking(bookingId: string) {
    const review = await this.prisma.review.findUnique({
      where: { bookingId },
      include: {
        customer: { select: { id: true, fullName: true, profilePhoto: true } },
        booking: { select: { id: true, serviceId: true, createdAt: true } },
      },
    });

    return review;
  }

  async getByWorker(workerId: string, page = 1, limit = 20) {
    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { workerId, isVisible: true },
        include: {
          customer: { select: { id: true, fullName: true, profilePhoto: true } },
          booking: { select: { id: true, serviceId: true, createdAt: true } },
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where: { workerId, isVisible: true } }),
    ]);

    const avg = await this.prisma.review.aggregate({
      where: { workerId, isVisible: true },
      _avg: { rating: true },
    });

    return {
      reviews,
      total,
      averageRating: avg._avg.rating || 0,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }
}
