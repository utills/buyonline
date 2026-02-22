import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { EkycDto } from '../dto/ekyc.dto.js';

@Injectable()
export class EkycStrategy {
  private readonly logger = new Logger(EkycStrategy.name);

  constructor(private readonly prisma: PrismaService) {}

  async verify(applicationId: string, dto: EkycDto) {
    this.logger.log(`eKYC verification for application ${applicationId}`);

    const kyc = await this.prisma.kycVerification.update({
      where: { applicationId },
      data: {
        aadharNumber: dto.aadharNumber,
        digilockerRef: dto.digilockerRef,
        status: 'IN_PROGRESS',
      },
    });

    // Simulate Digilocker / eKYC verification
    const isVerified = this.simulateEkycCheck(dto.aadharNumber);

    const updatedKyc = await this.prisma.kycVerification.update({
      where: { id: kyc.id },
      data: {
        status: isVerified ? 'VERIFIED' : 'FAILED',
        verifiedAt: isVerified ? new Date() : null,
        failureReason: isVerified ? null : 'eKYC verification failed',
      },
    });

    if (isVerified) {
      await this.prisma.application.update({
        where: { id: applicationId },
        data: { status: 'KYC_COMPLETED', currentStep: 'health-declaration' },
      });
    }

    return {
      kycId: updatedKyc.id,
      method: 'EKYC',
      status: updatedKyc.status,
      verifiedAt: updatedKyc.verifiedAt,
      failureReason: updatedKyc.failureReason,
    };
  }

  private simulateEkycCheck(_aadharNumber: string): boolean {
    return Math.random() > 0.2;
  }
}
