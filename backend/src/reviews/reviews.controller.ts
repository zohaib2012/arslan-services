import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @CurrentUser('id') userId: string,
    @Body('bookingId') bookingId: string,
    @Body('rating') rating: number,
    @Body('comment') comment?: string,
  ) {
    return this.reviewsService.create(userId, bookingId, rating, comment);
  }

  @Get('booking/:bookingId')
  async findByBooking(@Param('bookingId') bookingId: string) {
    return this.reviewsService.findByBooking(bookingId);
  }

  @Get('worker/:workerId')
  async getByWorker(
    @Param('workerId') workerId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reviewsService.getByWorker(
      workerId,
      Number(page) || 1,
      Number(limit) || 20,
    );
  }
}
