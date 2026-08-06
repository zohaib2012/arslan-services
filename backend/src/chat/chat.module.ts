import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ChatService } from './chat.service';
// ChatGateway disabled for Vercel serverless (no WebSocket support)
// import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';

@Module({
  imports: [AuthModule],
  controllers: [ChatController],
  providers: [ChatService /*, ChatGateway*/],
  exports: [ChatService /*, ChatGateway*/],
})
export class ChatModule {}
