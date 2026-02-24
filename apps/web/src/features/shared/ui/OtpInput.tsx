'use client';

import { useCallback, useRef, useState } from 'react';

interface OtpInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function OtpInput({
  length = 6,
  onComplete,
  disabled = false,
  className = '',
}: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const focusNext = useCallback(
    (index: number) => {
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [length]
  );

  const focusPrev = useCallback((index: number) => {
    if (index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, []);

  const handleChange = useCallback(
    (index: number, value: string) => {
      // Only accept single digits
      const digit = value.replace(/\D/g, '').slice(-1);
      const next = [...digits];
      next[index] = digit;
      setDigits(next);

      if (digit) {
        focusNext(index);
        const full = next.join('');
        if (full.length === length && onComplete) {
          onComplete(full);
        }
      }
    },
    [digits, focusNext, length, onComplete]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        if (digits[index]) {
          const next = [...digits];
          next[index] = '';
          setDigits(next);
        } else {
          focusPrev(index);
        }
      } else if (e.key === 'ArrowLeft') {
        focusPrev(index);
      } else if (e.key === 'ArrowRight') {
        focusNext(index);
      }
    },
    [digits, focusPrev, focusNext]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
      const next = Array(length).fill('');
      for (let i = 0; i < pasted.length; i++) {
        next[i] = pasted[i];
      }
      setDigits(next);
      const focusIndex = Math.min(pasted.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
      if (pasted.length === length && onComplete) {
        onComplete(pasted);
      }
    },
    [length, onComplete]
  );

  return (
    <div className={`flex items-center gap-2 ${className}`} role="group" aria-label="OTP input">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          aria-label={`Digit ${i + 1}`}
          className="w-10 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED1B2D] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
        />
      ))}
    </div>
  );
}
