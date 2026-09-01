import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../config/database.config';
import { RedisService } from '../config/redis.config';
import { ResendService } from '../config/resend.config';
import { RegisterDto, LoginDto, GuestLoginDto } from './dto/register.dto';
import { UserRole } from '../generated/prisma';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private redisService: RedisService,
    private resendService: ResendService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          ...(dto.email ? [{ email: dto.email }] : []),
          ...(dto.phone ? [{ phone: dto.phone }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email or phone already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        fullName: dto.fullName,
        role: dto.role,
        languagePreference: dto.languagePreference || 'ENGLISH',
        ...(dto.role === 'WORKER' && {
          workerProfile: {
            create: {
              verificationStatus: 'PENDING',
            },
          },
        }),
      },
      include: {
        workerProfile: true,
        adminUser: true,
      },
    });

    await this.notifyAdminsAboutNewUser(user);

    const tokens = await this.generateTokens(user.id, user.role);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.identifier }, { phone: dto.identifier }],
      },
      include: {
        workerProfile: true,
        adminUser: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('Account is blocked');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      throw new UnauthorizedException(
        'Admins must verify via email OTP. Please use the admin login page.',
      );
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.role);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async guestLogin(dto: GuestLoginDto) {
    const guestId = `guest_${uuid()}`;
    const guestExpiry = new Date();
    guestExpiry.setDate(guestExpiry.getDate() + 30);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        role: 'CUSTOMER',
        isGuest: true,
        guestExpiresAt: guestExpiry,
        languagePreference: dto.languagePreference || 'ENGLISH',
      },
    });

    const payload = { sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken: null,
    };
  }

  async sendOtp(phone: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.redisService.set(
      `otp:${phone}`,
      otp,
      5 * 60,
    );

    // Store OTP in the request - Resend SMS integration
    // For development, we return OTP (remove in production)
    console.log(`OTP sent to ${phone}: ${otp}`);

    return { message: 'OTP sent successfully', phone };
  }

  async verifyOtp(phone: string, otp: string) {
    const storedOtp = await this.redisService.get(`otp:${phone}`);

    if (!storedOtp || storedOtp !== otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.redisService.del(`otp:${phone}`);

    let user = await this.prisma.user.findUnique({
      where: { phone },
      include: { workerProfile: true, adminUser: true },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          phoneVerified: true,
          fullName: 'User',
          role: 'CUSTOMER',
        },
        include: { workerProfile: true, adminUser: true },
      });
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: true },
      });
    }

    const tokens = await this.generateTokens(user.id, user.role);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async requestAdminOtp(email: string, password: string) {
    const normalized = (email || '').trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: { email: normalized, role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
    });

    if (!user || user.isBlocked || !user.passwordHash) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redisService.set(`admin-otp:${normalized}`, otp, 2 * 60);

    try {
      await this.resendService.sendOtpEmail(normalized, otp);
    } catch (err) {
      console.error('Failed to send admin OTP email:', (err as Error)?.message || err);
    }

    return { message: 'OTP sent to your admin email' };
  }

  async verifyAdminOtp(email: string, otp: string) {
    const normalized = (email || '').trim().toLowerCase();
    const storedOtp = await this.redisService.get(`admin-otp:${normalized}`);

    if (!storedOtp || storedOtp !== otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    await this.redisService.del(`admin-otp:${normalized}`);

    const user = await this.prisma.user.findFirst({
      where: { email: normalized, role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
      include: { workerProfile: true, adminUser: true },
    });

    if (!user || user.isBlocked) {
      throw new UnauthorizedException('Account not found or blocked');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.role);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret' });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { workerProfile: true, adminUser: true },
      });

      if (!user || user.isBlocked) {
        throw new UnauthorizedException();
      }

      if (!user.refreshTokenHash) {
        throw new UnauthorizedException('No refresh token stored');
      }

      const isTokenValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      if (!isTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user.id, user.role);
      return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null, fcmToken: null },
    });
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(identifier: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
    });

    if (!user) {
      return { message: 'If account exists, reset link has been sent' };
    }

    const resetToken = uuid();
    await this.redisService.set(`reset:${resetToken}`, user.id, 15 * 60);

    if (user.email) {
      // Send email via Resend with reset link
      console.log(`Password reset for ${user.email}: token=${resetToken}`);
    }

    return { message: 'If account exists, reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const userId = await this.redisService.get(`reset:${token}`);
    if (!userId) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await this.redisService.del(`reset:${token}`);
    return { message: 'Password reset successfully' };
  }

  private async notifyAdminsAboutNewUser(user: any) {
    try {
      const admins = await this.prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] }, isBlocked: false },
        select: { id: true },
      });

      if (admins.length === 0) return;

      const isWorker = user.role === 'WORKER';
      const title = isWorker ? 'New Worker Registered' : 'New Customer Registered';
      const body = isWorker
        ? `${user.fullName} registered as a worker and needs verification. Contact: ${user.email || user.phone || 'N/A'}`
        : `${user.fullName} created a customer account. Contact: ${user.email || user.phone || 'N/A'}`;

      await this.prisma.notification.createMany({
        data: admins.map((a) => ({
          userId: a.id,
          type: 'PROMOTION' as any,
          title,
          body,
          data: { kind: 'NEW_USER', role: user.role, userId: user.id, name: user.fullName },
        })),
      });
    } catch (err) {
      console.error('Failed to notify admins about new user:', err);
    }
  }

  private async generateTokens(userId: string, role: UserRole) {
    const payload = { sub: userId, role };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, { secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret' });

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: await bcrypt.hash(refreshToken, 6) },
    });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, refreshTokenHash, ...rest } = user;
    return rest;
  }
}
