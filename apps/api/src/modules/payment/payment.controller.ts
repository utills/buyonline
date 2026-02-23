import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentService } from './payment.service.js';
import { InitiatePaymentDto } from './dto/initiate-payment.dto.js';
import { PaymentCallbackDto } from './dto/payment-callback.dto.js';
import { SaveProposerDto } from './dto/save-proposer.dto.js';
import { SessionGuard } from '../../common/guards/session.guard.js';

@Controller('api/v1')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('applications/:id/proposer')
  @UseGuards(SessionGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async saveProposer(
    @Param('id') id: string,
    @Body() dto: SaveProposerDto,
  ) {
    return this.paymentService.saveProposerDetails(id, dto);
  }

  @Post('payments/initiate')
  @UseGuards(SessionGuard)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async initiatePayment(@Body() dto: InitiatePaymentDto) {
    return this.paymentService.initiatePayment(dto);
  }

  @Post('payments/callback')
  @UseGuards(SessionGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async paymentCallback(@Body() dto: PaymentCallbackDto) {
    return this.paymentService.handleCallback(dto);
  }

  @Get('payments/:id/status')
  async getPaymentStatus(@Param('id') id: string) {
    return this.paymentService.getStatus(id);
  }
}
