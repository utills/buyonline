import { Global, Module, Logger } from '@nestjs/common';
import Redis from 'ioredis';

const logger = new Logger('RedisModule');

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const client = new Redis(
          process.env['REDIS_URL'] ?? 'redis://localhost:6379',
          { lazyConnect: true, maxRetriesPerRequest: 1 },
        );
        client.on('error', (err: Error) => {
          logger.warn(`Redis connection error: ${err.message}`);
        });
        client.on('connect', () => {
          logger.log('Redis connected.');
        });
        return client;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
