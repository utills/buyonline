'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { hydrateAllStores } from '@/lib/hydrate-stores';
import { useOtp } from '@/hooks/useOtp';
import type { ValidateTokenResponse, ResumeStateResponse } from '@buyonline/shared-types';

type Phase = 'validating' | 'otp' | 'hydrating' | 'error';

export default function ResumePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [phase, setPhase] = useState<Phase>('validating');
  const [error, setError] = useState('');
  const [tokenData, setTokenData] = useState<ValidateTokenResponse | null>(null);

  // OTP state
  const { formattedTime, canResend, startTimer } = useOtp();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Validate token on mount
  useEffect(() => {
    async function validate() {
      try {
        const data = await apiClient.get<ValidateTokenResponse>(
          `/api/v1/resume/${token}/validate`,
        );
        setTokenData(data);
        setPhase('otp');

        // Auto-send OTP
        await apiClient.post('/api/v1/otp/send', {
          mobile: data.mobile,
          purpose: 'LOGIN',
        });
        startTimer();
      } catch {
        setError('This resume link is invalid or has expired.');
        setPhase('error');
      }
    }
    validate();
  }, [token, startTimer]);

  // Focus first input when entering OTP phase
  useEffect(() => {
    if (phase === 'otp') {
      inputRefs.current[0]?.focus();
    }
  }, [phase]);

  const handleVerify = useCallback(
    async (otpCode: string) => {
      if (!tokenData) return;
      setIsVerifying(true);
      setOtpError('');
      try {
        const state = await apiClient.post<ResumeStateResponse>(
          `/api/v1/resume/${token}/verify`,
          { mobile: tokenData.mobile, otp: otpCode },
        );

        setPhase('hydrating');
        hydrateAllStores(state);
        router.replace(state.journey.redirectPath);
      } catch {
        setOtpError('Invalid OTP. Please try again.');
        setIsVerifying(false);
      }
    },
    [tokenData, token, router],
  );

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setOtpError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d !== '') && index === 5) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (!tokenData) return;
    try {
      await apiClient.post('/api/v1/otp/resend', {
        mobile: tokenData.mobile,
        purpose: 'LOGIN',
      });
      startTimer();
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
      inputRefs.current[0]?.focus();
    } catch {
      setOtpError('Failed to resend OTP');
    }
  };

  // ── Validating phase ──
  if (phase === 'validating') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <svg className="animate-spin w-10 h-10 text-[#ED1B2D] mx-auto" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-600 text-sm">Validating your resume link...</p>
        </div>
      </div>
    );
  }

  // ── Error phase ──
  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Link Expired</h2>
          <p className="text-sm text-gray-500">{error}</p>
          <a
            href="/"
            className="inline-block bg-[#ED1B2D] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#C8162A] transition-colors"
          >
            Start Fresh
          </a>
        </div>
      </div>
    );
  }

  // ── Hydrating phase ──
  if (phase === 'hydrating') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <svg className="animate-spin w-10 h-10 text-[#ED1B2D] mx-auto" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-600 text-sm">Restoring your progress...</p>
        </div>
      </div>
    );
  }

  // ── OTP phase ──
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-lg font-semibold text-gray-900">Resume Your Application</h1>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center pt-12">
        <div className="max-w-md w-full mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-[#ED1B2D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Verify your identity</h2>
            <p className="text-sm text-gray-500">
              We&apos;ve sent a 6-digit code to {tokenData?.maskedMobile}
            </p>
          </div>

          {/* OTP Input */}
          <div className="flex gap-3 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-12 h-14 text-center text-xl font-bold rounded-lg border-2 transition-all focus:outline-none ${
                  otpError
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-300 focus:border-[#ED1B2D]'
                }`}
              />
            ))}
          </div>

          {otpError && (
            <p className="text-center text-sm text-red-600">{otpError}</p>
          )}

          {isVerifying && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Verifying...
            </div>
          )}

          {/* Timer / Resend */}
          <div className="text-center">
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-[#ED1B2D] font-medium text-sm hover:underline"
              >
                Resend OTP
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                Resend code in <span className="font-semibold text-gray-900">{formattedTime}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
