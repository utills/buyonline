import { Module } from '@nestjs/common';
import { HealthDeclarationController } from './health-declaration.controller.js';
import { HealthDeclarationService } from './health-declaration.service.js';
import { SessionGuard } from '../../common/guards/session.guard.js';

@Module({
  controllers: [HealthDeclarationController],
  providers: [HealthDeclarationService, SessionGuard],
  exports: [HealthDeclarationService],
})
export class HealthDeclarationModule {}
