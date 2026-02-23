'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { API_BASE_URL } from '@/lib/constants';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  error?: boolean;
}

const SESSION_KEY = 'buyonline-chat-sid';
const MESSAGES_KEY = 'buyonline-chat-msgs';
const MAX_PERSISTED = 40;

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — ignore
  }
}

export function useChatStream(applicationId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    loadFromStorage<ChatMessage[]>(MESSAGES_KEY, []).map((m) => ({
      ...m,
      isStreaming: false,
    }))
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [useAI, setUseAI] = useState(true);

  // Restore session ID from storage so backend can resume conversation history
  const sessionId = useRef<string>(
    loadFromStorage<string>(SESSION_KEY, '') || nanoid()
  );

  const abortRef = useRef<AbortController | null>(null);

  // Persist sessionId on first mount
  useEffect(() => {
    saveToStorage(SESSION_KEY, sessionId.current);
  }, []);

  // Persist messages whenever they change (skip streaming placeholders)
  useEffect(() => {
    const toSave = messages
      .filter((m) => !m.isStreaming)
      .slice(-MAX_PERSISTED);
    saveToStorage(MESSAGES_KEY, toSave);
  }, [messages]);

  const send = useCallback(
    async (content: string) => {
      if (isStreaming || !content.trim()) return;

      const userMsg: ChatMessage = { id: nanoid(), role: 'user', content: content.trim() };
      const assistantId = nanoid();
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);
      abortRef.current = new AbortController();

      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/chat/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionId.current,
            message: content.trim(),
            applicationId: applicationId ?? undefined,
            useAI,
          }),
          signal: abortRef.current.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const data = JSON.parse(line.slice(6)) as {
                token?: string;
                done?: boolean;
                error?: string;
              };

              if (data.error) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: data.error!, isStreaming: false, error: true }
                      : m
                  )
                );
                return;
              }

              if (data.token) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: m.content + data.token }
                      : m
                  )
                );
              }

              if (data.done === true) {
                // Mark the last message as no longer streaming
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, isStreaming: false } : m
                  )
                );
              }
            } catch {
              // Ignore malformed SSE lines
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: "Sorry, I couldn't connect. Please try again.",
                  isStreaming: false,
                  error: true,
                }
              : m
          )
        );
      } finally {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m))
        );
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming, applicationId, useAI]
  );

  const clear = useCallback(() => {
    abortRef.current?.abort();
    // Start fresh session
    sessionId.current = nanoid();
    saveToStorage(SESSION_KEY, sessionId.current);
    saveToStorage(MESSAGES_KEY, []);
    setMessages([]);
    setIsStreaming(false);
  }, []);

  return { messages, send, isStreaming, clear, useAI, setUseAI };
}
