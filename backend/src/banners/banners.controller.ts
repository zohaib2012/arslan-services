import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { RedisService } from '../config/redis.config';

@Controller('api/banners')
export class BannersController {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  @Get()
  async getActiveBanners() {
    return this.redis.remember('cache:banners', 3600, async () => {
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
    });
  }
}
