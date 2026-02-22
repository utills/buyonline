'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { OTP_TIMER_SECONDS } from '@/lib/constants';

interface UseOtpOptions {
  initialSeconds?: number;
  onExpire?: () => void;
}

interface UseOtpReturn {
  timeLeft: number;
  isExpired: boolean;
  isRunning: boolean;
  startTimer: () => void;
  resetTimer: () => void;
  formattedTime: string;
  canResend: boolean;
}

export function useOtp(options: UseOtpOptions = {}): UseOtpReturn {
  const { initialSeconds = OTP_TIMER_SECONDS, onExpire } = options;
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);

  onExpireRef.current = onExpire;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    setTimeLeft(initialSeconds);
    setIsRunning(true);
  }, [initialSeconds, clearTimer]);

  const resetTimer = useCallback(() => {
    clearTimer();
    setTimeLeft(initialSeconds);
    setIsRunning(false);
  }, [initialSeconds, clearTimer]);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          onExpireRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, clearTimer]);

  const isExpired = timeLeft === 0 && !isRunning;
  const canResend = isExpired;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return {
    timeLeft,
    isExpired,
    isRunning,
    startTimer,
    resetTimer,
    formattedTime,
    canResend,
  };
}
