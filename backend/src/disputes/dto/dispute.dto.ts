import { IsString, IsOptional, IsEnum } from 'class-validator';
import { DisputeReason } from '../../generated/prisma';

export class CreateDisputeDto {
  @IsString()
  bookingId: string;

  @IsEnum(DisputeReason)
  reason: DisputeReason;

  @IsString()
  description: string;
}

export class UploadEvidenceDto {
  @IsString()
  fileUrl: string;

  @IsString()
  fileType: string;

  @IsOptional()
  @IsString()
  caption?: string;
}
