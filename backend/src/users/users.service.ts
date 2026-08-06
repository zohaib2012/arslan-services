import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../config/database.config';
import { UpdateUserDto, ChangePasswordDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        workerProfile: {
          include: {
            portfolio: true,
            paymentMethods: true,
            serviceAreas: true,
            workerServices: { include: { service: true } },
          },
        },
        adminUser: { include: { role: true } },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, refreshTokenHash, ...profile } = user;
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      include: {
        workerProfile: true,
        adminUser: true,
      },
    });
    const { passwordHash, refreshTokenHash, ...profile } = user;
    return profile;
  }

  async updatePhoto(userId: string, photoUrl: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { profilePhoto: photoUrl },
    });
    return { profilePhoto: user.profilePhoto };
  }

  async updateFcmToken(userId: string, fcmToken: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { fcmToken },
    });
    return { message: 'FCM token updated' };
  }

  async updateLanguage(userId: string, language: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { languagePreference: language as any },
    });
    return { message: 'Language updated' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      throw new BadRequestException('No password set for this account');
    }

    const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isValid) throw new BadRequestException('Current password is incorrect');

    const newHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return { message: 'Password changed successfully' };
  }

  async deleteAccount(userId: string) {
    await this.prisma.user.delete({ where: { id: userId } });
    return { message: 'Account deleted' };
  }
}
