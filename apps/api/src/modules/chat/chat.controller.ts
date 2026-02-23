import {
  Controller,
  Post,
  Body,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service.js';
import { SendMessageDto } from './dto/send-message.dto.js';

@ApiTags('chat')
@Controller('api/v1/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('stream')
  @Throttle({ default: { ttl: 60000, limit: 30 } })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async stream(
    @Body() dto: SendMessageDto,
    @Res() res: Response,
  ): Promise<void> {
    await this.chatService.streamMessage(
      dto.sessionId,
      dto.message,
      dto.applicationId,
      res,
      dto.useAI ?? true,
      dto.journeyMode ?? 'standard',
    );
  }
}
