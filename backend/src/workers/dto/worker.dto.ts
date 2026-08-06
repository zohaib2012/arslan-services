import { IsString, IsOptional, IsInt, IsBoolean, IsArray, IsEnum, Min, Max } from 'class-validator';
import { PaymentMethodType, Language } from '../../../generated/prisma';

export class UpdateWorkerProfileDto {
  @IsInt()
  @IsOptional()
  @Min(0)
  experienceYears?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(Language, { each: true })
  @IsOptional()
  languages?: Language[];
}

export class UpdateOnlineStatusDto {
  @IsBoolean()
  isOnline: boolean;
}

export class UpdateWorkingHoursDto {
  @IsArray()
  workingHours: WorkingHourDay[];
}

export class WorkingHourDay {
  @IsString()
  day: string;

  @IsBoolean()
  enabled: boolean;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;
}

export class AddPortfolioDto {
  @IsString()
  mediaUrl: string;

  @IsString()
  mediaType: string;

  @IsString()
  @IsOptional()
  caption?: string;
}

export class AddPaymentMethodDto {
  @IsEnum(PaymentMethodType)
  methodType: PaymentMethodType;

  @IsString()
  accountNumber: string;

  @IsString()
  accountTitle: string;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class AddServiceAreaDto {
  @IsString()
  city: string;

  @IsString()
  area: string;

  @IsOptional()
  latitude?: number;

  @IsOptional()
  longitude?: number;

  @IsInt()
  @IsOptional()
  radiusKm?: number;
}

export class UpdateWorkerServicesDto {
  @IsArray()
  @IsString({ each: true })
  serviceIds: string[];
}
