import { Controller, Get, Put, Param, Query, Body, UseGuards, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/admin/bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminBookingsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getBookings(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status = '',
    @Query('type') type = '',
    @Query('fromDate') fromDate = '',
    @Query('toDate') toDate = '',
  ) {
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};

    if (status) where.status = status;
    if (type) where.bookingType = type;

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, fullName: true, profilePhoto: true, phone: true } },
          worker: { include: { user: { select: { id: true, fullName: true, profilePhoto: true, phone: true } } } },
          service: { select: { id: true, nameEn: true } },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { bookings, total, page: Number(page) || 1, totalPages: Math.ceil(total / take) };
  }

  @Get(':id')
  async getBooking(@Param('id') id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, fullName: true, email: true, phone: true, profilePhoto: true } },
        worker: { include: { user: { select: { id: true, fullName: true, email: true, phone: true, profilePhoto: true } } } },
        service: { include: { category: { select: { nameEn: true } } } },
        review: true,
        disputes: { include: { evidence: true } },
        chatMessages: { take: 20, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  @Put(':id/status')
  async updateBookingStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('notes') notes: string,
  ) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');

    const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'DISPUTED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const updateData: any = { status };
    if (notes) updateData.workerNotes = notes;
    if (status === 'COMPLETED') updateData.completedAt = new Date();
    if (status === 'CANCELLED') updateData.cancelledAt = new Date();

    const updated = await this.prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        customer: { select: { id: true, fullName: true } },
        worker: { include: { user: { select: { fullName: true } } } },
        service: { select: { nameEn: true } },
      },
    });

    return updated;
  }
}
