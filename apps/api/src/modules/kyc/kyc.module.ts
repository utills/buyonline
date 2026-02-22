import { Module } from '@nestjs/common';
import { KycController } from './kyc.controller.js';
import { KycService } from './kyc.service.js';
import { CkycStrategy } from './strategies/ckyc.strategy.js';
import { EkycStrategy } from './strategies/ekyc.strategy.js';
import { ManualKycStrategy } from './strategies/manual-kyc.strategy.js';

@Module({
  controllers: [KycController],
  providers: [KycService, CkycStrategy, EkycStrategy, ManualKycStrategy],
  exports: [KycService],
})
export class KycModule {}
