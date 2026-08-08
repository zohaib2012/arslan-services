import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AIController } from './ai.controller';
import { AiAssistantService } from './ai.service';
import { PrismaService } from '../config/database.config';

@Module({
  imports: [AuthModule],
  controllers: [AIController],
  providers: [AiAssistantService, PrismaService],
})
export class AIModule {}
