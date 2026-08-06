import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/database.config';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      include: {
        services: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        services: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!category) throw new NotFoundException('Category not found');
    return category;
  }
}
