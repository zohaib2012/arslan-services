import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('conversations')
  async getConversations(@CurrentUser('id') userId: string) {
    return this.chatService.getConversations(userId);
  }

  @Get('messages/:userId')
  async getMessages(
    @CurrentUser('id') currentUserId: string,
    @Param('userId') partnerId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.chatService.getMessages(
      currentUserId,
      partnerId,
      Number(page) || 1,
      Number(limit) || 50,
    );
  }

  @Get('messages/booking/:bookingId')
  async getMessagesByBooking(
    @CurrentUser('id') userId: string,
    @Param('bookingId') bookingId: string,
  ) {
    return this.chatService.getMessagesByBooking(userId, bookingId);
  }
}
