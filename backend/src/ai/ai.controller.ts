import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiAssistantService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/ai')
export class AIController {
  constructor(private aiService: AiAssistantService) {}

  @UseGuards(JwtAuthGuard)
  @Post('search')
  async search(
    @Body('query') query: string,
    @Body('location') location?: string,
  ) {
    return this.aiService.search(query, location);
  }

  @UseGuards(JwtAuthGuard)
  @Post('chat')
  async chat(
    @CurrentUser('id') userId: string,
    @Body('message') message: string,
    @Body('history') history?: string[],
  ) {
    return { reply: await this.aiService.chat(message, history) };
  }
}
