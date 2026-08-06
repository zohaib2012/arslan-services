import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/database.config';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalCustomers,
      totalWorkers,
      totalBookings,
      totalRevenue,
      pendingVerifications,
      openDisputes,
      recentBookings,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.workerProfile.count(),
      this.prisma.booking.count(),
      this.prisma.booking.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { priceEstimate: true },
      }),
      this.prisma.workerProfile.count({ where: { verificationStatus: 'PENDING' } }),
      this.prisma.dispute.count({ where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } } }),
      this.prisma.booking.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          customer: { select: { id: true, fullName: true, profilePhoto: true } },
          worker: { include: { user: { select: { fullName: true } } } },
          service: { select: { nameEn: true } },
        },
      }),
    ]);

    return {
      totalCustomers,
      totalWorkers,
      totalBookings,
      totalRevenue: totalRevenue._sum.priceEstimate || 0,
      pendingVerifications,
      openDisputes,
      recentBookings,
    };
  }

  async getBookingTrends(days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const bookings = await this.prisma.booking.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true, status: true },
    });

    const trends: Record<string, { date: string; total: number; completed: number; cancelled: number }> = {};

    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      trends[dateKey] = { date: dateKey, total: 0, completed: 0, cancelled: 0 };
    }

    for (const booking of bookings) {
      const dateKey = booking.createdAt.toISOString().split('T')[0];
      if (trends[dateKey]) {
        trends[dateKey].total++;
        if (booking.status === 'COMPLETED') trends[dateKey].completed++;
        if (booking.status === 'CANCELLED') trends[dateKey].cancelled++;
      }
    }

    return Object.values(trends).sort((a, b) => a.date.localeCompare(b.date));
  }
}
