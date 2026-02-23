import { Injectable, NotFoundException } from '@nestjs/common';
import { Gender } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PersonalDetailsDto } from './dto/personal-details.dto.js';
import { LifestyleDto } from './dto/lifestyle.dto.js';
import { MedicalHistoryDto } from './dto/medical-history.dto.js';
import { HospitalizationDto, DisabilityDto, BankDetailsDto } from './dto/hospitalization.dto.js';

@Injectable()
export class HealthDeclarationService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealthQuestions() {
    return this.prisma.healthQuestion.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async savePersonalDetails(applicationId: string, dto: PersonalDetailsDto) {
    await this.ensureApplicationExists(applicationId);

    return this.prisma.applicationMember.update({
      where: { id: dto.memberId },
      data: {
        title: dto.title,
        firstName: dto.firstName,
        lastName: dto.lastName,
        dob: new Date(dto.dob),
        gender: dto.gender as Gender,
        mobile: dto.mobile,
        heightFt: dto.heightFt,
        heightIn: dto.heightIn,
        weightKg: dto.weightKg,
      },
    });
  }

  async saveBankDetails(applicationId: string, dto: BankDetailsDto) {
    await this.ensureApplicationExists(applicationId);

    return this.prisma.bankDetails.upsert({
      where: { applicationId },
      create: {
        applicationId,
        accountNumber: dto.accountNumber,
        bankName: dto.bankName,
        ifscCode: dto.ifscCode,
      },
      update: {
        accountNumber: dto.accountNumber,
        bankName: dto.bankName,
        ifscCode: dto.ifscCode,
      },
    });
  }

  async saveLifestyleAnswers(applicationId: string, dto: LifestyleDto) {
    await this.ensureApplicationExists(applicationId);

    const results = await Promise.all(
      dto.answers.map((a) =>
        this.prisma.memberLifestyleAnswer.upsert({
          where: {
            memberId_questionKey: {
              memberId: a.memberId,
              questionKey: a.questionKey,
            },
          },
          create: {
            memberId: a.memberId,
            questionKey: a.questionKey,
            answer: a.answer,
            subAnswer: a.subAnswer as any,
          },
          update: {
            answer: a.answer,
            subAnswer: a.subAnswer as any,
          },
        }),
      ),
    );

    return results;
  }

  async saveMedicalHistory(applicationId: string, dto: MedicalHistoryDto) {
    await this.ensureApplicationExists(applicationId);

    const results = await Promise.all(
      dto.answers.map((a) =>
        this.prisma.memberHealthAnswer.upsert({
          where: {
            memberId_questionId: {
              memberId: a.memberId,
              questionId: a.questionId,
            },
          },
          create: {
            memberId: a.memberId,
            questionId: a.questionId,
            answer: a.answer,
            details: a.details,
          },
          update: {
            answer: a.answer,
            details: a.details,
          },
        }),
      ),
    );

    return results;
  }

  async saveHospitalization(applicationId: string, dto: HospitalizationDto) {
    await this.ensureApplicationExists(applicationId);

    const existing = await this.prisma.healthDeclaration.findFirst({
      where: { applicationId },
    });

    if (existing) {
      return this.prisma.healthDeclaration.update({
        where: { id: existing.id },
        data: {
          hospitalizationReason: dto.hospitalizationReason,
          dischargeSummaryUrl: dto.dischargeSummaryUrl,
          medicationDetails: dto.medicationDetails,
        },
      });
    }

    return this.prisma.healthDeclaration.create({
      data: {
        applicationId,
        hospitalizationReason: dto.hospitalizationReason,
        dischargeSummaryUrl: dto.dischargeSummaryUrl,
        medicationDetails: dto.medicationDetails,
      },
    });
  }

  async saveDisability(applicationId: string, dto: DisabilityDto) {
    await this.ensureApplicationExists(applicationId);

    const existing = await this.prisma.healthDeclaration.findFirst({
      where: { applicationId },
    });

    if (existing) {
      return this.prisma.healthDeclaration.update({
        where: { id: existing.id },
        data: {
          hasDisability: dto.hasDisability,
          disabilityDetails: dto.disabilityDetails,
        },
      });
    }

    return this.prisma.healthDeclaration.create({
      data: {
        applicationId,
        hasDisability: dto.hasDisability,
        disabilityDetails: dto.disabilityDetails,
      },
    });
  }

  private async ensureApplicationExists(applicationId: string) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!app) {
      throw new NotFoundException('Application not found');
    }

    return app;
  }
}
