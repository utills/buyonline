import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { JourneyConfig } from '@buyonline/shared-types';
import type { GetConfigResponse } from './interfaces/configurator.interfaces.js';

export interface CleanStartResult {
  success: boolean;
  details: {
    leads: number;
    applications: number;
    otpAttempts: number;
    postLeads: number;
    journeyConfigs: number;
    redis: string;
  };
  message: string;
}

@Injectable()
export class ConfiguratorService implements OnModuleDestroy {
  private readonly logger = new Logger(ConfiguratorService.name);
  private readonly redis: Redis;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.redis = new Redis(this.config.get<string>('REDIS_URL', 'redis://localhost:6379'), {
      lazyConnect: true,
      enableOfflineQueue: false,
    });
    this.redis.on('error', () => { /* ignore — redis may not be running */ });
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }

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

  async cleanStart(): Promise<CleanStartResult> {
    this.logger.warn('[CleanStart] Wiping all transaction data...');

    // Count before deletion for reporting
    const [leadCount, appCount, otpCount, postLeadCount, configCount] = await Promise.all([
      this.prisma.lead.count(),
      this.prisma.application.count(),
      this.prisma.otpAttempt.count(),
      this.prisma.postLead.count(),
      this.prisma.journeyConfiguration.count(),
    ]);

    // Delete in FK-safe order (leaves first, then parents)
    // Many child tables cascade from Application/ApplicationMember, but we delete explicitly for safety
    await this.prisma.$transaction([
      this.prisma.postLead.deleteMany({}),
      this.prisma.proposal.deleteMany({}),
      this.prisma.bankDetails.deleteMany({}),
      this.prisma.healthDeclaration.deleteMany({}),
      this.prisma.kycDocument.deleteMany({}),
      this.prisma.kycVerification.deleteMany({}),
      this.prisma.proposerDetails.deleteMany({}),
      this.prisma.payment.deleteMany({}),
      this.prisma.selectedAddon.deleteMany({}),
      this.prisma.selectedPlan.deleteMany({}),
      this.prisma.memberHealthAnswer.deleteMany({}),
      this.prisma.memberLifestyleAnswer.deleteMany({}),
      this.prisma.memberCriticalCondition.deleteMany({}),
      this.prisma.memberDisease.deleteMany({}),
      this.prisma.resumeToken.deleteMany({}),
      this.prisma.applicationMember.deleteMany({}),
      this.prisma.application.deleteMany({}),
      this.prisma.otpAttempt.deleteMany({}),
      this.prisma.lead.deleteMany({}),
      this.prisma.journeyConfiguration.deleteMany({}),
    ]);

    // Flush Redis
    let redisStatus = 'skipped';
    try {
      await this.redis.flushdb();
      redisStatus = 'flushed';
      this.logger.log('[CleanStart] Redis flushed');
    } catch (err) {
      this.logger.warn(`[CleanStart] Redis flush failed: ${err instanceof Error ? err.message : err}`);
      redisStatus = 'unavailable';
    }

    this.logger.log('[CleanStart] Done');

    return {
      success: true,
      message: 'Clean start complete — all transaction data wiped, Redis flushed, configurator reset.',
      details: {
        leads: leadCount,
        applications: appCount,
        otpAttempts: otpCount,
        postLeads: postLeadCount,
        journeyConfigs: configCount,
        redis: redisStatus,
      },
    };
  }
}
