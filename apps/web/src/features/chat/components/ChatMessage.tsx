'use client';

import { renderMarkdown, extractActions } from '@/lib/renderMarkdown';
import type { ChatMessage as ChatMessageType } from '../hooks/useChatStream';

interface Props {
  message: ChatMessageType;
  onAction?: (value: string) => void;
}

// ─── Streaming Dots ────────────────────────────────────────────────────────────
function StreamingDots() {
  return (
    <span className="flex items-center gap-1 py-0.5" aria-label="Loading" role="status">
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </span>
  );
}

export default function ChatMessage({ message, onAction }: Props) {
  const isUser = message.role === 'user';

  // Extract [ACTIONS:...] markers from assistant messages
  const { cleanText, actions } = isUser
    ? { cleanText: message.content, actions: [] }
    : extractActions(message.content);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {/* Assistant avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-[#ED1B2D] flex items-center justify-center mr-2 flex-shrink-0 mt-0.5 shadow-sm">
          <span className="text-white font-bold text-xs">P</span>
        </div>
      )}

      <div className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'} max-w-[84%]`}>
        {/* Bubble */}
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
            isUser
              ? 'bg-[#ED1B2D] text-white rounded-tr-sm'
              : message.error
              ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-sm'
              : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
          }`}
        >
          {isUser ? (
            message.content
          ) : !cleanText && message.isStreaming ? (
            <StreamingDots />
          ) : (
            <>
              <div className="space-y-0.5">
                {renderMarkdown(cleanText)}
              </div>
              {message.isStreaming && cleanText && (
                <span className="inline-block w-0.5 h-3.5 bg-gray-400 ml-0.5 animate-pulse align-middle" />
              )}
            </>
          )}
        </div>

        {/* Action chips — shown only when message is done streaming */}
        {!isUser && !message.isStreaming && actions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 ml-0.5">
            {actions.map((action) => (
              <button
                key={action.value}
                onClick={() => onAction?.(action.value)}
                className="text-xs px-3 py-1.5 rounded-full bg-white border border-[#ED1B2D] text-[#ED1B2D] hover:bg-red-50 transition-colors font-medium shadow-sm"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
