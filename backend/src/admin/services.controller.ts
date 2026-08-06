import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/admin/services')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminServicesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getServices(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('categoryId') categoryId = '',
  ) {
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;

    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip,
        take,
        orderBy: { sortOrder: 'asc' },
        include: {
          category: { select: { id: true, nameEn: true } },
          _count: { select: { workerServices: true, bookings: true } },
        },
      }),
      this.prisma.service.count({ where }),
    ]);

    return { services, total, page: Number(page) || 1, totalPages: Math.ceil(total / take) };
  }

  @Get(':id')
  async getService(@Param('id') id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        category: true,
        _count: { select: { workerServices: true, bookings: true } },
      },
    });

    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  @Post()
  async createService(
    @Body('categoryId') categoryId: string,
    @Body('nameEn') nameEn: string,
    @Body('nameUr') nameUr: string,
    @Body('slug') slug: string,
    @Body('iconUrl') iconUrl: string,
    @Body('descriptionEn') descriptionEn: string,
    @Body('descriptionUr') descriptionUr: string,
    @Body('sortOrder') sortOrder: number,
  ) {
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw new NotFoundException('Category not found');

    const existing = await this.prisma.service.findFirst({
      where: { OR: [{ slug }, { nameEn, categoryId }] },
    });
    if (existing) throw new ConflictException('Service with this slug or name in this category already exists');

    return this.prisma.service.create({
      data: {
        categoryId,
        nameEn,
        nameUr: nameUr || nameEn,
        slug,
        iconUrl,
        descriptionEn,
        descriptionUr,
        sortOrder: sortOrder || 0,
      },
      include: { category: { select: { id: true, nameEn: true } } },
    });
  }

  @Put(':id')
  async updateService(
    @Param('id') id: string,
    @Body('categoryId') categoryId: string,
    @Body('nameEn') nameEn: string,
    @Body('nameUr') nameUr: string,
    @Body('slug') slug: string,
    @Body('iconUrl') iconUrl: string,
    @Body('descriptionEn') descriptionEn: string,
    @Body('descriptionUr') descriptionUr: string,
    @Body('sortOrder') sortOrder: number,
    @Body('isActive') isActive: boolean,
  ) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');

    if (slug && slug !== service.slug) {
      const conflict = await this.prisma.service.findUnique({ where: { slug } });
      if (conflict) throw new ConflictException('Slug already in use');
    }

    if (categoryId) {
      const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) throw new NotFoundException('Category not found');
    }

    return this.prisma.service.update({
      where: { id },
      data: {
        ...(categoryId !== undefined && { categoryId }),
        ...(nameEn !== undefined && { nameEn }),
        ...(nameUr !== undefined && { nameUr }),
        ...(slug !== undefined && { slug }),
        ...(iconUrl !== undefined && { iconUrl }),
        ...(descriptionEn !== undefined && { descriptionEn }),
        ...(descriptionUr !== undefined && { descriptionUr }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
      include: { category: { select: { id: true, nameEn: true } } },
    });
  }

  @Put(':id/toggle')
  async toggleService(@Param('id') id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');

    return this.prisma.service.update({
      where: { id },
      data: { isActive: !service.isActive },
    });
  }

  @Delete(':id')
  async deleteService(@Param('id') id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');

    await this.prisma.service.delete({ where: { id } });
    return { message: 'Service deleted successfully' };
  }
}
