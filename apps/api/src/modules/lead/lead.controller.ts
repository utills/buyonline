import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LeadService } from './lead.service.js';
import { CreateLeadDto } from './dto/create-lead.dto.js';

@Controller('api/v1/leads')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createLead(@Body() dto: CreateLeadDto) {
    return this.leadService.create(dto);
  }

  @Get(':id')
  async getLead(@Param('id') id: string) {
    return this.leadService.findById(id);
  }
}
