import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateBookingDto, RescheduleBookingDto } from './dto/booking.dto';

@Controller('api/bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  async createBooking(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingsService.createBooking(userId, dto);
  }

  @Get('my-bookings')
  async getMyBookings(
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
  ) {
    return this.bookingsService.getCustomerBookings(userId, status);
  }

  @Get('my-jobs')
  async getMyJobs(
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
  ) {
    return this.bookingsService.getWorkerBookings(userId, status);
  }

  @Get(':id')
  async getBooking(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.bookingsService.getBookingById(userId, id);
  }

  @Put(':id/accept')
  async acceptBooking(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.bookingsService.acceptBooking(userId, id);
  }

  @Put(':id/reject')
  async rejectBooking(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.bookingsService.rejectBooking(userId, id, reason);
  }

  @Put(':id/complete')
  async completeBooking(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.bookingsService.completeBooking(userId, id);
  }

  @Put(':id/cancel')
  async cancelBooking(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.bookingsService.cancelBooking(userId, id, reason);
  }

  @Put(':id/reschedule')
  async rescheduleBooking(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: RescheduleBookingDto,
  ) {
    return this.bookingsService.rescheduleBooking(userId, id, dto);
  }
}
