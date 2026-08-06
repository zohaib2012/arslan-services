import { Controller, Get, Post, Put, Param, Query, Body, UseGuards } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/admin/support-tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminSupportController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getTickets(@Query('page') page = '1', @Query('limit') limit = '20', @Query('status') status = '') {
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const where: any = {};
    if (status) where.status = status;
    const [tickets, total] = await Promise.all([
      this.prisma.supportTicket.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { user: { select: { fullName: true } } } }),
      this.prisma.supportTicket.count({ where }),
    ]);
    return { tickets, total, page: Number(page), totalPages: Math.ceil(total / take) };
  }

  @Put(':id')
  async updateTicket(@Param('id') id: string, @Body('status') status: string) {
    return this.prisma.supportTicket.update({ where: { id }, data: { status } });
  }
}

@Controller('api/support-tickets')
export class PublicSupportController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createTicket(
    @CurrentUser('id') userId: string,
    @Body('subject') subject: string,
    @Body('description') description: string,
  ) {
    return this.prisma.supportTicket.create({
      data: {
        userId,
        subject,
        description,
        status: 'OPEN',
      },
    });
  }
}
