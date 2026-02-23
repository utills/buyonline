import { Injectable, NotFoundException } from '@nestjs/common';
import { Gender, MemberType } from '@prisma/client';
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

    const member = await this.prisma.applicationMember.findFirst({
      where: { id: dto.memberId, applicationId },
    });
    if (!member) throw new NotFoundException('Member not found in this application');

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

    // Resolve string keys ('self', 'spouse', 'kid-1') to actual member UUIDs
    const resolved = (
      await Promise.all(
        dto.answers.map(async (a) => {
          const memberId = await this.resolveMemberId(applicationId, a.memberId);
          return memberId ? { ...a, memberId } : null;
        }),
      )
    ).filter((a): a is NonNullable<typeof a> => a !== null);

    if (resolved.length === 0) return [];

    const results = await this.prisma.$transaction(
      resolved.map((a) =>
        this.prisma.memberLifestyleAnswer.upsert({
          where: { memberId_questionKey: { memberId: a.memberId, questionKey: a.questionKey } },
          create: {
            memberId: a.memberId,
            questionKey: a.questionKey,
            answer: a.answer,
            subAnswer: a.subAnswer as import('@prisma/client').TobaccoType | null | undefined,
          },
          update: {
            answer: a.answer,
            subAnswer: a.subAnswer as import('@prisma/client').TobaccoType | null | undefined,
          },
        }),
      ),
    );

    return results;
  }

  async saveMedicalHistory(applicationId: string, dto: MedicalHistoryDto) {
    await this.ensureApplicationExists(applicationId);

    // Resolve string keys ('self', 'spouse', 'kid-1') to actual member UUIDs
    const resolved = (
      await Promise.all(
        dto.answers.map(async (a) => {
          const memberId = await this.resolveMemberId(applicationId, a.memberId);
          return memberId ? { ...a, memberId } : null;
        }),
      )
    ).filter((a): a is NonNullable<typeof a> => a !== null);

    if (resolved.length === 0) return [];

    const results = await this.prisma.$transaction(
      resolved.map((a) =>
        this.prisma.memberHealthAnswer.upsert({
          where: { memberId_questionId: { memberId: a.memberId, questionId: a.questionId } },
          create: { memberId: a.memberId, questionId: a.questionId, answer: a.answer, details: a.details },
          update: { answer: a.answer, details: a.details },
        }),
      ),
    );

    return results;
  }

  async saveHospitalization(applicationId: string, dto: HospitalizationDto) {
    await this.ensureApplicationExists(applicationId);

    return this.prisma.healthDeclaration.upsert({
      where: { applicationId },
      create: {
        applicationId,
        hospitalizationReason: dto.hospitalizationReason,
        dischargeSummaryUrl: dto.dischargeSummaryUrl,
        medicationDetails: dto.medicationDetails,
      },
      update: {
        hospitalizationReason: dto.hospitalizationReason,
        dischargeSummaryUrl: dto.dischargeSummaryUrl,
        medicationDetails: dto.medicationDetails,
      },
    });
  }

  async saveDisability(applicationId: string, dto: DisabilityDto) {
    await this.ensureApplicationExists(applicationId);

    return this.prisma.healthDeclaration.upsert({
      where: { applicationId },
      create: {
        applicationId,
        hasDisability: dto.hasDisability,
        disabilityDetails: dto.disabilityDetails,
      },
      update: {
        hasDisability: dto.hasDisability,
        disabilityDetails: dto.disabilityDetails,
      },
    });
  }

  /**
   * Resolves a frontend member key ('self', 'spouse', 'kid-1') or a raw UUID
   * to the actual ApplicationMember.id (UUID) in the DB.
   * Returns null if the member doesn't exist yet (graceful skip).
   */
  private async resolveMemberId(applicationId: string, memberKey: string): Promise<string | null> {
    // Already a UUID — try direct lookup first
    if (/^[0-9a-f-]{36}$/.test(memberKey)) {
      const m = await this.prisma.applicationMember.findFirst({ where: { id: memberKey, applicationId } });
      return m?.id ?? null;
    }

    if (memberKey === 'self') {
      const m = await this.prisma.applicationMember.findFirst({ where: { applicationId, memberType: MemberType.SELF } });
      return m?.id ?? null;
    }
    if (memberKey === 'spouse') {
      const m = await this.prisma.applicationMember.findFirst({ where: { applicationId, memberType: MemberType.SPOUSE } });
      return m?.id ?? null;
    }
    if (memberKey.startsWith('kid-')) {
      const idx = parseInt(memberKey.split('-')[1], 10) - 1;
      const kids = await this.prisma.applicationMember.findMany({
        where: { applicationId, memberType: MemberType.KID },
        orderBy: { id: 'asc' },
      });
      return kids[idx]?.id ?? null;
    }

    return null;
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
