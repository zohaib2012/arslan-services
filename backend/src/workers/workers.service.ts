import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import {
  UpdateWorkerProfileDto,
  UpdateOnlineStatusDto,
  UpdateWorkingHoursDto,
  AddPortfolioDto,
  AddPaymentMethodDto,
  AddServiceAreaDto,
  UpdateWorkerServicesDto,
} from './dto/worker.dto';

@Injectable()
export class WorkersService {
  constructor(private prisma: PrismaService) {}

  async getWorkers(query: any) {
    const { serviceId, city, search, rating, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      verificationStatus: 'VERIFIED',
      isOnline: true,
    };

    if (serviceId) {
      where.workerServices = { some: { serviceId } };
    }

    if (city) {
      where.serviceAreas = { some: { city: { contains: city, mode: 'insensitive' } } };
    }

    if (search) {
      where.OR = [
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (rating) {
      where.avgRating = { gte: Number(rating) };
    }

    const [workers, total] = await Promise.all([
      this.prisma.workerProfile.findMany({
        where,
        include: {
          user: { select: { id: true, fullName: true, profilePhoto: true, phone: true } },
          workerServices: { include: { service: true } },
          serviceAreas: true,
          paymentMethods: true,
        },
        skip,
        take: Number(limit),
        orderBy: [{ avgRating: 'desc' }, { completedJobs: 'desc' }],
      }),
      this.prisma.workerProfile.count({ where }),
    ]);

    return { workers, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
  }

  async getNearbyWorkers(lat: number, lng: number, radiusKm = 10) {
    const workers = await this.prisma.workerProfile.findMany({
      where: {
        verificationStatus: 'VERIFIED',
        isOnline: true,
        serviceAreas: {
          some: {
            latitude: { not: null },
            longitude: { not: null },
          },
        },
      },
      include: {
        user: { select: { id: true, fullName: true, profilePhoto: true, phone: true } },
        workerServices: { include: { service: true } },
        serviceAreas: true,
        paymentMethods: true,
      },
    });

    return workers.filter((worker) => {
      return worker.serviceAreas.some((area) => {
        if (!area.latitude || !area.longitude) return false;
        const distance = this.calculateDistance(
          lat, lng,
          Number(area.latitude), Number(area.longitude),
        );
        return distance <= (area.radiusKm || radiusKm);
      });
    });
  }

  async searchWorkers(query: string) {
    return this.prisma.workerProfile.findMany({
      where: {
        verificationStatus: 'VERIFIED',
        OR: [
          { user: { fullName: { contains: query, mode: 'insensitive' } } },
          { description: { contains: query, mode: 'insensitive' } },
          { workerServices: { some: { service: { nameEn: { contains: query, mode: 'insensitive' } } } } },
          { serviceAreas: { some: { city: { contains: query, mode: 'insensitive' } } } },
        ],
      },
      include: {
        user: { select: { id: true, fullName: true, profilePhoto: true, phone: true } },
        workerServices: { include: { service: true } },
        serviceAreas: true,
        paymentMethods: true,
      },
      take: 20,
    });
  }

  async getWorkerById(workerId: string) {
    const worker = await this.prisma.workerProfile.findUnique({
      where: { id: workerId },
      include: {
        user: { select: { id: true, fullName: true, profilePhoto: true, phone: true } },
        portfolio: { orderBy: { sortOrder: 'asc' } },
        workerServices: { include: { service: { include: { category: true } } } },
        serviceAreas: true,
        paymentMethods: true,
      },
    });

    if (!worker) throw new NotFoundException('Worker not found');
    return worker;
  }

  async getWorkerReviews(workerId: string, page = 1, limit = 20) {
    const skip = (Number(page) - 1) * Number(limit);
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { workerId, isVisible: true },
        include: {
          customer: { select: { id: true, fullName: true, profilePhoto: true } },
          booking: { select: { serviceId: true, createdAt: true } },
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where: { workerId, isVisible: true } }),
    ]);

    return { reviews, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
  }

  async getWorkerProfile(userId: string) {
    const profile = await this.prisma.workerProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, fullName: true, profilePhoto: true, phone: true, email: true } },
        portfolio: { orderBy: { sortOrder: 'asc' } },
        workerServices: { include: { service: { include: { category: true } } } },
        serviceAreas: true,
        paymentMethods: true,
      },
    });

    if (!profile) throw new NotFoundException('Worker profile not found');
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateWorkerProfileDto) {
    const profile = await this.prisma.workerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Worker profile not found');

    return this.prisma.workerProfile.update({
      where: { userId },
      data: dto,
    });
  }

  async toggleOnlineStatus(userId: string, dto: UpdateOnlineStatusDto) {
    await this.prisma.workerProfile.update({
      where: { userId },
      data: { isOnline: dto.isOnline },
    });
    return { isOnline: dto.isOnline };
  }

  async updateWorkingHours(userId: string, dto: UpdateWorkingHoursDto) {
    await this.prisma.workerProfile.update({
      where: { userId },
      data: { workingHoursJson: dto.workingHours as any },
    });
    return { workingHours: dto.workingHours };
  }

  async addPortfolio(userId: string, dto: AddPortfolioDto) {
    const profile = await this.prisma.workerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Worker profile not found');

    return this.prisma.workerPortfolio.create({
      data: {
        workerId: profile.id,
        mediaUrl: dto.mediaUrl,
        mediaType: dto.mediaType,
        caption: dto.caption,
      },
    });
  }

  async removePortfolio(userId: string, portfolioId: string) {
    const profile = await this.prisma.workerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Worker profile not found');

    await this.prisma.workerPortfolio.deleteMany({
      where: { id: portfolioId, workerId: profile.id },
    });
    return { message: 'Portfolio item removed' };
  }

  async updateServices(userId: string, dto: UpdateWorkerServicesDto) {
    const profile = await this.prisma.workerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Worker profile not found');

    await this.prisma.workerService.deleteMany({ where: { workerId: profile.id } });

    if (dto.serviceIds.length > 0) {
      await this.prisma.workerService.createMany({
        data: dto.serviceIds.map((serviceId) => ({
          workerId: profile.id,
          serviceId,
        })),
      });
    }

    return this.prisma.workerService.findMany({
      where: { workerId: profile.id },
      include: { service: true },
    });
  }

  async updateServiceAreas(userId: string, areas: AddServiceAreaDto[]) {
    const profile = await this.prisma.workerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Worker profile not found');

    await this.prisma.workerServiceArea.deleteMany({ where: { workerId: profile.id } });

    if (areas.length > 0) {
      await this.prisma.workerServiceArea.createMany({
        data: areas.map((area) => ({
          workerId: profile.id,
          city: area.city,
          area: area.area,
          latitude: area.latitude,
          longitude: area.longitude,
          radiusKm: area.radiusKm,
        })),
      });
    }

    return this.prisma.workerServiceArea.findMany({ where: { workerId: profile.id } });
  }

  async addPaymentMethod(userId: string, dto: AddPaymentMethodDto) {
    const profile = await this.prisma.workerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Worker profile not found');

    if (dto.isDefault) {
      await this.prisma.workerPaymentMethod.updateMany({
        where: { workerId: profile.id },
        data: { isDefault: false },
      });
    }

    return this.prisma.workerPaymentMethod.create({
      data: {
        workerId: profile.id,
        methodType: dto.methodType,
        accountNumber: dto.accountNumber,
        accountTitle: dto.accountTitle,
        bankName: dto.bankName,
        isDefault: dto.isDefault || false,
      },
    });
  }

  async removePaymentMethod(userId: string, methodId: string) {
    const profile = await this.prisma.workerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Worker profile not found');

    await this.prisma.workerPaymentMethod.deleteMany({
      where: { id: methodId, workerId: profile.id },
    });
    return { message: 'Payment method removed' };
  }

  async getWorkerStats(userId: string) {
    const profile = await this.prisma.workerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Worker profile not found');

    const [todayBookings, pendingBookings, totalCompleted, totalEarnings] = await Promise.all([
      this.prisma.booking.count({
        where: { workerId: profile.id, createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      }),
      this.prisma.booking.count({
        where: { workerId: profile.id, status: 'PENDING' },
      }),
      this.prisma.booking.count({
        where: { workerId: profile.id, status: 'COMPLETED' },
      }),
      this.prisma.booking.aggregate({
        where: { workerId: profile.id, status: 'COMPLETED' },
        _sum: { priceEstimate: true },
      }),
    ]);

    return {
      todayBookings,
      pendingBookings,
      totalCompleted,
      totalEarnings: totalEarnings._sum.priceEstimate || 0,
      avgRating: profile.avgRating,
      completedJobs: profile.completedJobs,
    };
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
