import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../config/database.config';

@Controller('api/banners')
export class BannersController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getActiveBanners() {
    const now = new Date();

    const banners = await this.prisma.banner.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return { banners };
  }
}
