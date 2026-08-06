import { Controller, Get, Put, Delete, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateUserDto, UpdateFcmTokenDto, ChangePasswordDto } from './dto/update-user.dto';

@Controller('api/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Put('me')
  async updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Put('me/fcm-token')
  async updateFcmToken(@CurrentUser('id') userId: string, @Body() dto: UpdateFcmTokenDto) {
    return this.usersService.updateFcmToken(userId, dto.fcmToken);
  }

  @Put('me/language')
  async updateLanguage(@CurrentUser('id') userId: string, @Body('language') language: string) {
    return this.usersService.updateLanguage(userId, language);
  }

  @Put('me/password')
  async changePassword(@CurrentUser('id') userId: string, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(userId, dto);
  }

  @Delete('me')
  async deleteAccount(@CurrentUser('id') userId: string) {
    return this.usersService.deleteAccount(userId);
  }
}
