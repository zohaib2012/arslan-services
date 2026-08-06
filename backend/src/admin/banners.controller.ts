import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/admin/banners')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminBannersController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getBanners(@Query('page') page = '1', @Query('limit') limit = '20') {
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [banners, total] = await Promise.all([
      this.prisma.banner.findMany({
        skip,
        take,
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.banner.count(),
    ]);

    return { banners, total, page: Number(page) || 1, totalPages: Math.ceil(total / take) };
  }

  @Post()
  async createBanner(
    @Body('title') title: string,
    @Body('imageUrl') imageUrl: string,
    @Body('redirectTo') redirectTo: string,
    @Body('targetAudience') targetAudience: string[],
    @Body('startDate') startDate: string,
    @Body('endDate') endDate: string,
    @Body('sortOrder') sortOrder: number,
  ) {
    return this.prisma.banner.create({
      data: {
        title,
        imageUrl,
        redirectTo,
        targetAudience: (targetAudience || ['CUSTOMER']) as any,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sortOrder: sortOrder || 0,
      },
    });
  }

  @Put(':id')
  async updateBanner(
    @Param('id') id: string,
    @Body('title') title: string,
    @Body('imageUrl') imageUrl: string,
    @Body('redirectTo') redirectTo: string,
    @Body('targetAudience') targetAudience: string[],
    @Body('isActive') isActive: boolean,
    @Body('startDate') startDate: string,
    @Body('endDate') endDate: string,
    @Body('sortOrder') sortOrder: number,
  ) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');

    return this.prisma.banner.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(redirectTo !== undefined && { redirectTo }),
        ...(targetAudience !== undefined && { targetAudience: targetAudience as any }),
        ...(isActive !== undefined && { isActive }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: new Date(endDate) }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });
  }

  @Delete(':id')
  async deleteBanner(@Param('id') id: string) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');

    await this.prisma.banner.delete({ where: { id } });
    return { message: 'Banner deleted successfully' };
  }
}
