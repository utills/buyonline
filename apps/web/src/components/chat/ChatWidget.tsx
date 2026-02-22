'use client';

import { useState, useEffect } from 'react';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { useChatStream } from '@/hooks/useChatStream';
import ChatWindow from './ChatWindow';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const { applicationId, currentStep } = useJourneyStore();

  const { messages, send, isStreaming, clear } = useChatStream(applicationId);

  // Pulse indicator when a new assistant message arrives (and chat is closed)
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'assistant' && !lastMsg.isStreaming && !isOpen) {
      setHasNewMessage(true);
    }
  }, [messages, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasNewMessage(false);
  };

  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-3">
      {/* Chat window */}
      {isOpen && (
        <div className="w-[340px] h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
          <ChatWindow
            messages={messages}
            isStreaming={isStreaming}
            onSend={send}
            onClose={() => setIsOpen(false)}
            onClear={clear}
            currentStep={currentStep}
          />
        </div>
      )}

      {/* Bubble button */}
      <button
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        className="w-14 h-14 bg-[#E31837] rounded-full shadow-lg flex items-center justify-center hover:bg-[#B8132D] transition-all duration-200 hover:scale-105 active:scale-95 relative"
        aria-label="Open chat assistant"
      >
        {isOpen ? (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}

        {/* Unread dot */}
        {hasNewMessage && !isOpen && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>
    </div>
  );
}
