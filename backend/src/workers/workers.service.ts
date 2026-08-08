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
  SubmitVerificationDto,
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
    const q = (query || '').trim();
    const stopWords = new Set([
      'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'is', 'are', 'my',
      'i', 'me', 'we', 'need', 'needs', 'find', 'please', 'help', 'want', 'would',
      'some', 'any', 'this', 'that', 'with', 'and', 'or', 'from', 'near', 'around',
      'fix', 'repair', 'get', 'service', 'have', 'has', 'do', 'does', 'can', 'you',
    ]);

    const include = {
      user: { select: { id: true, fullName: true, profilePhoto: true, phone: true } },
      workerServices: { include: { service: { include: { category: true } } } },
      serviceAreas: true,
      paymentMethods: true,
    };

    if (!q) {
      return this.prisma.workerProfile.findMany({
        where: { verificationStatus: 'VERIFIED' },
        include,
        take: 20,
      });
    }

    const words = q.toLowerCase().split(/\s+/).filter((w) => w.length >= 2 && !stopWords.has(w));
    const where: any = { verificationStatus: 'VERIFIED' };

    if (words.length === 0) {
      where.OR = [
        { user: { fullName: { contains: q, mode: 'insensitive' } } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
      return this.prisma.workerProfile.findMany({ where, include, take: 20 });
    }

    // Any word matching ANY worker detail field (name, service, category, city, area, description)
    const orConditions: any[] = [];
    for (const w of words) {
      orConditions.push(
        { user: { fullName: { contains: w, mode: 'insensitive' } } },
        { description: { contains: w, mode: 'insensitive' } },
        { workerServices: { some: { service: { nameEn: { contains: w, mode: 'insensitive' } } } } },
        { workerServices: { some: { service: { nameUr: { contains: w, mode: 'insensitive' } } } } },
        { workerServices: { some: { service: { category: { nameEn: { contains: w, mode: 'insensitive' } } } } } },
        { serviceAreas: { some: { city: { contains: w, mode: 'insensitive' } } } },
        { serviceAreas: { some: { area: { contains: w, mode: 'insensitive' } } } },
      );
    }
    where.OR = orConditions;

    const workers = await this.prisma.workerProfile.findMany({
      where,
      include,
      take: 50,
    });

    // Rank by relevance: count how many query words match the worker's details
    const scored = workers
      .map((w) => {
        const haystack = [
          w.user?.fullName || '',
          w.description || '',
          ...(w.workerServices || []).flatMap((ws) => [
            ws.service?.nameEn,
            ws.service?.nameUr,
            ws.service?.category?.nameEn,
          ]),
          ...(w.serviceAreas || []).flatMap((a) => [a.city, a.area]),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        let score = 0;
        for (const wd of words) {
          if (haystack.includes(wd)) score++;
        }
        if (haystack.includes(q.toLowerCase())) score += 3;
        if (w.isOnline) score += 0.5;
        return { worker: w, score };
      })
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, 20).map((s) => s.worker);
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

    const { profilePhoto, ...profileData } = dto;
    const hasProfileData = Object.keys(profileData).length > 0;

    if (profilePhoto) {
      await this.prisma.user.update({ where: { id: userId }, data: { profilePhoto } });
    }

    if (!hasProfileData) {
      return this.prisma.workerProfile.findUnique({ where: { userId } });
    }

    return this.prisma.workerProfile.update({
      where: { userId },
      data: profileData,
    });
  }

  async toggleOnlineStatus(userId: string, dto: UpdateOnlineStatusDto) {
    await this.prisma.workerProfile.update({
      where: { userId },
      data: { isOnline: dto.isOnline },
    });
    return { isOnline: dto.isOnline };
  }

  async submitVerification(userId: string, dto: SubmitVerificationDto) {
    const profile = await this.prisma.workerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Worker profile not found');

    const data: any = {};
    if (dto.cnicNumber) data.cnicNumber = dto.cnicNumber;
    if (dto.cnicFront) data.cnicFront = dto.cnicFront;
    if (dto.cnicBack) data.cnicBack = dto.cnicBack;
    if (profile.verificationStatus === 'PENDING' || profile.verificationStatus === 'REJECTED') {
      data.verificationStatus = 'PENDING';
    }

    return this.prisma.workerProfile.update({
      where: { userId },
      data,
    });
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
