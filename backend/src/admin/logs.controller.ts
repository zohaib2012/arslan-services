import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/admin/activity-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminLogsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getLogs(@Query('page') page = '1', @Query('limit') limit = '30') {
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({ skip, take, orderBy: { createdAt: 'desc' }, include: { admin: { select: { fullName: true } } } }),
      this.prisma.activityLog.count(),
    ]);
    return { logs, total, page: Number(page), totalPages: Math.ceil(total / take) };
  }
}
