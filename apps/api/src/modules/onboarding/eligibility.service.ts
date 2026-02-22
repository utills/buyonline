import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { EligibilityResultDto, MemberEligibility } from './dto/eligibility-result.dto.js';

@Injectable()
export class EligibilityService {
  constructor(private readonly prisma: PrismaService) {}

  async checkEligibility(applicationId: string): Promise<EligibilityResultDto> {
    const members = await this.prisma.applicationMember.findMany({
      where: { applicationId },
      include: {
        preExistingDiseases: { include: { disease: true } },
        criticalConditions: { include: { disease: true } },
      },
    });

    const memberResults: MemberEligibility[] = members.map((member) => {
      let isEligible = true;
      let ineligibilityReason: string | undefined;

      // Age eligibility check
      if (member.age < 18 && member.memberType === 'SELF') {
        isEligible = false;
        ineligibilityReason = 'Primary member must be at least 18 years old';
      }

      if (member.age > 65) {
        isEligible = false;
        ineligibilityReason = 'Members above 65 years are not eligible';
      }

      // Critical condition check
      if (member.criticalConditions.length > 0) {
        isEligible = false;
        const conditionNames = member.criticalConditions
          .map((c) => c.disease.name)
          .join(', ');
        ineligibilityReason = `Not eligible due to critical conditions: ${conditionNames}`;
      }

      return {
        memberId: member.id,
        memberType: member.memberType,
        label: member.label,
        isEligible,
        ineligibilityReason,
      };
    });

    // Update member eligibility in database
    for (const result of memberResults) {
      await this.prisma.applicationMember.update({
        where: { id: result.memberId },
        data: {
          isEligible: result.isEligible,
          ineligibilityReason: result.ineligibilityReason ?? null,
        },
      });
    }

    return {
      applicationId,
      allEligible: memberResults.every((m) => m.isEligible),
      members: memberResults,
    };
  }
}
