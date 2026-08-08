import { Controller, Post, Body } from '@nestjs/common';
import { AiAssistantService } from './ai.service';

@Controller('api/ai')
export class AIController {
  constructor(private aiService: AiAssistantService) {}

  @Post('search')
  async search(
    @Body('query') query: string,
    @Body('location') location?: string,
  ) {
    return this.aiService.search(query, location);
  }

  @Post('chat')
  async chat(
    @Body('message') message: string,
    @Body('history') history?: string[],
  ) {
    return { reply: await this.aiService.chat(message, history) };
  }
}
