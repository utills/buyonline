'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOtp } from '@/hooks/useOtp';
import { useLeadStore } from '@/stores/useLeadStore';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { JourneyStep } from '@buyonline/shared-types';
import { apiClient } from '@/lib/api-client';

export default function OtpVerifyPage() {
  const router = useRouter();
  const { mobile } = useLeadStore();
  const { leadId, advanceTo, markStepComplete, setApplicationId } = useJourneyStore();
  const { formattedTime, canResend, startTimer } = useOtp();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    startTimer();
    inputRefs.current[0]?.focus();
  }, [startTimer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (newOtp.every((d) => d !== '') && index === 5) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode: string) => {
    setIsVerifying(true);
    try {
      const data = await apiClient.post<{ sessionToken?: string }>('/api/v1/otp/verify', {
        mobile,
        otp: otpCode,
      });
      if (data.sessionToken) {
        sessionStorage.setItem('buyonline-session-token', data.sessionToken);
      }

      // Create application from lead
      const appResponse = await apiClient.post<{ id: string }>('/api/v1/applications', {
        leadId,
      });
      setApplicationId(appResponse.id);

      markStepComplete(JourneyStep.LANDING);
      advanceTo(JourneyStep.ONBOARDING);
      router.push('/pincode');
    } catch {
      setError('Invalid OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      const res = await apiClient.post<{ otp?: string }>('/api/v1/otp/resend', {
        mobile,
        purpose: 'LOGIN',
      });
      // DEV ONLY: log OTP for testing
      if (res.otp) {
        console.log(`[DEV] OTP for ${mobile}: ${res.otp}`);
      }
      startTimer();
      setOtp(['', '', '', '', '', '']);
      setError('');
      inputRefs.current[0]?.focus();
    } catch {
      setError('Failed to resend OTP');
    }
  };

  const maskedMobile = mobile
    ? `******${mobile.slice(-4)}`
    : '';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Verify OTP</h1>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center pt-12">
        <div className="max-w-md w-full mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-[#E31837]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Enter verification code</h2>
            <p className="text-sm text-gray-500">
              We&apos;ve sent a 6-digit code to {maskedMobile}
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
                  error
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-300 focus:border-[#E31837]'
                }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-center text-sm text-red-600">{error}</p>
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
                className="text-[#E31837] font-medium text-sm hover:underline"
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
