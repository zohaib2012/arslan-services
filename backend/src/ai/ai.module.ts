import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AIController } from './ai.controller';

@Module({ imports: [AuthModule], controllers: [AIController] })
export class AIModule {}
