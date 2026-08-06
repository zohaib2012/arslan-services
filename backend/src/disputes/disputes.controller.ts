import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateDisputeDto, UploadEvidenceDto } from './dto/dispute.dto';

@Controller('api/disputes')
@UseGuards(JwtAuthGuard)
export class DisputesController {
  constructor(private disputesService: DisputesService) {}

  @Post()
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateDisputeDto,
  ) {
    return this.disputesService.create(userId, dto);
  }

  @Get('my')
  async getMyDisputes(@CurrentUser('id') userId: string) {
    return this.disputesService.getMyDisputes(userId);
  }

  @Get(':id')
  async getById(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.disputesService.getById(userId, id);
  }

  @Post(':id/evidence')
  async addEvidence(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UploadEvidenceDto,
  ) {
    return this.disputesService.addEvidence(userId, id, dto);
  }
}
