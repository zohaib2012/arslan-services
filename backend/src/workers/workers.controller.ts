import { Controller, Get, Put, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { WorkersService } from './workers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  UpdateWorkerProfileDto,
  UpdateOnlineStatusDto,
  UpdateWorkingHoursDto,
  AddPortfolioDto,
  AddPaymentMethodDto,
  AddServiceAreaDto,
  UpdateWorkerServicesDto,
  SubmitVerificationDto,
} from './dto/worker.dto';

@Controller('api/workers')
export class WorkersController {
  constructor(private workersService: WorkersService) {}

  @Get()
  async getWorkers(@Query() query: any) {
    return this.workersService.getWorkers(query);
  }

  @Get('nearby')
  async getNearbyWorkers(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius: string,
  ) {
    return this.workersService.getNearbyWorkers(
      Number(lat), Number(lng), Number(radius) || 10,
    );
  }

  @Get('search')
  async searchWorkers(@Query('q') q: string) {
    return this.workersService.searchWorkers(q);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('WORKER')
  @Get('me')
  async getMyProfile(@CurrentUser('id') userId: string) {
    return this.workersService.getWorkerProfile(userId);
  }

  @Get(':id')
  async getWorker(@Param('id') id: string) {
    return this.workersService.getWorkerById(id);
  }

  @Get(':id/reviews')
  async getWorkerReviews(
    @Param('id') id: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.workersService.getWorkerReviews(id, Number(page), Number(limit));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('WORKER')
  @Put('me')
  async updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateWorkerProfileDto) {
    return this.workersService.updateProfile(userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('WORKER')
  @Put('me/verification')
  async submitVerification(@CurrentUser('id') userId: string, @Body() dto: SubmitVerificationDto) {
    return this.workersService.submitVerification(userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('WORKER')
  @Put('me/online-status')
  async toggleOnline(@CurrentUser('id') userId: string, @Body() dto: UpdateOnlineStatusDto) {
    return this.workersService.toggleOnlineStatus(userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('WORKER')
  @Put('me/hours')
  async updateHours(@CurrentUser('id') userId: string, @Body() dto: UpdateWorkingHoursDto) {
    return this.workersService.updateWorkingHours(userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('WORKER')
  @Post('me/portfolio')
  async addPortfolio(@CurrentUser('id') userId: string, @Body() dto: AddPortfolioDto) {
    return this.workersService.addPortfolio(userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('WORKER')
  @Delete('me/portfolio/:id')
  async removePortfolio(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.workersService.removePortfolio(userId, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('WORKER')
  @Put('me/services')
  async updateServices(@CurrentUser('id') userId: string, @Body() dto: UpdateWorkerServicesDto) {
    return this.workersService.updateServices(userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('WORKER')
  @Put('me/areas')
  async updateAreas(@CurrentUser('id') userId: string, @Body() areas: AddServiceAreaDto[]) {
    return this.workersService.updateServiceAreas(userId, areas);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('WORKER')
  @Post('me/payment-methods')
  async addPaymentMethod(@CurrentUser('id') userId: string, @Body() dto: AddPaymentMethodDto) {
    return this.workersService.addPaymentMethod(userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('WORKER')
  @Delete('me/payment-methods/:id')
  async removePaymentMethod(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.workersService.removePaymentMethod(userId, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('WORKER')
  @Get('me/stats')
  async getStats(@CurrentUser('id') userId: string) {
    return this.workersService.getWorkerStats(userId);
  }
}
