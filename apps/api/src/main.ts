import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';
import { validateEnv } from './config/env.validation.js';

async function bootstrap() {
  validateEnv();

  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.enableShutdownHooks();

  // Security headers
  app.use((_req: unknown, res: { setHeader: (k: string, v: string) => void }, next: () => void) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // CORS — comma-separated CORS_ORIGINS
  const rawOrigins = process.env['CORS_ORIGINS'] ?? 'http://localhost:3000,http://localhost:3001';
  const allowedOrigins = rawOrigins.split(',').map((o) => o.trim()).filter(Boolean);
  app.enableCors({
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,Accept',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('BuyOnline API')
    .setDescription('Health insurance purchase platform API — v1')
    .setVersion('1.0')
    .addTag('health', 'System health')
    .addTag('leads', 'Lead management')
    .addTag('otp', 'OTP authentication')
    .addTag('applications', 'Application lifecycle')
    .addTag('plans', 'Plan selection')
    .addTag('payments', 'Payment processing')
    .addTag('kyc', 'KYC verification')
    .addTag('health-declaration', 'Health declarations')
    .addTag('resume', 'Resume journey')
    .addTag('chat', 'AI chat')
    .addApiKey({ type: 'apiKey', name: 'x-session-token', in: 'header' }, 'session-token')
    .addApiKey({ type: 'apiKey', name: 'x-application-id', in: 'header' }, 'application-id')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
  logger.log('Swagger docs available at /api/docs');

  const port = Number(process.env['PORT'] ?? 3001);
  await app.listen(port);
  logger.log(`API running at http://localhost:${port}`);
}

bootstrap();
