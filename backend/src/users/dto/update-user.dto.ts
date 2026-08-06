import { IsString, IsOptional, IsEnum, IsEmail } from 'class-validator';
import { Language } from '../../../generated/prisma';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(Language)
  @IsOptional()
  languagePreference?: Language;
}

export class UpdateFcmTokenDto {
  @IsString()
  fcmToken: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  newPassword: string;
}
