import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: (config: Record<string, unknown>) => {
        if (!config['DATABASE_URL']) {
          throw new Error('DATABASE_URL is required');
        }
        return config;
      },
    }),
  ],
})
export class AppConfigModule {}
