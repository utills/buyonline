'use client';

import { useEffect } from 'react';
import { nanoid } from 'nanoid';
import { useAgenticStream } from '@/features/ai-journey/hooks/useAgenticStream';
import { useAgenticStore } from '@/features/ai-journey/stores/useAgenticStore';
import AgentChat from '@/features/ai-journey/components/AgentChat';
import ProgressPanel from '@/features/ai-journey/components/ProgressPanel';
import ChatInputBar from '@/features/ai-journey/components/ChatInputBar';

// ─── Initial Greeting ─────────────────────────────────────────────────────────
const GREETING =
  "Hi! I'm PRUHealth AI Assistant — your personal insurance guide.\n\n" +
  "I'll help you find the perfect health insurance plan for your family in just a few minutes.\n\n" +
  "**Who would you like to cover?** You can say something like:\n" +
  '- "Just myself"\n' +
  '- "Me and my wife"\n' +
  '- "Family of 4 — me, wife and 2 kids"';

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AIJourneyPage() {
  const { send, isStreaming } = useAgenticStream();
  const messages = useAgenticStore((s) => s.messages);
  const phase = useAgenticStore((s) => s.phase);
  const collectedData = useAgenticStore((s) => s.collectedData);
  const appendMessage = useAgenticStore((s) => s.appendMessage);
  const reset = useAgenticStore((s) => s.reset);

  // On mount: inject greeting if no messages exist
  useEffect(() => {
    if (messages.length === 0) {
      appendMessage({
        id: nanoid(),
        role: 'assistant',
        content: GREETING,
      });
    }
    // Only run on mount — intentionally omitting deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-1 overflow-hidden h-[calc(100vh-57px)]">
      {/* Left sidebar — progress panel (hidden on mobile) */}
      <aside className="hidden md:flex w-64 flex-shrink-0 border-r border-gray-200 bg-white flex-col">
        <ProgressPanel collectedData={collectedData} phase={phase} onReset={reset} />
      </aside>

      {/* Main chat area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <AgentChat
          messages={messages}
          isStreaming={isStreaming}
          phase={phase}
          onSend={send}
          onReset={reset}
        />
        <ChatInputBar onSend={send} disabled={isStreaming} phase={phase} />
      </div>
    </div>
  );
}
