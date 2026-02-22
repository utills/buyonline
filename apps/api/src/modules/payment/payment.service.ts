import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service.js';
import { InitiatePaymentDto } from './dto/initiate-payment.dto.js';
import { PaymentCallbackDto } from './dto/payment-callback.dto.js';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(private readonly prisma: PrismaService) {}

  async saveProposerDetails(
    applicationId: string,
    details: {
      firstName: string;
      lastName: string;
      dob: string;
      email: string;
    },
  ) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!app) {
      throw new NotFoundException('Application not found');
    }

    return this.prisma.proposerDetails.upsert({
      where: { applicationId },
      create: {
        applicationId,
        firstName: details.firstName,
        lastName: details.lastName,
        dob: new Date(details.dob),
        email: details.email,
      },
      update: {
        firstName: details.firstName,
        lastName: details.lastName,
        dob: new Date(details.dob),
        email: details.email,
      },
    });
  }

  async initiatePayment(dto: InitiatePaymentDto) {
    const app = await this.prisma.application.findUnique({
      where: { id: dto.applicationId },
      include: { selectedPlan: true },
    });

    if (!app) {
      throw new NotFoundException('Application not found');
    }

    if (!app.selectedPlan) {
      throw new BadRequestException('No plan selected for this application');
    }

    // Generate a mock gateway order ID
    const gatewayOrderId = `order_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
    const transactionId = `txn_${randomUUID().replace(/-/g, '').slice(0, 16)}`;

    const payment = await this.prisma.payment.upsert({
      where: { applicationId: dto.applicationId },
      create: {
        applicationId: dto.applicationId,
        amount: BigInt(dto.amount),
        currency: dto.currency ?? 'INR',
        status: 'INITIATED',
        gatewayOrderId,
        transactionId,
        paymentMethod: dto.paymentMethod,
      },
      update: {
        amount: BigInt(dto.amount),
        status: 'INITIATED',
        gatewayOrderId,
        transactionId,
        paymentMethod: dto.paymentMethod,
      },
    });

    await this.prisma.application.update({
      where: { id: dto.applicationId },
      data: { status: 'PAYMENT_PENDING', currentStep: 'payment' },
    });

    this.logger.log(`Payment initiated: ${payment.id} for application ${dto.applicationId}`);

    return {
      paymentId: payment.id,
      gatewayOrderId,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
    };
  }

  async handleCallback(dto: PaymentCallbackDto) {
    const payment = await this.prisma.payment.findFirst({
      where: { gatewayOrderId: dto.gatewayOrderId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const isSuccess = dto.status === 'SUCCESS';

    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: isSuccess ? 'SUCCESS' : 'FAILED',
        gatewayPaymentId: dto.gatewayPaymentId,
        gatewaySignature: dto.gatewaySignature,
        paidAt: isSuccess ? new Date() : null,
      },
    });

    if (isSuccess) {
      await this.prisma.application.update({
        where: { id: payment.applicationId },
        data: { status: 'PAYMENT_COMPLETED', currentStep: 'kyc' },
      });
    }

    return {
      paymentId: updated.id,
      status: updated.status,
      applicationId: updated.applicationId,
    };
  }

  async getStatus(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return {
      paymentId: payment.id,
      applicationId: payment.applicationId,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      transactionId: payment.transactionId,
      paidAt: payment.paidAt,
    };
  }
}
