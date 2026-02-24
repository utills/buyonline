'use client';

import { useEffect, useRef } from 'react';
import type { AgenticMessage, AgenticPhase, PlanCardData } from '../types';
import { OtpChatWidget } from './OtpChatWidget';
import { PlanRecommendationCard } from './PlanRecommendationCard';
import { UploadChatWidget } from './UploadChatWidget';
import { renderMarkdown } from '@/lib/renderMarkdown';

// ─── Streaming Dots ───────────────────────────────────────────────────────────
function StreamingDots({ visible = true }: { visible?: boolean }) {
  return (
    <span
      className={`flex items-center gap-1 py-0.5 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      aria-label="Loading response"
      role="status"
    >
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </span>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({
  message,
  onOtpSubmit,
  onPlanSelect,
  onFileUpload,
}: {
  message: AgenticMessage;
  onOtpSubmit: (otp: string) => void;
  onPlanSelect: (plan: PlanCardData) => void;
  onFileUpload: (file: File) => void;
}) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {/* Assistant avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-[#ED1B2D] flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
          <span className="text-white font-bold text-xs">P</span>
        </div>
      )}

      <div className="max-w-[80%] flex flex-col">
        {/* Bubble */}
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
            isUser
              ? 'bg-[#ED1B2D] text-white rounded-tr-sm'
              : message.error
              ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-sm'
              : 'bg-gray-100 text-gray-800 rounded-tl-sm'
          }`}
        >
          {!message.content && message.isStreaming ? (
            <StreamingDots />
          ) : (
            <>
              {renderMarkdown(message.content)}
              {message.isStreaming && message.content && (
                <span className="inline-block w-0.5 h-3.5 bg-gray-500 ml-0.5 animate-pulse align-middle" />
              )}
            </>
          )}
        </div>

        {/* Widgets */}
        {!message.isStreaming && message.widget === 'otp' && (
          <OtpChatWidget onSubmit={onOtpSubmit} />
        )}
        {!message.isStreaming && message.widget === 'plan-card' && message.widgetData && (
          <PlanRecommendationCard
            data={message.widgetData as unknown as PlanCardData}
            onSelect={onPlanSelect}
          />
        )}
        {!message.isStreaming && message.widget === 'upload' && (
          <UploadChatWidget
            onUpload={onFileUpload}
            label={(message.widgetData?.label as string | undefined) ?? 'Upload Document'}
          />
        )}
      </div>
    </div>
  );
}

// ─── Agent Chat ───────────────────────────────────────────────────────────────
interface AgentChatProps {
  messages: AgenticMessage[];
  isStreaming: boolean;
  phase: AgenticPhase;
  onSend: (msg: string) => void;
  onReset?: () => void;
}

export default function AgentChat({ messages, isStreaming, phase, onSend, onReset }: AgentChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleReset = () => {
    if (window.confirm('Start a new conversation? Your current progress will be lost.')) {
      onReset?.();
    }
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOtpSubmit = (otp: string) => {
    onSend(otp);
  };

  const handlePlanSelect = (plan: PlanCardData) => {
    onSend(`I'd like to select the ${plan.planName} plan with ${plan.sumInsuredLabel} cover.`);
  };

  const handleFileUpload = (_file: File) => {
    // File upload handled by widget; notify chat
    onSend('I have uploaded the document.');
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 relative">
      {/* New conversation button */}
      {messages.length > 1 && onReset && (
        <div className="sticky top-0 flex justify-end z-10 pointer-events-none">
          <button
            onClick={handleReset}
            className="pointer-events-auto text-xs text-gray-400 hover:text-gray-600 transition-colors bg-white/80 backdrop-blur-sm rounded-full px-3 py-1"
          >
            New conversation
          </button>
        </div>
      )}

      {messages.length === 0 && !isStreaming && (
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
          Starting your journey...
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          onOtpSubmit={handleOtpSubmit}
          onPlanSelect={handlePlanSelect}
          onFileUpload={handleFileUpload}
        />
      ))}

      {/* Streaming indicator when last message is from user and we're waiting */}
      {isStreaming && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
        <div className="flex justify-start mb-3 transition-opacity duration-300">
          <div className="w-7 h-7 rounded-full bg-[#ED1B2D] flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
            <span className="text-white font-bold text-xs">P</span>
          </div>
          <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
            <StreamingDots />
          </div>
        </div>
      )}

      {/* Hidden element to scroll into view */}
      <div ref={bottomRef} aria-hidden="true" />

      {/* Phase indicator */}
      {(phase === 'payment_redirect' || phase === 'complete') && (
        <div className="text-center py-2">
          <span className="text-xs text-gray-400 bg-gray-50 rounded-full px-3 py-1">
            {phase === 'complete' ? 'Journey complete' : 'Redirecting to payment...'}
          </span>
        </div>
      )}
    </div>
  );
}
