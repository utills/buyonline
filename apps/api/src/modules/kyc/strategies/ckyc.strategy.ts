import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { CkycDto } from '../dto/ckyc.dto.js';

@Injectable()
export class CkycStrategy {
  private readonly logger = new Logger(CkycStrategy.name);

  constructor(private readonly prisma: PrismaService) {}

  async verify(applicationId: string, dto: CkycDto) {
    this.logger.log(`CKYC verification for application ${applicationId}`);

    // Update KYC record with CKYC details
    const kyc = await this.prisma.kycVerification.update({
      where: { applicationId },
      data: {
        panNumber: dto.panNumber,
        panDob: new Date(dto.dob),
        status: 'IN_PROGRESS',
      },
    });

    // Simulate CKYC API call -- in production, call actual CKYC registry
    const isVerified = this.simulateCkycCheck(dto.panNumber);

    const updatedKyc = await this.prisma.kycVerification.update({
      where: { id: kyc.id },
      data: {
        status: isVerified ? 'VERIFIED' : 'FAILED',
        verifiedAt: isVerified ? new Date() : null,
        failureReason: isVerified ? null : 'CKYC record not found',
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
      method: 'CKYC',
      status: updatedKyc.status,
      verifiedAt: updatedKyc.verifiedAt,
      failureReason: updatedKyc.failureReason,
    };
  }

  private simulateCkycCheck(panNumber: string): boolean {
    // TODO: Integrate with CKYC registry API for production
    if (panNumber.toUpperCase().startsWith('XXXXX')) return false; // test rejection path
    if (panNumber.toUpperCase().startsWith('AAAAA')) return true;  // test approval path
    return true; // optimistic for dev/staging — all other PANs succeed
  }
}
