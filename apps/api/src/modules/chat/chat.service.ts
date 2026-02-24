import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { StandardChatService } from './standard-chat.service.js';
import { AgenticChatService } from './agentic-chat.service.js';
import { FallbackChatService } from './fallback-chat.service.js';
import { JourneyFlowService } from './journey-flow.service.js';

// ─── SSE Header Setup ─────────────────────────────────────────────────────────
function setSseHeaders(res: Response): void {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();
}

@Injectable()
export class ChatService {
  constructor(
    private readonly standard: StandardChatService,
    private readonly agentic: AgenticChatService,
    private readonly fallback: FallbackChatService,
    private readonly journeyFlow: JourneyFlowService,
    private readonly config: ConfigService,
  ) {}

  async streamMessage(
    sessionId: string,
    message: string,
    applicationId: string | undefined,
    res: Response,
    useAI: boolean = true,
    journeyMode: 'standard' | 'agentic' = 'standard',
  ): Promise<void> {
    setSseHeaders(res);

    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY', '');
    if (!useAI || !apiKey) {
      // Agentic journey without API key → use deterministic JourneyFlowService
      if (journeyMode === 'agentic') {
        await this.journeyFlow.stream(sessionId, message, res);
      } else {
        await this.standard.streamFallback(message, res);
      }
      return;
    }

    if (journeyMode === 'agentic') {
      await this.agentic.streamAgentic(sessionId, message, applicationId, res);
    } else {
      await this.standard.streamStandard(sessionId, message, applicationId, res);
    }
  }
}
