'use client';

import { useCallback, useState } from 'react';

// ─── OTP Widget ───────────────────────────────────────────────────────────────
export function OtpChatWidget({ onSubmit }: { onSubmit: (otp: string) => void }) {
  const [otp, setOtp] = useState('');

  const handleSubmit = useCallback(() => {
    if (otp.trim().length >= 4) {
      onSubmit(otp.trim());
      setOtp('');
    }
  }, [otp, onSubmit]);

  return (
    <div className="mt-3 flex gap-2 items-center">
      <input
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
        placeholder="Enter OTP"
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-[#ED1B2D] focus:border-transparent"
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
      />
      <button
        onClick={handleSubmit}
        disabled={otp.length < 4}
        className="bg-[#ED1B2D] text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#C8162A] transition-colors"
      >
        Verify
      </button>
    </div>
  );
}
