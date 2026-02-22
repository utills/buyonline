import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateLeadDto } from './dto/create-lead.dto.js';
import { UpdateLeadDto } from './dto/update-lead.dto.js';

@Injectable()
export class LeadService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLeadDto) {
    return this.prisma.lead.upsert({
      where: { mobile: dto.mobile },
      update: {
        selfSelected: dto.members.self,
        spouseSelected: dto.members.spouse,
        kidsCount: dto.members.kidsCount,
        eldestMemberAge: dto.eldestMemberAge,
        consentGiven: dto.consentGiven,
      },
      create: {
        mobile: dto.mobile,
        countryCode: dto.countryCode ?? '+91',
        selfSelected: dto.members.self,
        spouseSelected: dto.members.spouse,
        kidsCount: dto.members.kidsCount,
        eldestMemberAge: dto.eldestMemberAge,
        consentGiven: dto.consentGiven,
      },
    });
  }

  async findById(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: { applications: true },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with id ${id} not found`);
    }

    return lead;
  }

  async findByMobile(mobile: string) {
    return this.prisma.lead.findUnique({
      where: { mobile },
    });
  }

  async update(id: string, dto: UpdateLeadDto) {
    await this.findById(id);
    return this.prisma.lead.update({
      where: { id },
      data: dto,
    });
  }
}
