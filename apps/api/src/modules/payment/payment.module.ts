import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller.js';
import { PaymentService } from './payment.service.js';
import { SessionGuard } from '../../common/guards/session.guard.js';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, SessionGuard],
  exports: [PaymentService],
})
export class PaymentModule {}
