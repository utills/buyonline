'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useOtp } from '@/hooks/useOtp';
import { useKycStore } from '@/stores/useKycStore';
import { useLeadStore } from '@/stores/useLeadStore';
import { KycStatus } from '@buyonline/shared-types';
import { apiClient } from '@/lib/api-client';

export default function KycOtpPage() {
  const router = useRouter();
  const { setStatus } = useKycStore();
  const { mobile } = useLeadStore();
  const { formattedTime, canResend, startTimer } = useOtp();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [forceCanResend, setForceCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const sendOtp = useCallback(async () => {
    if (!mobile) {
      setError('Session expired. Please restart from the beginning.');
      return;
    }
    try {
      await apiClient.post('/api/v1/otp/send', { mobile, purpose: 'KYC' });
      startTimer();
    } catch {
      setError('Failed to send OTP. Please try again.');
    }
  }, [mobile, startTimer]);

  useEffect(() => {
    sendOtp();
    inputRefs.current[0]?.focus();
  }, [sendOtp]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

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

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split('');
      setOtp(newOtp);
      setError('');
      inputRefs.current[5]?.focus();
      handleVerify(pasted);
    }
  };

  const handleVerify = async (otpCode: string) => {
    setIsVerifying(true);
    try {
      const data = await apiClient.post<{ sessionToken?: string }>('/api/v1/otp/verify', { mobile, otp: otpCode });
      if (data.sessionToken) {
        sessionStorage.setItem('buyonline-session-token', data.sessionToken);
      }
      setStatus(KycStatus.VERIFIED);
      router.push('/kyc-success');
    } catch {
      setError('Invalid OTP. Please try again.');
      setForceCanResend(true); // allow immediate resend after failure
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-xl font-bold text-gray-900">Verify KYC OTP</h1>
        <p className="text-sm text-gray-500">
          Enter the OTP sent to your registered mobile number
        </p>
      </div>

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
            onPaste={handlePaste}
            className={`w-12 h-14 text-center text-xl font-bold rounded-lg border-2 focus:outline-none ${
              error ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-[#E31837]'
            }`}
          />
        ))}
      </div>

      {error && <p className="text-center text-sm text-red-600">{error}</p>}

      {isVerifying && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Verifying...
        </div>
      )}

      <div className="text-center">
        {(canResend || forceCanResend) ? (
          <button
            onClick={() => {
              setOtp(['', '', '', '', '', '']);
              setError('');
              setForceCanResend(false);
              inputRefs.current[0]?.focus();
              sendOtp();
            }}
            className="text-[#E31837] font-medium text-sm hover:underline"
          >
            Resend OTP
          </button>
        ) : (
          <p className="text-sm text-gray-500">
            Resend in <span className="font-semibold text-gray-900">{formattedTime}</span>
          </p>
        )}
      </div>
    </div>
  );
}
