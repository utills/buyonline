import { Injectable, Logger } from '@nestjs/common';
import { DocumentType } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { ManualKycDto } from '../dto/manual-kyc.dto.js';

@Injectable()
export class ManualKycStrategy {
  private readonly logger = new Logger(ManualKycStrategy.name);

  constructor(private readonly prisma: PrismaService) {}

  async verify(applicationId: string, dto: ManualKycDto) {
    this.logger.log(`Manual KYC for application ${applicationId}`);

    const kyc = await this.prisma.kycVerification.update({
      where: { applicationId },
      data: {
        panNumber: dto.panNumber,
        status: 'IN_PROGRESS',
      },
    });

    // Store uploaded documents
    if (dto.documents && dto.documents.length > 0) {
      await Promise.all(
        dto.documents.map((doc) =>
          this.prisma.kycDocument.create({
            data: {
              kycId: kyc.id,
              documentType: doc.documentType as DocumentType,
              fileName: doc.fileName,
              fileUrl: doc.fileUrl,
              fileSizeBytes: doc.fileSizeBytes,
              mimeType: doc.mimeType,
            },
          }),
        ),
      );
    }

    // Manual KYC stays in IN_PROGRESS until admin review
    await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: 'KYC_PENDING' },
    });

    return {
      kycId: kyc.id,
      method: 'MANUAL',
      status: 'IN_PROGRESS',
      message: 'Documents uploaded. Manual verification is in progress.',
    };
  }
}
