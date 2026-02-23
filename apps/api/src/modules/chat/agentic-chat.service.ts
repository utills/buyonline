import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { Response } from 'express';
import { ConversationService, MessageParam } from './conversation.service.js';
import { ChatToolsService } from './chat-tools.service.js';
import { FallbackChatService } from './fallback-chat.service.js';
import { AgenticAuthToolsService } from './agentic-auth-tools.service.js';
import { AgenticContextService } from './agentic-context.service.js';
import { AgenticPlanToolsService } from './agentic-plan-tools.service.js';
import { AGENTIC_TOOLS } from './chat-tools.constants.js';

/** Balanced-bracket parser for [STATE:{...}] markers — safe when JSON contains ']'. */
function extractStateJson(text: string): string | null {
  const prefix = '[STATE:';
  const start = text.indexOf(prefix);
  if (start === -1) return null;
  let depth = 0;
  const jsonStart = start + prefix.length;
  for (let i = jsonStart; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') {
      depth--;
      if (depth === 0) return text.slice(jsonStart, i + 1);
    }
  }
  return null;
}

/** Extract [STATE:{...}] markers from LLM text and return parsed updates. */
function extractStateUpdates(text: string): Record<string, unknown>[] {
  const updates: Record<string, unknown>[] = [];
  // Use balanced-bracket parser to avoid breaking on JSON containing ']'
  let remaining = text;
  while (remaining.includes('[STATE:')) {
    const json = extractStateJson(remaining);
    if (!json) break;
    try { updates.push(JSON.parse(json) as Record<string, unknown>); } catch { /* ignore */ }
    // Advance past the matched segment to find additional STATE markers
    const markerEnd = remaining.indexOf('[STATE:') + '[STATE:'.length + json.length + 1;
    remaining = remaining.slice(markerEnd);
  }
  return updates;
}

@Injectable()
export class AgenticChatService {
  private readonly anthropic: Anthropic;
  private readonly logger = new Logger(AgenticChatService.name);

  constructor(
    private readonly conversation: ConversationService,
    private readonly tools: ChatToolsService,
    private readonly fallback: FallbackChatService,
    private readonly agenticAuth: AgenticAuthToolsService,
    private readonly agenticContext: AgenticContextService,
    private readonly agenticPlan: AgenticPlanToolsService,
    private readonly config: ConfigService,
  ) {
    this.anthropic = new Anthropic({
      apiKey: this.config.get<string>('ANTHROPIC_API_KEY', ''),
    });
  }

  async streamAgentic(
    sessionId: string,
    message: string,
    applicationId: string | undefined,
    res: Response,
  ): Promise<void> {
    try {
      const [history, systemPrompt] = await Promise.all([
        this.conversation.getHistory(sessionId, 'agentic'),
        this.agenticContext.build(applicationId),
      ]);

      const model = this.config.get<string>('CHAT_MODEL', 'claude-sonnet-4-6');
      const maxTokens = parseInt(this.config.get<string>('CHAT_MAX_TOKENS') ?? '2048', 10);
      const messages: MessageParam[] = [...history, { role: 'user', content: message }];
      let fullResponse = '';
      let handoffEmitted = false;

      const MAX_TOOL_ITERATIONS = 10;
      let iterations = 0;
      while (true) {
        iterations++;
        if (iterations > MAX_TOOL_ITERATIONS) {
          res.write(`data: ${JSON.stringify({ token: '\n\n_I\'ve reached my processing limit for this request. Please try again or contact support._' })}\n\n`);
          break;
        }
        const stream = this.anthropic.messages.stream({
          model,
          max_tokens: maxTokens,
          system: systemPrompt,
          tools: AGENTIC_TOOLS,
          messages,
        });

        let turnText = '';
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            turnText += event.delta.text;
            fullResponse += event.delta.text;
            res.write(`data: ${JSON.stringify({ token: event.delta.text })}\n\n`);
          }
        }

        // Emit any state updates extracted from the LLM text
        for (const update of extractStateUpdates(turnText)) {
          res.write(`data: ${JSON.stringify({ stateUpdate: update })}\n\n`);
        }

        const finalMsg = await stream.finalMessage();
        if (finalMsg.stop_reason === 'end_turn') break;

        if (finalMsg.stop_reason === 'tool_use') {
          messages.push({ role: 'assistant', content: finalMsg.content });

          const toolResults = await Promise.all(
            finalMsg.content
              .filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
              .map(async (block) => {
                const input = block.input as Record<string, unknown>;
                let result: unknown;

                if (this.agenticAuth.canHandle(block.name)) {
                  result = await this.agenticAuth.execute(block.name, input);
                } else if (this.agenticPlan.canHandle(block.name)) {
                  result = await this.agenticPlan.execute(block.name, input);
                  if (block.name === 'initiate_payment' && !handoffEmitted) {
                    const r = result as Record<string, unknown>;
                    if (r['success']) {
                      handoffEmitted = true;
                      res.write(`data: ${JSON.stringify({
                        handoff: {
                          applicationId: r['applicationId'],
                          leadId: r['leadId'],
                          mobile: r['mobile'],
                          redirectPath: r['redirectPath'] ?? '/gateway',
                        },
                      })}\n\n`);
                    }
                  }
                } else {
                  result = await this.tools.execute(block.name, input);
                }

                return { type: 'tool_result' as const, tool_use_id: block.id, content: JSON.stringify(result) };
              }),
          );

          messages.push({ role: 'user', content: toolResults as unknown as string });
          continue;
        }
        break;
      }

      if (!handoffEmitted) res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();

      // H7: Save the full messages array (including tool_use and tool_result blocks) to Redis
      this.conversation
        .saveMessages(sessionId, messages, 'agentic')
        .catch((err: Error) => this.logger.warn(`Failed to save agentic history: ${err.message}`));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.warn(`Agentic AI failed, falling back: ${msg}`);
      try {
        const text = await this.fallback.respond(message);
        for (const word of text.split(' ')) {
          res.write(`data: ${JSON.stringify({ token: word + ' ' })}\n\n`);
        }
      } catch { /* ignore secondary failure */ }
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    }
  }
}
