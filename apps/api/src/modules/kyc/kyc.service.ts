import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CkycStrategy } from './strategies/ckyc.strategy.js';
import { EkycStrategy } from './strategies/ekyc.strategy.js';
import { ManualKycStrategy } from './strategies/manual-kyc.strategy.js';
import { CkycDto } from './dto/ckyc.dto.js';
import { EkycDto } from './dto/ekyc.dto.js';
import { ManualKycDto } from './dto/manual-kyc.dto.js';

@Injectable()
export class KycService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ckycStrategy: CkycStrategy,
    private readonly ekycStrategy: EkycStrategy,
    private readonly manualKycStrategy: ManualKycStrategy,
  ) {}

  async setKycMethod(
    applicationId: string,
    method: 'CKYC' | 'EKYC' | 'MANUAL',
  ) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!app) {
      throw new NotFoundException('Application not found');
    }

    const kyc = await this.prisma.kycVerification.upsert({
      where: { applicationId },
      create: {
        applicationId,
        method,
        status: 'PENDING',
      },
      update: {
        method,
        status: 'PENDING',
      },
    });

    return kyc;
  }

  async verifyCkyc(applicationId: string, dto: CkycDto) {
    await this.ensureKycExists(applicationId, 'CKYC');
    return this.ckycStrategy.verify(applicationId, dto);
  }

  async verifyEkyc(applicationId: string, dto: EkycDto) {
    await this.ensureKycExists(applicationId, 'EKYC');
    return this.ekycStrategy.verify(applicationId, dto);
  }

  async verifyManual(applicationId: string, dto: ManualKycDto) {
    await this.ensureKycExists(applicationId, 'MANUAL');
    return this.manualKycStrategy.verify(applicationId, dto);
  }

  async getStatus(applicationId: string) {
    const kyc = await this.prisma.kycVerification.findUnique({
      where: { applicationId },
      include: { documents: true },
    });

    if (!kyc) {
      throw new NotFoundException('KYC not found for this application');
    }

    return {
      kycId: kyc.id,
      method: kyc.method,
      status: kyc.status,
      verifiedAt: kyc.verifiedAt,
      failureReason: kyc.failureReason,
      documentsCount: kyc.documents.length,
    };
  }

  private async ensureKycExists(applicationId: string, expectedMethod: string) {
    const kyc = await this.prisma.kycVerification.findUnique({
      where: { applicationId },
    });

    if (!kyc) {
      throw new NotFoundException('KYC not initialized. Set KYC method first.');
    }

    if (kyc.method !== expectedMethod) {
      throw new BadRequestException(
        `KYC method mismatch. Expected ${kyc.method}, got ${expectedMethod}`,
      );
    }

    return kyc;
  }
}
