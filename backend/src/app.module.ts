import { Module } from '@nestjs/common';
import { ConfigModule as ConfigEnvModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorkersModule } from './workers/workers.module';
import { CategoriesModule } from './categories/categories.module';
import { ServicesModule } from './services/services.module';
import { BookingsModule } from './bookings/bookings.module';
import { ChatModule } from './chat/chat.module';
import { ReviewsModule } from './reviews/reviews.module';
import { DisputesModule } from './disputes/disputes.module';
import { FavoritesModule } from './favorites/favorites.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadModule } from './upload/upload.module';
import { LocationModule } from './location/location.module';
import { AIModule } from './ai/ai.module';
import { BannersModule } from './banners/banners.module';
import { AdminModule } from './admin/admin.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigEnvModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../.env'] }),
    ConfigModule,
    AuthModule,
    UsersModule,
    WorkersModule,
    CategoriesModule,
    ServicesModule,
    BookingsModule,
    ChatModule,
    ReviewsModule,
    DisputesModule,
    FavoritesModule,
    NotificationsModule,
    UploadModule,
    LocationModule,
    AIModule,
    BannersModule,
    AdminModule,
    HealthModule,
  ],
})
export class AppModule {}
