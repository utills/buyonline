import {
  Injectable,
  BadRequestException,
  NotFoundException,
  HttpException,
  HttpStatus,
  Logger,
  Inject,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service.js';
import { SendOtpDto, OtpPurpose } from './dto/send-otp.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';

const OTP_TTL_SECONDS = 180;
const MAX_SENDS_PER_WINDOW = 3;
const RATE_LIMIT_WINDOW_MINUTES = 10;

// Dev bypass — always accepted without calling external service
const DEV_OTP_BYPASS = '123456';

// Prudential internal comms service
const COMMS_BASE_URL =
  process.env['COMMS_API_BASE_URL'] ??
  'https://comms-svc-phil-ds-dev-api.lb1-pruinhlth-dev-az1-dp1d50.pru.intranet.asia';

function commsHeaders() {
  return {
    'accept': 'application/json',
    'Content-Type': 'application/json',
    'X-PRU-TENANT': process.env['COMMS_TENANT'] ?? 'PHIL',
    'X-LBU-UNIQUE-ID': process.env['COMMS_UNIQUE_ID'] ?? '487327648723',
    'Accept-Language': process.env['COMMS_ACCEPT_LANGUAGE'] ?? '432432',
    'x-api-key': process.env['COMMS_API_KEY'] ?? 'phil-dev-key',
  };
}

/** Format mobile as +91XXXXXXXXXX for the external API */
function toE164(mobile: string): string {
  const digits = mobile.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) return '+' + digits;
  if (digits.length === 10) return '+91' + digits;
  return '+' + digits;
}

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async send(dto: SendOtpDto) {
    const lead = await this.prisma.lead.findUnique({
      where: { mobile: dto.mobile },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found. Please create a lead first.');
    }

    // Rate limiting: check sends in last 10 minutes
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);
    const recentAttempts = await this.prisma.otpAttempt.count({
      where: { leadId: lead.id, createdAt: { gte: windowStart } },
    });

    if (recentAttempts >= MAX_SENDS_PER_WINDOW) {
      throw new HttpException(
        `Maximum ${MAX_SENDS_PER_WINDOW} OTP requests allowed per ${RATE_LIMIT_WINDOW_MINUTES} minutes`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const purpose = dto.purpose ?? OtpPurpose.LOGIN;
    const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);
    let otpSessionId: string | null = null;

    // Call Prudential internal comms API to send OTP via SMS
    try {
      const response = await fetch(`${COMMS_BASE_URL}/api/v1/comms/otp`, {
        method: 'POST',
        headers: commsHeaders(),
        body: JSON.stringify({
          channel: 'SMS',
          to: toE164(dto.mobile),
          journey: purpose.toLowerCase(),
        }),
      });

      if (response.ok) {
        const data = await response.json() as Record<string, unknown>;
        otpSessionId = (data['otpSessionId'] as string) ?? null;
        this.logger.log(`OTP sent via external gateway for ${dto.mobile} — sessionId: ${otpSessionId}`);
      } else {
        const errText = await response.text();
        this.logger.warn(`External OTP API returned ${response.status}: ${errText}`);
      }
    } catch (err) {
      this.logger.warn(`External OTP API unreachable: ${(err as Error).message}`);
    }

    // Store otpSessionId in Redis so verify() can use it
    if (otpSessionId) {
      await this.redis.set(`otp-session:${dto.mobile}`, otpSessionId, 'EX', OTP_TTL_SECONDS);
    }

    // Create tracking record (otpSessionId stored in otp field for audit trail)
    await this.prisma.otpAttempt.create({
      data: {
        leadId: lead.id,
        otp: otpSessionId ?? 'pending',
        purpose,
        expiresAt,
      },
    });

    return {
      message: 'OTP sent successfully',
      expiresInSeconds: OTP_TTL_SECONDS,
    };
  }

  async verify(dto: VerifyOtpDto) {
    const lead = await this.prisma.lead.findUnique({
      where: { mobile: dto.mobile },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const isDevBypass = dto.otp === DEV_OTP_BYPASS;

    if (!isDevBypass) {
      // Look up the otpSessionId stored during send
      const otpSessionId = await this.redis.get(`otp-session:${dto.mobile}`);

      if (!otpSessionId) {
        throw new BadRequestException('OTP session expired or not found. Please request a new OTP.');
      }

      // Verify with external Prudential API
      let externalVerified = false;
      try {
        const response = await fetch(`${COMMS_BASE_URL}/api/v1/comms/otp/verification`, {
          method: 'POST',
          headers: commsHeaders(),
          body: JSON.stringify({
            otpSessionId,
            otp: dto.otp,
            journey: 'login',
          }),
        });

        if (response.ok) {
          externalVerified = true;
          this.logger.log(`OTP verified via external gateway for ${dto.mobile}`);
        } else {
          const errText = await response.text();
          this.logger.warn(`External OTP verify returned ${response.status}: ${errText}`);
        }
      } catch (err) {
        this.logger.warn(`External OTP verify API unreachable: ${(err as Error).message}`);
      }

      if (!externalVerified) {
        throw new BadRequestException('Invalid or expired OTP');
      }

      // Clear the session from Redis after successful verification
      await this.redis.del(`otp-session:${dto.mobile}`);
    } else {
      // Dev bypass — unconditional in non-production environments
      if (process.env['NODE_ENV'] === 'production') {
        throw new BadRequestException('Invalid OTP');
      }

      this.logger.warn(`[DEV] OTP bypass used for ${dto.mobile}`);

      // Best-effort: mark any pending attempt as verified (non-blocking)
      try {
        const attempt = await this.prisma.otpAttempt.findFirst({
          where: { leadId: lead.id, verified: false },
          orderBy: { createdAt: 'desc' },
        });
        if (attempt) {
          await this.prisma.otpAttempt.update({
            where: { id: attempt.id },
            data: { verified: true, attempts: { increment: 1 } },
          });
        }
      } catch {
        // Ignore — bypass should work even if no attempt record exists
      }
    }

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
