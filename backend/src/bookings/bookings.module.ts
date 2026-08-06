import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AuthModule } from '../auth/auth.module';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BookingsProcessor } from './bookings.processor';

@Module({
  imports: [AuthModule, BullModule.registerQueue({ name: 'bookings' })],
  controllers: [BookingsController],
  providers: [BookingsService, BookingsProcessor],
  exports: [BookingsService],
})
export class BookingsModule {}
