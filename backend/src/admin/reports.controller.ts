import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/admin/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminReportsController {
  constructor(private prisma: PrismaService) {}

  @Get('users')
  async userReport() {
    const [totalCustomers, totalWorkers, customersToday, workersToday] = await Promise.all([
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.user.count({ where: { role: 'WORKER' } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } }),
      this.prisma.user.count({ where: { role: 'WORKER', createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } }),
    ]);
    return { totalCustomers, totalWorkers, customersToday, workersToday };
  }

  @Get('bookings')
  async bookingReport(@Query('days') days = '7') {
    const results: any[] = [];
    for (let i = Number(days) - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      const count = await this.prisma.booking.count({ where: { createdAt: { gte: d, lt: next } } });
      results.push({ date: d.toISOString().split('T')[0], count });
    }
    return results;
  }
}
