import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller.js';
import { ChatService } from './chat.service.js';
import { StandardChatService } from './standard-chat.service.js';
import { AgenticChatService } from './agentic-chat.service.js';
import { ContextBuilderService } from './context-builder.service.js';
import { ConversationService } from './conversation.service.js';
import { ChatToolsService } from './chat-tools.service.js';
import { FallbackChatService } from './fallback-chat.service.js';
import { AgenticAuthToolsService } from './agentic-auth-tools.service.js';
import { AgenticContextService } from './agentic-context.service.js';
import { AgenticPlanToolsService } from './agentic-plan-tools.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { PlanModule } from '../plan/plan.module.js';
import { OtpModule } from '../otp/otp.module.js';
import { OnboardingModule } from '../onboarding/onboarding.module.js';

@Module({
  imports: [PrismaModule, PlanModule, OtpModule, OnboardingModule],
  controllers: [ChatController],
  providers: [
    ChatService,
    StandardChatService,
    AgenticChatService,
    ContextBuilderService,
    ConversationService,
    ChatToolsService,
    FallbackChatService,
    AgenticAuthToolsService,
    AgenticContextService,
    AgenticPlanToolsService,
  ],
})
export class ChatModule {}
