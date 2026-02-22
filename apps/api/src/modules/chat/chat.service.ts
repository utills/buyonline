import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { Response } from 'express';
import { ContextBuilderService } from './context-builder.service.js';
import { ConversationService } from './conversation.service.js';
import { ChatToolsService } from './chat-tools.service.js';

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'get_plans',
    description:
      'Fetch all available health insurance plans with their features, pricing tiers, and add-ons. Use this when the user asks about available plans, plan comparison, or plan pricing.',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'calculate_premium',
    description:
      'Calculate the exact annual premium (including GST and discounts) for a specific plan configuration. Use this when the user asks for a specific premium amount.',
    input_schema: {
      type: 'object',
      properties: {
        planId: {
          type: 'string',
          description: 'Plan ID — one of: plan-premier, plan-signature, plan-global',
        },
        sumInsured: {
          type: 'number',
          description: 'Sum insured in rupees (e.g. 500000, 1000000, 2000000)',
        },
        coverageLevel: {
          type: 'string',
          enum: ['INDIVIDUAL', 'FLOATER'],
          description: 'INDIVIDUAL for single person, FLOATER for family',
        },
        tenureMonths: {
          type: 'number',
          enum: [12, 24],
          description: 'Policy tenure: 12 months (1 year) or 24 months (2 years)',
        },
      },
      required: ['planId', 'sumInsured', 'coverageLevel', 'tenureMonths'],
    },
  },
  {
    name: 'get_plan_addons',
    description:
      'Get the list of available add-ons for a specific plan and their prices. Use when the user asks about add-ons, riders, or optional benefits.',
    input_schema: {
      type: 'object',
      properties: {
        planId: {
          type: 'string',
          description: 'Plan ID — one of: plan-premier, plan-signature, plan-global',
        },
      },
      required: ['planId'],
    },
  },
  {
    name: 'get_hospital_network',
    description:
      'Search for cashless network hospitals near a given pincode. Use when the user asks about hospitals, cashless network, or coverage in their area.',
    input_schema: {
      type: 'object',
      properties: {
        pincode: {
          type: 'string',
          description: '6-digit Indian pincode',
        },
      },
      required: ['pincode'],
    },
  },
];

@Injectable()
export class ChatService {
  private readonly anthropic: Anthropic;
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly contextBuilder: ContextBuilderService,
    private readonly conversation: ConversationService,
    private readonly tools: ChatToolsService,
    private readonly config: ConfigService,
  ) {
    this.anthropic = new Anthropic({
      apiKey: this.config.get<string>('ANTHROPIC_API_KEY', ''),
    });
  }

  async streamMessage(
    sessionId: string,
    message: string,
    applicationId: string | undefined,
    res: Response,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY', '');
    if (!apiKey) {
      res.write(
        `data: ${JSON.stringify({ error: 'Chat service is not configured. Please set ANTHROPIC_API_KEY.' })}\n\n`,
      );
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
      return;
    }

    try {
      const [history, systemPrompt] = await Promise.all([
        this.conversation.getHistory(sessionId),
        this.contextBuilder.build(applicationId),
      ]);

      const model = this.config.get<string>('CHAT_MODEL', 'claude-sonnet-4-6');
      const maxTokens = parseInt(this.config.get<string>('CHAT_MAX_TOKENS', '1024'), 10);

      // Build the messages array for the multi-turn loop
      type ApiMessage = { role: 'user' | 'assistant'; content: string | Anthropic.ContentBlock[] };
      const messages: ApiMessage[] = [
        ...history,
        { role: 'user', content: message },
      ];

      let fullResponse = '';

      // Multi-turn loop: keep going until stop_reason is 'end_turn' or error
      while (true) {
        const stream = this.anthropic.messages.stream({
          model,
          max_tokens: maxTokens,
          system: systemPrompt,
          tools: TOOLS,
          messages,
        });

        // Stream text tokens to the client as they arrive
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            const token = event.delta.text;
            fullResponse += token;
            res.write(`data: ${JSON.stringify({ token })}\n\n`);
          }
        }

        const finalMsg = await stream.finalMessage();

        if (finalMsg.stop_reason === 'end_turn') {
          break;
        }

        if (finalMsg.stop_reason === 'tool_use') {
          // Add the assistant's response (with tool_use blocks) to messages
          messages.push({ role: 'assistant', content: finalMsg.content });

          // Execute all requested tools in parallel
          const toolUseBlocks = finalMsg.content.filter(
            (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
          );

          const toolResults = await Promise.all(
            toolUseBlocks.map(async (block) => {
              const result = await this.tools.execute(
                block.name,
                block.input as Record<string, unknown>,
              );
              return {
                type: 'tool_result' as const,
                tool_use_id: block.id,
                content: JSON.stringify(result),
              };
            }),
          );

          // Add tool results and loop back to let Claude continue
          messages.push({ role: 'user', content: toolResults as unknown as string });
          continue;
        }

        // Any other stop reason (max_tokens, stop_sequence) — stop
        break;
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();

      // Persist conversation to Redis (non-blocking)
      this.conversation
        .appendMessages(sessionId, message, fullResponse)
        .catch((err) => this.logger.warn(`Failed to save chat history: ${err.message}`));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Chat stream error: ${msg}`);
      res.write(
        `data: ${JSON.stringify({ error: 'Something went wrong. Please try again.' })}\n\n`,
      );
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    }
  }
}
