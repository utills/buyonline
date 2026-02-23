import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

type MessageRole = 'user' | 'assistant';

export interface ConversationMessage {
  role: MessageRole;
  content: string;
}

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

  async getHistory(sessionId: string): Promise<ConversationMessage[]> {
    if (!this.redisAvailable) return [];
    try {
      const data = await this.redis.get(this.key(sessionId));
      return data ? (JSON.parse(data) as ConversationMessage[]) : [];
    } catch {
      return [];
    }
  }

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

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
