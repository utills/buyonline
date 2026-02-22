import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller.js';
import { ChatService } from './chat.service.js';
import { ContextBuilderService } from './context-builder.service.js';
import { ConversationService } from './conversation.service.js';
import { ChatToolsService } from './chat-tools.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { PlanModule } from '../plan/plan.module.js';

@Module({
  imports: [PrismaModule, PlanModule],
  controllers: [ChatController],
  providers: [ChatService, ContextBuilderService, ConversationService, ChatToolsService],
})
export class ChatModule {}
