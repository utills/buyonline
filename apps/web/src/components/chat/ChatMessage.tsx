'use client';

import type { ChatMessage as ChatMessageType } from '@/features/chat/hooks/useChatStream';

export default function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-[#E31837] flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
          <span className="text-white font-bold text-xs">P</span>
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-[#E31837] text-white rounded-tr-sm'
            : message.error
            ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-sm'
            : 'bg-gray-100 text-gray-800 rounded-tl-sm'
        }`}
      >
        {message.content || (
          <span className="flex items-center gap-1" aria-label="Loading response" role="status">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        )}
        {message.isStreaming && message.content && (
          <span className="inline-block w-0.5 h-3.5 bg-gray-500 ml-0.5 animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
}
