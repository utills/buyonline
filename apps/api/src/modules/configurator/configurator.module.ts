import { Module } from '@nestjs/common';
import { ConfiguratorController } from './configurator.controller.js';
import { ConfiguratorService } from './configurator.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [ConfiguratorController],
  providers: [ConfiguratorService],
  exports: [ConfiguratorService],
})
export class ConfiguratorModule {}
