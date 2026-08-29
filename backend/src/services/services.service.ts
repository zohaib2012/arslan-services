import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { RedisService } from '../config/redis.config';

@Injectable()
export class ServicesService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async findAll(categoryId?: string) {
    const key = `cache:services:${categoryId || 'all'}`;
    return this.redis.remember(key, 3600, () => {
      const where: any = { isActive: true };
      if (categoryId) where.categoryId = categoryId;

      return this.prisma.service.findMany({
        where,
        include: {
          category: { select: { id: true, nameEn: true, nameUr: true, slug: true } },
        },
        orderBy: { sortOrder: 'asc' },
      });
    });
  }

  async findByCategory(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) throw new NotFoundException('Category not found');

    return this.prisma.service.findMany({
      where: { categoryId, isActive: true },
      include: {
        category: { select: { id: true, nameEn: true, nameUr: true, slug: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async search(query: string) {
    return this.prisma.service.findMany({
      where: {
        isActive: true,
        OR: [
          { nameEn: { contains: query, mode: 'insensitive' } },
          { nameUr: { contains: query, mode: 'insensitive' } },
          { descriptionEn: { contains: query, mode: 'insensitive' } },
          { descriptionUr: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        category: { select: { id: true, nameEn: true, nameUr: true, slug: true } },
      },
      take: 20,
    });
  }

  async findById(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        category: true,
        workerServices: {
          where: { worker: { verificationStatus: 'VERIFIED', isOnline: true } },
          include: {
            worker: {
              include: {
                user: { select: { id: true, fullName: true, profilePhoto: true } },
              },
            },
          },
        },
      },
    });

    if (!service) throw new NotFoundException('Service not found');
    return service;
  }
}
