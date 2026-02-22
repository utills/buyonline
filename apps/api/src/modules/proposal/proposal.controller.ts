import { Controller, Post, Get, Param, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { ProposalService } from './proposal.service.js';
import { RateProposalDto } from './dto/rate-proposal.dto.js';

@Controller('api/v1')
export class ProposalController {
  constructor(private readonly proposalService: ProposalService) {}

  @Post('applications/:id/submit')
  async submitProposal(@Param('id') id: string) {
    return this.proposalService.submitProposal(id);
  }

  @Get('proposals/:id')
  async getProposal(@Param('id') id: string) {
    return this.proposalService.getProposal(id);
  }

  @Post('proposals/:id/rating')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async rateProposal(
    @Param('id') id: string,
    @Body() dto: RateProposalDto,
  ) {
    return this.proposalService.rateProposal(id, dto);
  }
}
