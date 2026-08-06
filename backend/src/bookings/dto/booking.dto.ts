import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { BookingType } from '../../../generated/prisma';

export class CreateBookingDto {
  @IsString()
  workerId: string;

  @IsString()
  serviceId: string;

  @IsEnum(BookingType)
  bookingType: BookingType;

  @IsString()
  description: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsString()
  address: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsString()
  customerNotes?: string;
}

export class RescheduleBookingDto {
  @IsDateString()
  scheduledAt: string;
}
