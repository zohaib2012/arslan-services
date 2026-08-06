import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/admin/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminCategoriesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getCategories(@Query('page') page = '1', @Query('limit') limit = '20') {
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        skip,
        take,
        orderBy: { sortOrder: 'asc' },
        include: { _count: { select: { services: true } } },
      }),
      this.prisma.category.count(),
    ]);

    return { categories, total, page: Number(page) || 1, totalPages: Math.ceil(total / take) };
  }

  @Get(':id')
  async getCategory(@Param('id') id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { services: true, _count: { select: { services: true } } },
    });

    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  @Post()
  async createCategory(
    @Body('nameEn') nameEn: string,
    @Body('nameUr') nameUr: string,
    @Body('slug') slug: string,
    @Body('iconUrl') iconUrl: string,
    @Body('descriptionEn') descriptionEn: string,
    @Body('descriptionUr') descriptionUr: string,
    @Body('sortOrder') sortOrder: number,
  ) {
    const existing = await this.prisma.category.findFirst({
      where: { OR: [{ slug }, { nameEn }] },
    });
    if (existing) throw new ConflictException('Category with this slug or name already exists');

    return this.prisma.category.create({
      data: {
        nameEn,
        nameUr: nameUr || nameEn,
        slug,
        iconUrl,
        descriptionEn,
        descriptionUr,
        sortOrder: sortOrder || 0,
      },
    });
  }

  @Put(':id')
  async updateCategory(
    @Param('id') id: string,
    @Body('nameEn') nameEn: string,
    @Body('nameUr') nameUr: string,
    @Body('slug') slug: string,
    @Body('iconUrl') iconUrl: string,
    @Body('descriptionEn') descriptionEn: string,
    @Body('descriptionUr') descriptionUr: string,
    @Body('sortOrder') sortOrder: number,
  ) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    if (slug && slug !== category.slug) {
      const conflict = await this.prisma.category.findUnique({ where: { slug } });
      if (conflict) throw new ConflictException('Slug already in use');
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(nameEn !== undefined && { nameEn }),
        ...(nameUr !== undefined && { nameUr }),
        ...(slug !== undefined && { slug }),
        ...(iconUrl !== undefined && { iconUrl }),
        ...(descriptionEn !== undefined && { descriptionEn }),
        ...(descriptionUr !== undefined && { descriptionUr }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });
  }

  @Put(':id/toggle')
  async toggleCategory(@Param('id') id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    return this.prisma.category.update({
      where: { id },
      data: { isActive: !category.isActive },
    });
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    await this.prisma.category.delete({ where: { id } });
    return { message: 'Category deleted successfully' };
  }
}
