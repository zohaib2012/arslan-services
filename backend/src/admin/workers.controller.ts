import { Controller, Get, Put, Delete, Param, Query, Body, UseGuards, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/admin/workers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminWorkersController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getWorkers(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status = '',
    @Query('search') search = '',
  ) {
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};
    if (status) where.verificationStatus = status;

    if (search) {
      where.user = {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [workers, total] = await Promise.all([
      this.prisma.workerProfile.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true, phone: true, profilePhoto: true } },
          _count: { select: { workerBookings: true, reviews: true } },
        },
        // avgRating and completedJobs are computed/aggregate fields
        // We'll map them afterward from the workerBookings
      }),
      this.prisma.workerProfile.count({ where }),
    ]);

    return { workers, total, page: Number(page) || 1, totalPages: Math.ceil(total / take) };
  }

  @Get('pending')
  async getPendingWorkers(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where = { verificationStatus: 'PENDING' as const };

    const [workers, total] = await Promise.all([
      this.prisma.workerProfile.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'asc' },
        include: {
          user: { select: { id: true, fullName: true, email: true, phone: true, profilePhoto: true } },
        },
      }),
      this.prisma.workerProfile.count({ where }),
    ]);

    return { workers, total, page: Number(page) || 1, totalPages: Math.ceil(total / take) };
  }

  @Get(':id')
  async getWorker(@Param('id') id: string) {
    const worker = await this.prisma.workerProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true, profilePhoto: true, isBlocked: true } },
        workerServices: { include: { service: { select: { id: true, nameEn: true } } } },
        serviceAreas: true,
        paymentMethods: true,
        portfolio: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { workerBookings: true, reviews: true } },
      },
    });

    if (!worker) throw new NotFoundException('Worker not found');
    return worker;
  }

  @Put(':id/verify')
  async verifyWorker(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body('verified') verified: boolean,
    @Body('notes') notes: string,
  ) {
    const worker = await this.prisma.workerProfile.findUnique({ where: { id } });
    if (!worker) throw new NotFoundException('Worker not found');

    const updated = await this.prisma.workerProfile.update({
      where: { id },
      data: {
        verificationStatus: verified ? 'VERIFIED' : 'REJECTED',
        verificationNotes: notes || null,
        verifiedAt: verified ? new Date() : null,
        verifiedBy: verified ? adminId : null,
      },
      include: {
        user: { select: { id: true, fullName: true } },
      },
    });

    return updated;
  }

  @Put(':id/suspend')
  async suspendWorker(
    @Param('id') id: string,
    @Body('suspended') suspended: boolean,
    @Body('reason') reason: string,
  ) {
    const worker = await this.prisma.workerProfile.findUnique({ where: { id } });
    if (!worker) throw new NotFoundException('Worker not found');

    const updated = await this.prisma.workerProfile.update({
      where: { id },
      data: {
        verificationStatus: suspended ? 'SUSPENDED' : 'PENDING',
        verificationNotes: suspended ? reason || null : null,
      },
      include: {
        user: { select: { id: true, fullName: true } },
      },
    });

    return updated;
  }

  @Delete(':id')
  async deleteWorker(@Param('id') id: string) {
    const worker = await this.prisma.workerProfile.findUnique({ where: { id } });
    if (!worker) throw new NotFoundException('Worker not found');

    await this.prisma.workerProfile.delete({ where: { id } });
    await this.prisma.user.delete({ where: { id: worker.userId } });
    return { message: 'Worker deleted successfully' };
  }
}
