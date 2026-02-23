import {
  Injectable,
  BadRequestException,
  NotFoundException,
  HttpException,
  HttpStatus,
  Logger,
  Inject,
} from '@nestjs/common';
import { createHash, randomInt, randomUUID } from 'crypto';
import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service.js';
import { SendOtpDto, OtpPurpose } from './dto/send-otp.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';

const OTP_TTL_SECONDS = 180;
const MAX_SENDS_PER_WINDOW = 3;
const RATE_LIMIT_WINDOW_MINUTES = 10;

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  private hashOtp(otp: string): string {
    return createHash('sha256').update(otp).digest('hex');
  }

  private generateOtp(): string {
    return randomInt(100000, 999999).toString();
  }

  async send(dto: SendOtpDto) {
    const lead = await this.prisma.lead.findUnique({
      where: { mobile: dto.mobile },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found. Please create a lead first.');
    }

    // Rate limiting: check sends in last 10 minutes
    const windowStart = new Date(
      Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
    );
    const recentAttempts = await this.prisma.otpAttempt.count({
      where: {
        leadId: lead.id,
        createdAt: { gte: windowStart },
      },
    });

    if (recentAttempts >= MAX_SENDS_PER_WINDOW) {
      throw new HttpException(
        `Maximum ${MAX_SENDS_PER_WINDOW} OTP requests allowed per ${RATE_LIMIT_WINDOW_MINUTES} minutes`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const otp = this.generateOtp();
    const hashedOtp = this.hashOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);
    const purpose = dto.purpose ?? OtpPurpose.LOGIN;

    await this.prisma.otpAttempt.create({
      data: {
        leadId: lead.id,
        otp: hashedOtp,
        purpose,
        expiresAt,
      },
    });

    // In production, send OTP via SMS gateway
    this.logger.log(`OTP for ${dto.mobile}: ${otp}`);

    return {
      message: 'OTP sent successfully',
      expiresInSeconds: OTP_TTL_SECONDS,
      ...(process.env['NODE_ENV'] !== 'production' && { otp }),
    };
  }

  async verify(dto: VerifyOtpDto) {
    const lead = await this.prisma.lead.findUnique({
      where: { mobile: dto.mobile },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const hashedOtp = this.hashOtp(dto.otp);

    const otpAttempt = await this.prisma.otpAttempt.findFirst({
      where: {
        leadId: lead.id,
        otp: hashedOtp,
        verified: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpAttempt) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Mark OTP as verified
    await this.prisma.otpAttempt.update({
      where: { id: otpAttempt.id },
      data: { verified: true, attempts: { increment: 1 } },
    });

    // Mark lead as verified
    await this.prisma.lead.update({
      where: { id: lead.id },
      data: { isVerified: true },
    });

    // Generate session token and store in Redis with 24h TTL
    const sessionToken = randomUUID();
    await this.redis.set('session:' + sessionToken, lead.id, 'EX', 86400);

    return {
      message: 'OTP verified successfully',
      leadId: lead.id,
      isVerified: true,
      sessionToken,
    };
  }

  async resend(dto: SendOtpDto) {
    return this.send(dto);
  }
}
