import { Module } from '@nestjs/common';
import { HealthDeclarationController } from './health-declaration.controller.js';
import { HealthDeclarationService } from './health-declaration.service.js';

@Module({
  controllers: [HealthDeclarationController],
  providers: [HealthDeclarationService],
  exports: [HealthDeclarationService],
})
export class HealthDeclarationModule {}
