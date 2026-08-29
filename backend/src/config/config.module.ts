import { Global, Module } from '@nestjs/common';
import { PrismaService } from './database.config';
import { RedisService } from './redis.config';
import { CloudinaryService } from './cloudinary.config';
import { GeminiService } from './gemini.config';
import { ResendService } from './resend.config';
import { FirebaseService } from './firebase.config';
import { CacheWarmupService } from './cache-warmup.service';

@Global()
@Module({
  providers: [
    PrismaService,
    RedisService,
    CloudinaryService,
    GeminiService,
    ResendService,
    FirebaseService,
    CacheWarmupService,
  ],
  exports: [
    PrismaService,
    RedisService,
    CloudinaryService,
    GeminiService,
    ResendService,
    FirebaseService,
  ],
})
export class ConfigModule {}
