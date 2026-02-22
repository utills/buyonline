import { Module } from '@nestjs/common';
import { ProposalController } from './proposal.controller.js';
import { ProposalService } from './proposal.service.js';

@Module({
  controllers: [ProposalController],
  providers: [ProposalService],
  exports: [ProposalService],
})
export class ProposalModule {}
