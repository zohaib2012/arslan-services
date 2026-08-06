import { Controller, Get, Put, Delete, Param, Query, Body, UseGuards, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/admin/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminCustomersController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getCustomers(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search = '',
    @Query('isBlocked') isBlocked = '',
  ) {
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = { role: 'CUSTOMER' };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isBlocked) {
      where.isBlocked = isBlocked === 'true';
    }

    const [customers, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          profilePhoto: true,
          isBlocked: true,
          blockReason: true,
          createdAt: true,
          _count: { select: { customerBookings: true } },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { customers, total, page: Number(page) || 1, totalPages: Math.ceil(total / take) };
  }

  @Get(':id')
  async getCustomer(@Param('id') id: string) {
    const customer = await this.prisma.user.findFirst({
      where: { id, role: 'CUSTOMER' },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        profilePhoto: true,
        isBlocked: true,
        blockReason: true,
        isGuest: true,
        languagePreference: true,
        createdAt: true,
        updatedAt: true,
        customerBookings: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            worker: { include: { user: { select: { fullName: true } } } },
            service: { select: { nameEn: true } },
          },
        },
        reviews: { take: 10, orderBy: { createdAt: 'desc' }, include: { worker: { include: { user: { select: { fullName: true } } } } } },
        _count: { select: { customerBookings: true, reviews: true } },
      },
    });

    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  @Put(':id/block')
  async blockCustomer(
    @Param('id') id: string,
    @Body('isBlocked') isBlocked: boolean,
    @Body('blockReason') blockReason: string,
  ) {
    const user = await this.prisma.user.findFirst({ where: { id, role: 'CUSTOMER' } });
    if (!user) throw new NotFoundException('Customer not found');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isBlocked, blockReason: isBlocked ? blockReason : null },
      select: { id: true, fullName: true, isBlocked: true, blockReason: true },
    });

    return updated;
  }

  @Delete(':id')
  async deleteCustomer(@Param('id') id: string) {
    const user = await this.prisma.user.findFirst({ where: { id, role: 'CUSTOMER' } });
    if (!user) throw new NotFoundException('Customer not found');

    await this.prisma.user.delete({ where: { id } });
    return { message: 'Customer deleted successfully' };
  }
}
