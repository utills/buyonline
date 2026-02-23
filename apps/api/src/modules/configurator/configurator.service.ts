import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { JourneyConfig } from '@buyonline/shared-types';
import type { GetConfigResponse } from './interfaces/configurator.interfaces.js';

@Injectable()
export class ConfiguratorService {
  constructor(private readonly prisma: PrismaService) {}

  async getConfig(): Promise<GetConfigResponse | null> {
    const record = await this.prisma.journeyConfiguration.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
    });
    if (!record) return null;
    return {
      id: record.id,
      version: record.version,
      config: record.config as unknown as JourneyConfig,
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  async saveConfig(config: JourneyConfig): Promise<GetConfigResponse> {
    const existing = await this.prisma.journeyConfiguration.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
    });

    const updated = { ...config, updatedAt: new Date().toISOString() };

    if (existing) {
      const record = await this.prisma.journeyConfiguration.update({
        where: { id: existing.id },
        data: {
          config: updated as object,
          version: { increment: 1 },
        },
      });
      return {
        id: record.id,
        version: record.version,
        config: record.config as unknown as JourneyConfig,
        updatedAt: record.updatedAt.toISOString(),
      };
    }

    const record = await this.prisma.journeyConfiguration.create({
      data: { config: updated as object, isActive: true },
    });
    return {
      id: record.id,
      version: record.version,
      config: record.config as unknown as JourneyConfig,
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  async resetConfig(): Promise<{ message: string }> {
    await this.prisma.journeyConfiguration.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
    return { message: 'Configuration reset to default' };
  }
}
