import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class SessionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const applicationId = request.headers['x-application-id'];

    if (!applicationId) {
      throw new UnauthorizedException(
        'Missing required header: x-application-id',
      );
    }

    return true;
  }
}
