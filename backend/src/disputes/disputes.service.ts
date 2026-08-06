import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { CreateDisputeDto, UploadEvidenceDto } from './dto/dispute.dto';

@Injectable()
export class DisputesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateDisputeDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    const isCustomer = booking.customerId === userId;
    const isWorker = await this.prisma.workerProfile
      .findFirst({ where: { id: booking.workerId, userId } })
      .then((w) => !!w);

    if (!isCustomer && !isWorker) {
      throw new BadRequestException('You are not part of this booking');
    }

    const existing = await this.prisma.dispute.findFirst({
      where: { bookingId: dto.bookingId, status: { not: 'DISMISSED' } },
    });

    if (existing) throw new BadRequestException('An active dispute already exists for this booking');

    const dispute = await this.prisma.dispute.create({
      data: {
        bookingId: dto.bookingId,
        raisedBy: userId,
        raisedByRole: isCustomer ? 'CUSTOMER' : 'WORKER',
        reason: dto.reason,
        description: dto.description,
      },
      include: {
        booking: {
          include: {
            customer: { select: { id: true, fullName: true } },
            worker: {
              include: { user: { select: { id: true, fullName: true } } },
            },
            service: { select: { id: true, nameEn: true } },
          },
        },
        evidence: true,
      },
    });

    await this.prisma.booking.update({
      where: { id: dto.bookingId },
      data: { isDisputed: true, status: 'DISPUTED' },
    });

    return dispute;
  }

  async getMyDisputes(userId: string) {
    return this.prisma.dispute.findMany({
      where: { raisedBy: userId },
      include: {
        booking: {
          include: {
            customer: { select: { id: true, fullName: true } },
            worker: {
              include: { user: { select: { id: true, fullName: true } } },
            },
            service: { select: { id: true, nameEn: true } },
          },
        },
        evidence: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(userId: string, id: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            customer: { select: { id: true, fullName: true, phone: true } },
            worker: {
              include: { user: { select: { id: true, fullName: true, phone: true } } },
            },
            service: { select: { id: true, nameEn: true } },
          },
        },
        evidence: {
          include: { uploader: { select: { id: true, fullName: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!dispute) throw new NotFoundException('Dispute not found');

    if (
      dispute.raisedBy !== userId &&
      dispute.booking.worker.userId !== userId
    ) {
      throw new BadRequestException('Access denied');
    }

    return dispute;
  }

  async addEvidence(userId: string, disputeId: string, dto: UploadEvidenceDto) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) throw new NotFoundException('Dispute not found');

    if (!['OPEN', 'UNDER_REVIEW'].includes(dispute.status)) {
      throw new BadRequestException('Cannot add evidence to a closed dispute');
    }

    return this.prisma.disputeEvidence.create({
      data: {
        disputeId,
        uploadedBy: userId,
        fileUrl: dto.fileUrl,
        fileType: dto.fileType,
        caption: dto.caption,
      },
      include: { uploader: { select: { id: true, fullName: true } } },
    });
  }
}
