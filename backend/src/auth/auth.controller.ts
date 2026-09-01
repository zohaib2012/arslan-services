import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  VerifyOtpDto,
  SendOtpDto,
  GuestLoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  AdminRequestOtpDto,
  AdminVerifyOtpDto,
} from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('login/guest')
  @HttpCode(HttpStatus.OK)
  async guestLogin(@Body() dto: GuestLoginDto) {
    return this.authService.guestLogin(dto);
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto.phone);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.phone, dto.otp);
  }

  @Post('admin/request-otp')
  @HttpCode(HttpStatus.OK)
  async requestAdminOtp(@Body() dto: AdminRequestOtpDto) {
    return this.authService.requestAdminOtp(dto.email);
  }

  @Post('admin/verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyAdminOtp(@Body() dto: AdminVerifyOtpDto) {
    return this.authService.verifyAdminOtp(dto.email, dto.otp);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.identifier);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }
}
