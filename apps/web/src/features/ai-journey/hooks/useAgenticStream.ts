'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import { API_BASE_URL } from '@/lib/constants';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { useLeadStore } from '@/stores/useLeadStore';
import { JourneyStep } from '@buyonline/shared-types';
import { useAgenticStore } from '../stores/useAgenticStore';
import type { AgenticMessage, AgenticSSEEvent, AgenticStateUpdate, PlanCardData } from '../types';

// ─── Plan Card Parser ─────────────────────────────────────────────────────────
function parsePlanCard(content: string): { text: string; card?: PlanCardData } {
  const match = content.match(/:::plan-card\s*([\s\S]*?):::/);
  if (!match) return { text: content };
  try {
    const card = JSON.parse(match[1].trim()) as PlanCardData;
    const text = content.replace(/:::plan-card[\s\S]*?:::/, '').trim();
    return { text, card };
  } catch {
    return { text: content };
  }
}

// ─── Phase Placeholder Map ────────────────────────────────────────────────────
export function getPlaceholderForPhase(phase: string): string {
  const map: Record<string, string> = {
    greeting: 'Tell me who to cover...',
    members: 'e.g. "Me and my wife"',
    age: 'Enter age of eldest member...',
    otp_sent: 'Enter OTP...',
    otp_verify: 'Enter OTP...',
    pincode: 'Enter 6-digit pincode...',
    pre_existing: 'Describe any pre-existing conditions...',
    eligibility: 'Type your response...',
    plan_selection: 'Tell me your preference...',
    addon_selection: 'Choose add-ons or type "done"...',
    proposer_details: 'Enter your details...',
    payment_redirect: 'Completing payment...',
    post_payment: 'Type your message...',
    kyc: 'Type your message...',
    health_declaration: 'Type your response...',
    complete: 'Journey complete',
  };
  return map[phase] ?? 'Type your message...';
}

// ─── Extract collected data fields from a state update ───────────────────────
function stateUpdateToCollectedData(update: AgenticStateUpdate): {
  members?: Partial<{ self: boolean; spouse: boolean; kidsCount: number }>;
  eldestAge?: number;
  mobile?: string;
  pincode?: string;
  hospitalCount?: number;
  preExisting?: string[];
  planSelected?: AgenticStateUpdate['planSelected'];
  kycVerified?: boolean;
  healthSubmitted?: boolean;
  paymentDone?: boolean;
} {
  const {
    // phase is handled separately — strip it out
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    phase: _phase,
    ...rest
  } = update;
  return rest;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAgenticStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const router = useRouter();

  const agenticStore = useAgenticStore();

  const send = useCallback(
    async (content: string) => {
      if (isStreaming || !content.trim()) return;

      const trimmed = content.trim();

      // Add user message
      const userMsg: AgenticMessage = {
        id: nanoid(),
        role: 'user',
        content: trimmed,
      };
      agenticStore.appendMessage(userMsg);

      // Add empty streaming assistant message
      const assistantId = nanoid();
      const assistantMsg: AgenticMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        isStreaming: true,
      };
      agenticStore.appendMessage(assistantMsg);
      setIsStreaming(true);

      abortRef.current = new AbortController();

      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/chat/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: agenticStore.sessionId,
            message: trimmed,
            journeyMode: 'agentic',
            applicationId: agenticStore.applicationId ?? undefined,
          }),
          signal: abortRef.current.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let accumulatedContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            let data: AgenticSSEEvent;
            try {
              data = JSON.parse(line.slice(6)) as AgenticSSEEvent;
            } catch {
              continue;
            }

            // ── Error ──────────────────────────────────────────────────────────
            if (data.error) {
              agenticStore.updateLastMessage((msg) => ({
                ...msg,
                content: data.error!,
                isStreaming: false,
                error: true,
              }));
              return;
            }

            // ── Token ──────────────────────────────────────────────────────────
            if (data.token) {
              accumulatedContent += data.token;
              agenticStore.updateLastMessage((msg) => ({
                ...msg,
                content: accumulatedContent,
              }));
            }

            // ── State Update ───────────────────────────────────────────────────
            if (data.stateUpdate) {
              const { phase, ...collectedFields } = data.stateUpdate;
              if (phase) agenticStore.setPhase(phase);
              const update = stateUpdateToCollectedData({ phase, ...collectedFields });
              agenticStore.updateCollectedData(update);
              // Wire applicationId to shared journey store so chat widget gains context
              if (data.stateUpdate.applicationId) {
                useJourneyStore.getState().setApplicationId(data.stateUpdate.applicationId);
                agenticStore.setApplicationId(data.stateUpdate.applicationId);
              }
            }

            // ── Redirect ───────────────────────────────────────────────────────
            if (data.redirect) {
              router.push(data.redirect.path);
            }

            // ── Handoff ────────────────────────────────────────────────────────
            if (data.handoff) {
              const { handoff } = data;
              useJourneyStore.getState().setApplicationId(handoff.applicationId);
              useJourneyStore.getState().setLeadId(handoff.leadId);
              useJourneyStore.getState().advanceTo(JourneyStep.COMPLETE);
              useLeadStore.getState().setMobile(handoff.mobile);
              agenticStore.setApplicationId(handoff.applicationId);
              agenticStore.setLeadId(handoff.leadId);
              agenticStore.setPhase('complete');
              agenticStore.updateLastMessage((msg) => ({
                ...msg,
                isStreaming: false,
                widget: 'handoff',
                widgetData: { applicationId: handoff.applicationId },
              }));
              router.push(handoff.redirectPath);
              return;
            }

            // ── Done ───────────────────────────────────────────────────────────
            if (data.done) {
              const currentPhase = agenticStore.phase;
              const { text, card } = parsePlanCard(accumulatedContent);

              agenticStore.updateLastMessage((msg) => {
                const updated: AgenticMessage = {
                  ...msg,
                  content: card ? text : accumulatedContent,
                  isStreaming: false,
                };

                // Widget: OTP sent
                if (currentPhase === 'otp_sent') {
                  updated.widget = 'otp';
                }

                // Widget: Plan card detected
                if (card) {
                  updated.widget = 'plan-card';
                  updated.widgetData = card as unknown as Record<string, unknown>;
                }

                return updated;
              });
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        agenticStore.updateLastMessage((msg) => ({
          ...msg,
          content: "Sorry, I couldn't connect. Please try again.",
          isStreaming: false,
          error: true,
        }));
      } finally {
        agenticStore.updateLastMessage((msg) =>
          msg.isStreaming ? { ...msg, isStreaming: false } : msg
        );
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isStreaming, router]
  );

  return { send, isStreaming };
}
