import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import type Anthropic from '@anthropic-ai/sdk';

type MessageRole = 'user' | 'assistant';

export interface ConversationMessage {
  role: MessageRole;
  content: string;
}

// H7: Full typed message param — matches Anthropic SDK MessageParam
export type MessageParam = {
  role: 'user' | 'assistant';
  content: string | Anthropic.ContentBlock[];
};

const SESSION_TTL = 1800; // 30 minutes
const MAX_HISTORY = 20;   // 10 exchanges

@Injectable()
export class ConversationService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly logger = new Logger(ConversationService.name);
  private redisAvailable = true;

  constructor(private readonly config: ConfigService) {
    this.redis = new Redis(
      this.config.get<string>('REDIS_URL', 'redis://localhost:6379'),
      { lazyConnect: true, maxRetriesPerRequest: 1 },
    );
    this.redis.on('error', (err) => {
      this.logger.warn(`Redis connection error (chat history will be in-memory): ${err.message}`);
      this.redisAvailable = false;
    });
    this.redis.on('connect', () => {
      this.logger.log('Redis reconnected — chat history persistence restored.');
      this.redisAvailable = true;
    });
  }

  private key(sessionId: string): string {
    return `chat:session:${sessionId}`;
  }

  // H7: Returns full MessageParam[] (including tool_use/tool_result blocks)
  async getHistory(sessionId: string): Promise<MessageParam[]> {
    if (!this.redisAvailable) return [];
    try {
      const data = await this.redis.get(this.key(sessionId));
      return data ? (JSON.parse(data) as MessageParam[]) : [];
    } catch {
      return [];
    }
  }

  /**
   * Legacy method — saves a single user+assistant text exchange.
   * Kept for backward compatibility with standard (non-agentic) chat paths.
   */
  async appendMessages(
    sessionId: string,
    userMsg: string,
    assistantMsg: string,
  ): Promise<void> {
    if (!this.redisAvailable) return;
    try {
      const history = await this.getHistory(sessionId);
      history.push({ role: 'user', content: userMsg });
      history.push({ role: 'assistant', content: assistantMsg });

      const trimmed = history.slice(-MAX_HISTORY);
      await this.redis.setex(this.key(sessionId), SESSION_TTL, JSON.stringify(trimmed));
    } catch {
      // Non-fatal: conversation history just won't persist
    }
  }

  /**
   * H7: Save the full messages array — preserves tool_use and tool_result blocks
   * so the agentic loop can resume with complete context.
   */
  async saveMessages(sessionId: string, messages: MessageParam[]): Promise<void> {
    if (!this.redisAvailable) return;
    try {
      const trimmed = messages.slice(-MAX_HISTORY);
      await this.redis.setex(this.key(sessionId), SESSION_TTL, JSON.stringify(trimmed));
    } catch {
      // Non-fatal: conversation history just won't persist
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
