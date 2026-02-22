import {
  Controller,
  Post,
  Body,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import { ChatService } from './chat.service.js';
import { SendMessageDto } from './dto/send-message.dto.js';

@Controller('api/v1/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('stream')
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
    );
  }
}
