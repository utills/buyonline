'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { JourneyStep } from '@buyonline/shared-types';
import type { ChatMessage as ChatMessageType } from '../hooks/useChatStream';
import ChatMessage from './ChatMessage';

// ─── Size icons (inline SVG) ──────────────────────────────────────────────────
function IconCompact() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="1" width="6" height="8" rx="1" opacity="0.4" />
      <rect x="9" y="1" width="6" height="8" rx="1" opacity="0.4" />
      <rect x="1" y="11" width="14" height="4" rx="1" />
    </svg>
  );
}
function IconMedium() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="1" width="14" height="10" rx="1" opacity="0.5" />
      <rect x="1" y="13" width="14" height="2" rx="1" />
    </svg>
  );
}
function IconLarge() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="1" width="14" height="14" rx="1.5" />
    </svg>
  );
}

// ─── Step context ─────────────────────────────────────────────────────────────
interface StepContext {
  greeting: string;
  subtext: string;
  suggestions: string[];
}

const STEP_CONTEXT: Record<JourneyStep, StepContext> = {
  [JourneyStep.LANDING]: {
    greeting: 'How can I help you?',
    subtext: 'Ask about plans, coverage, or premiums',
    suggestions: [
      'What plans do you offer?',
      'Which plan covers maternity?',
      'How are premiums calculated?',
      'What is a waiting period?',
    ],
  },
  [JourneyStep.ONBOARDING]: {
    greeting: 'Setting up your profile?',
    subtext: 'I can guide you through eligibility and coverage options',
    suggestions: [
      'Who can I add as a member?',
      'What age limit applies for coverage?',
      'Can I cover my parents?',
      'What is a floater plan?',
    ],
  },
  [JourneyStep.QUOTE]: {
    greeting: 'Choosing a plan?',
    subtext: 'Let me help you compare and find the right fit',
    suggestions: [
      'Compare Premier vs Signature',
      'Which plan has the best hospital coverage?',
      'Which plan covers maternity?',
      'What add-ons should I consider?',
    ],
  },
  [JourneyStep.PAYMENT]: {
    greeting: 'Ready to pay?',
    subtext: 'I can answer any questions before you complete your purchase',
    suggestions: [
      'Is my payment secure?',
      'What payment methods are accepted?',
      'Can I pay in EMI?',
      'What happens after I pay?',
    ],
  },
  [JourneyStep.KYC]: {
    greeting: 'Need help with KYC?',
    subtext: 'I can explain what documents you need and how it works',
    suggestions: [
      'What documents do I need for KYC?',
      'How long does KYC take?',
      'What is the difference between eKYC and manual KYC?',
      'My KYC verification failed — what now?',
    ],
  },
  [JourneyStep.HEALTH]: {
    greeting: 'Health declaration questions?',
    subtext: 'I can explain what each question means and why it matters',
    suggestions: [
      'What is a pre-existing condition?',
      'Do I need to disclose past illnesses?',
      'What happens if I have a pre-existing condition?',
      'How does the waiting period work?',
    ],
  },
  [JourneyStep.COMPLETE]: {
    greeting: "You're almost done!",
    subtext: 'Your policy is being processed. Any questions about what comes next?',
    suggestions: [
      'When will my policy be issued?',
      'How do I make a claim?',
      'How do I find a network hospital?',
      'Can I add members to my policy later?',
    ],
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────
export type ChatSize = 'compact' | 'medium' | 'large';

interface ChatWindowProps {
  messages: ChatMessageType[];
  isStreaming: boolean;
  onSend: (message: string) => void;
  onClose: () => void;
  onClear: () => void;
  currentStep?: JourneyStep;
  useAI: boolean;
  onToggleAI: () => void;
  size: ChatSize;
  onSizeChange: (size: ChatSize) => void;
}

// ─── ChatWindow ───────────────────────────────────────────────────────────────
export default function ChatWindow({
  messages,
  isStreaming,
  onSend,
  onClose,
  onClear,
  currentStep,
  useAI,
  onToggleAI,
  size,
  onSizeChange,
}: ChatWindowProps) {
  const router = useRouter();
  const ctx = STEP_CONTEXT[currentStep ?? JourneyStep.LANDING];
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    // Handle navigation actions emitted as NAVIGATE:/path
    if (msg.startsWith('NAVIGATE:')) {
      router.push(msg.slice('NAVIGATE:'.length));
      onClose();
      return;
    }
    if (isStreaming) return;
    if (!text) setInput('');
    onSend(msg);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const SIZES: { key: ChatSize; icon: React.ReactNode; label: string }[] = [
    { key: 'compact', icon: <IconCompact />, label: 'Compact' },
    { key: 'medium', icon: <IconMedium />, label: 'Medium' },
    { key: 'large', icon: <IconLarge />, label: 'Large' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-[#ED1B2D] px-3 py-2.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm">
            <span className="text-[#ED1B2D] font-bold text-xs">P</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">PRUHealth Assistant</p>
            <p className="text-red-200 text-[10px] leading-tight">
              {useAI ? 'AI-powered' : 'Basic mode'} · Ask me anything
            </p>
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          {/* Size buttons */}
          {SIZES.map(({ key, icon, label }) => (
            <button
              key={key}
              type="button"
              title={`${label} view`}
              onClick={() => onSizeChange(key)}
              className={`p-1.5 rounded transition-colors ${
                size === key
                  ? 'bg-white/25 text-white'
                  : 'text-red-200 hover:text-white hover:bg-white/15'
              }`}
            >
              {icon}
            </button>
          ))}

          {/* Divider */}
          <span className="w-px h-4 bg-white/20 mx-1" />

          {/* AI toggle */}
          <button
            type="button"
            onClick={onToggleAI}
            title={useAI ? 'Switch to Basic mode' : 'Switch to AI mode'}
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors border border-white/30 hover:border-white/60 bg-white/10 hover:bg-white/20"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${useAI ? 'bg-green-400' : 'bg-white/40'}`} />
            <span className={useAI ? 'text-white' : 'text-red-200'}>{useAI ? 'AI' : 'Basic'}</span>
          </button>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 text-red-200 hover:text-white rounded"
              title="Clear chat"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-red-200 hover:text-white rounded"
            title="Close"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-6">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center border border-red-100">
              <svg className="w-7 h-7 text-[#ED1B2D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-800 font-medium text-sm">{ctx.greeting}</p>
              <p className="text-gray-400 text-xs mt-1">{ctx.subtext}</p>
            </div>
            <div className="grid grid-cols-1 gap-1.5 w-full max-w-xs">
              {ctx.suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSend(s)}
                  className="text-left text-xs bg-white hover:bg-red-50 hover:text-[#ED1B2D] border border-gray-200 hover:border-red-200 rounded-xl px-3 py-2 text-gray-600 transition-colors shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} onAction={handleSend} />
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 px-3 py-2.5 bg-white flex-shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question..."
            rows={1}
            maxLength={500}
            disabled={isStreaming}
            className="flex-1 resize-none rounded-xl border border-gray-200 focus:border-[#ED1B2D] focus:ring-1 focus:ring-[#ED1B2D] px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 max-h-24 overflow-y-auto"
            style={{ lineHeight: '1.4' }}
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || isStreaming}
            className="w-8 h-8 bg-[#ED1B2D] rounded-full flex items-center justify-center flex-shrink-0 hover:bg-[#C8162A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors mb-0.5"
          >
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
        <p className="text-gray-300 text-xs mt-1 text-right">{input.length}/500</p>
      </div>
    </div>
  );
}
