import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../config/database.config';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async add(userId: string, workerId: string) {
    const worker = await this.prisma.workerProfile.findUnique({
      where: { id: workerId },
    });

    if (!worker) throw new NotFoundException('Worker not found');

    const existing = await this.prisma.favorite.findUnique({
      where: {
        customerId_workerId: {
          customerId: userId,
          workerId,
        },
      },
    });

    if (existing) throw new BadRequestException('Already in favorites');

    return this.prisma.favorite.create({
      data: { customerId: userId, workerId },
      include: {
        worker: {
          include: {
            user: { select: { id: true, fullName: true, profilePhoto: true } },
          },
        },
      },
    });
  }

  async remove(userId: string, workerId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        customerId_workerId: {
          customerId: userId,
          workerId,
        },
      },
    });

    if (!favorite) throw new NotFoundException('Favorite not found');

    await this.prisma.favorite.delete({
      where: {
        customerId_workerId: {
          customerId: userId,
          workerId,
        },
      },
    });

    return { message: 'Removed from favorites' };
  }

  async myFavorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: { customerId: userId },
      include: {
        worker: {
          include: {
            user: { select: { id: true, fullName: true, profilePhoto: true, phone: true } },
            workerServices: {
              include: { service: { select: { id: true, nameEn: true, nameUr: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async check(userId: string, workerId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        customerId_workerId: {
          customerId: userId,
          workerId,
        },
      },
    });

    return { isFavorite: !!favorite };
  }
}
