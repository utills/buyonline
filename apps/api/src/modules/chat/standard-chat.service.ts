import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { Response } from 'express';
import { ContextBuilderService } from './context-builder.service.js';
import { ConversationService } from './conversation.service.js';
import { ChatToolsService } from './chat-tools.service.js';
import { FallbackChatService } from './fallback-chat.service.js';
import { STANDARD_TOOLS } from './chat-tools.constants.js';

type ApiMessage = { role: 'user' | 'assistant'; content: string | Anthropic.ContentBlock[] };

@Injectable()
export class StandardChatService {
  private readonly anthropic: Anthropic;
  private readonly logger = new Logger(StandardChatService.name);

  constructor(
    private readonly contextBuilder: ContextBuilderService,
    private readonly conversation: ConversationService,
    private readonly tools: ChatToolsService,
    private readonly fallback: FallbackChatService,
    private readonly config: ConfigService,
  ) {
    this.anthropic = new Anthropic({
      apiKey: this.config.get<string>('ANTHROPIC_API_KEY', ''),
    });
  }

  async streamStandard(
    sessionId: string,
    message: string,
    applicationId: string | undefined,
    res: Response,
  ): Promise<void> {
    try {
      const [history, systemPrompt] = await Promise.all([
        this.conversation.getHistory(sessionId),
        this.contextBuilder.build(applicationId),
      ]);

      const model = this.config.get<string>('CHAT_MODEL', 'claude-sonnet-4-6');
      const maxTokens = parseInt(this.config.get<string>('CHAT_MAX_TOKENS', '1024'), 10);
      const messages: ApiMessage[] = [...history, { role: 'user', content: message }];
      let fullResponse = '';

      while (true) {
        const stream = this.anthropic.messages.stream({
          model,
          max_tokens: maxTokens,
          system: systemPrompt,
          tools: STANDARD_TOOLS,
          messages,
        });

        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            fullResponse += event.delta.text;
            res.write(`data: ${JSON.stringify({ token: event.delta.text })}\n\n`);
          }
        }

        const finalMsg = await stream.finalMessage();
        if (finalMsg.stop_reason === 'end_turn') break;

        if (finalMsg.stop_reason === 'tool_use') {
          messages.push({ role: 'assistant', content: finalMsg.content });
          const toolBlocks = finalMsg.content.filter(
            (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
          );
          const toolResults = await Promise.all(
            toolBlocks.map(async (block) => ({
              type: 'tool_result' as const,
              tool_use_id: block.id,
              content: JSON.stringify(
                await this.tools.execute(block.name, block.input as Record<string, unknown>),
              ),
            })),
          );
          messages.push({ role: 'user', content: toolResults as unknown as string });
          continue;
        }
        break;
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();

      this.conversation
        .appendMessages(sessionId, message, fullResponse)
        .catch((err: Error) => this.logger.warn(`Failed to save history: ${err.message}`));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.warn(`Standard AI failed, falling back: ${msg}`);
      await this.streamFallback(message, res);
    }
  }

  async streamFallback(message: string, res: Response): Promise<void> {
    try {
      const text = await this.fallback.respond(message);
      for (const word of text.split(' ')) {
        res.write(`data: ${JSON.stringify({ token: word + ' ' })}\n\n`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Fallback error: ${msg}`);
      res.write(`data: ${JSON.stringify({ token: "I'm having trouble right now. Please call 1800-123-4567." })}\n\n`);
    } finally {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    }
  }
}
