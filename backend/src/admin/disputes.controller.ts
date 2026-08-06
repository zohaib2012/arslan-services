import { Controller, Get, Put, Param, Query, Body, UseGuards, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/admin/disputes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminDisputesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getDisputes(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status = '',
  ) {
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};
    if (status) where.status = status;

    const [disputes, total] = await Promise.all([
      this.prisma.dispute.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          raiser: { select: { id: true, fullName: true, profilePhoto: true } },
          booking: {
            select: {
              id: true,
              service: { select: { nameEn: true } },
              worker: { include: { user: { select: { fullName: true } } } },
            },
          },
          evidence: true,
          _count: { select: { evidence: true } },
        },
      }),
      this.prisma.dispute.count({ where }),
    ]);

    return { disputes, total, page: Number(page) || 1, totalPages: Math.ceil(total / take) };
  }

  @Get(':id')
  async getDispute(@Param('id') id: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: {
        raiser: { select: { id: true, fullName: true, email: true, phone: true, profilePhoto: true } },
        booking: {
          include: {
            customer: { select: { id: true, fullName: true, profilePhoto: true } },
            worker: { include: { user: { select: { id: true, fullName: true, profilePhoto: true } } } },
            service: { select: { nameEn: true } },
            review: true,
          },
        },
        evidence: true,
      },
    });

    if (!dispute) throw new NotFoundException('Dispute not found');
    return dispute;
  }

  @Put(':id/resolve')
  async resolveDispute(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body('resolutionNotes') resolutionNotes: string,
    @Body('status') status: string,
  ) {
    const dispute = await this.prisma.dispute.findUnique({ where: { id } });
    if (!dispute) throw new NotFoundException('Dispute not found');

    const validStatuses = ['RESOLVED_CUSTOMER', 'RESOLVED_WORKER', 'DISMISSED'];
    if (status && !validStatuses.includes(status)) {
      status = 'DISMISSED';
    }

    const updated = await this.prisma.dispute.update({
      where: { id },
      data: {
        status: (status || 'DISMISSED') as any,
        resolutionNotes: resolutionNotes || null,
        resolvedBy: adminId,
        resolvedAt: new Date(),
      },
      include: {
        raiser: { select: { id: true, fullName: true } },
        booking: {
          select: {
            id: true,
            service: { select: { nameEn: true } },
          },
        },
      },
    });

    if (status === 'RESOLVED_CUSTOMER' || status === 'RESOLVED_WORKER' || status === 'DISMISSED') {
      await this.prisma.booking.update({
        where: { id: dispute.bookingId },
        data: { isDisputed: false },
      });
    }

    return updated;
  }
}
