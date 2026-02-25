'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AgenticPhase } from '../types';
import { getPlaceholderForPhase } from '../hooks/useAgenticStream';

interface ChatInputBarProps {
  onSend: (msg: string) => void;
  disabled: boolean;
  phase: AgenticPhase;
}

const MAX_CHARS = 500;
const DISABLED_PHASES: AgenticPhase[] = ['payment_redirect', 'complete'];

// Phases where the OTP widget in AgentChat handles input — hide chips + main input
const OTP_PHASES: AgenticPhase[] = ['otp_sent', 'otp_verify'];

const QUICK_REPLIES: Partial<Record<AgenticPhase, string[]>> = {
  greeting: ['Just myself', 'Me and my spouse', 'Family of 3', 'Family of 4+'],
  members: ['Self only', 'Self + Spouse', 'Self + 2 Kids', 'Self + Spouse + 2 Kids'],
  age: ['Under 30', '30–40 years', '40–50 years', '50+ years'],
  pre_existing: ['No conditions', 'Diabetes', 'Hypertension', 'None of the above'],
  plan_selection: ['Show affordable options', 'Best family plan', "What's recommended?"],
  addon_selection: ['No add-ons', 'Tell me about add-ons', 'Skip add-ons'],
};

export default function ChatInputBar({ onSend, disabled, phase }: ChatInputBarProps) {
  const [value, setValue] = useState('');
  // Track whether a chip has been used for the current phase so chips are hidden
  // until the AI responds and the phase changes.
  const [chipUsedForPhase, setChipUsedForPhase] = useState<AgenticPhase | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDisabled = disabled || DISABLED_PHASES.includes(phase);
  const isOtpPhase = OTP_PHASES.includes(phase);
  const placeholder = getPlaceholderForPhase(phase);
  const charsLeft = MAX_CHARS - value.length;

  // Reset the "chip used" state when the phase changes (AI has responded)
  useEffect(() => {
    setChipUsedForPhase(null);
  }, [phase]);

  const quickReplies =
    chipUsedForPhase === phase ? [] : (QUICK_REPLIES[phase] ?? []);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineHeight = 24;
    const maxHeight = lineHeight * 3 + 20; // 3 rows + padding
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [value]);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isDisabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, isDisabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleChipClick = useCallback(
    (chip: string) => {
      if (isDisabled) return;
      onSend(chip);
      // Hide chips until the phase changes (AI responds and advances the phase)
      setChipUsedForPhase(phase);
    },
    [isDisabled, onSend, phase]
  );

  // When OTP phase is active, only show a minimal hint — the OTP widget in the
  // chat bubble handles the actual input.
  if (isOtpPhase) {
    return (
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <p className="text-xs text-gray-400 text-center">
          Please enter the OTP in the verification box above.
        </p>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      {/* Quick-reply chips */}
      {quickReplies.length > 0 && !isDisabled && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide">
          {quickReplies.map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              className="text-xs px-3 py-1.5 rounded-full border border-[#ED1B2D] text-[#ED1B2D] hover:bg-red-50 whitespace-nowrap transition-colors cursor-pointer flex-shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) {
                setValue(e.target.value);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isDisabled}
            rows={1}
            className="w-full resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ED1B2D] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors leading-6"
            aria-label="Chat input"
          />
          {/* Character count */}
          {value.length > MAX_CHARS * 0.8 && (
            <span
              className={`absolute bottom-2 right-3 text-xs ${
                charsLeft < 50 ? 'text-red-500' : 'text-gray-400'
              }`}
            >
              {charsLeft}
            </span>
          )}
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={isDisabled || !value.trim()}
          aria-label="Send message"
          className="flex-shrink-0 w-10 h-10 bg-[#ED1B2D] rounded-xl flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#C8162A] active:bg-[#8E0F22] transition-colors"
        >
          <svg
            className="w-4 h-4 rotate-90"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>

      {/* Hint text */}
      <p className="text-xs text-gray-400 mt-1.5 ml-0.5">
        {isDisabled && phase === 'complete'
          ? 'Your application is complete.'
          : isDisabled && phase === 'payment_redirect'
          ? 'Please complete payment in the new window.'
          : 'Press Enter to send, Shift+Enter for new line'}
      </p>
    </div>
  );
}
