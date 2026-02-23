import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const raw = req.headers['x-correlation-id'] as string | undefined;
    const correlationId = raw
      ? raw.replace(/[^a-zA-Z0-9\-]/g, '').slice(0, 64) || randomUUID()
      : randomUUID();
    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('x-correlation-id', correlationId);
    next();
  }
}
