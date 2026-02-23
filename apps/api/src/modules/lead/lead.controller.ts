import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LeadService } from './lead.service.js';
import { CreateLeadDto } from './dto/create-lead.dto.js';

@ApiTags('leads')
@Controller('api/v1/leads')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createLead(@Body() dto: CreateLeadDto) {
    return this.leadService.create(dto);
  }

  @Get(':id')
  async getLead(@Param('id') id: string) {
    return this.leadService.findById(id);
  }
}
