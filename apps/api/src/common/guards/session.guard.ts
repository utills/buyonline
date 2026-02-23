import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const token = request.headers['x-session-token'] as string | undefined;
    if (!token) {
      throw new UnauthorizedException('Missing required header: x-session-token');
    }

    const applicationId = request.headers['x-application-id'] as string | undefined;
    if (!applicationId) {
      throw new UnauthorizedException('Missing required header: x-application-id');
    }

    // Look up session token in Redis to get leadId
    const leadId = await this.redis.get('session:' + token);
    if (!leadId) {
      throw new UnauthorizedException('Invalid or expired session token');
    }

    // Look up the application and verify it belongs to the authenticated lead
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      select: { leadId: true },
    });

    if (!application) {
      throw new UnauthorizedException('Application not found');
    }

    if (application.leadId !== leadId) {
      throw new UnauthorizedException('Session does not match application owner');
    }

    // Attach leadId to request for downstream use
    (request as Request & { leadId: string }).leadId = leadId;

    return true;
  }
}
