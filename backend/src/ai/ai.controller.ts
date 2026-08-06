import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { GeminiService } from '../config/gemini.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/ai')
export class AIController {
  constructor(private geminiService: GeminiService) {}

  @UseGuards(JwtAuthGuard)
  @Post('search')
  async search(
    @Body('query') query: string,
    @Body('location') location?: string,
  ) {
    return this.geminiService.search(query, location);
  }

  @UseGuards(JwtAuthGuard)
  @Post('chat')
  async chat(
    @CurrentUser('id') userId: string,
    @Body('message') message: string,
    @Body('history') history?: string[],
  ) {
    return { reply: await this.geminiService.chat(message, history) };
  }
}
