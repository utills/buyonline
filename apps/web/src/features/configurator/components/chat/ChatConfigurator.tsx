'use client';

import React, { useState } from 'react';
import type { ChatConfig } from '@buyonline/shared-types';

interface ChatConfiguratorProps {
  chat: ChatConfig;
  onChange: (updated: Partial<ChatConfig>) => void;
}

interface ToggleRowProps {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ label, description, enabled, onToggle }) => (
  <div
    className="flex items-center justify-between p-4 rounded-xl"
    style={{ background: 'var(--cfg-surface)', border: '1px solid var(--cfg-border)' }}
  >
    <div>
      <div className="text-sm font-medium" style={{ color: 'var(--cfg-text)' }}>{label}</div>
      <div className="text-xs mt-0.5" style={{ color: 'var(--cfg-text-faint)' }}>{description}</div>
    </div>
    <button
      onClick={onToggle}
      className="flex-shrink-0 w-11 h-6 rounded-full relative transition-colors duration-200"
      style={{ background: enabled ? 'var(--cfg-accent)' : 'var(--cfg-surface-3)' }}
      aria-label={`${enabled ? 'Disable' : 'Enable'} ${label}`}
    >
      <span
        className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
        style={{ transform: enabled ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  </div>
);

export const ChatConfigurator: React.FC<ChatConfiguratorProps> = ({ chat, onChange }) => {
  const [newPrompt, setNewPrompt] = useState('');

  const addPrompt = () => {
    const trimmed = newPrompt.trim();
    if (!trimmed) return;
    onChange({ suggestedPrompts: [...chat.suggestedPrompts, trimmed] });
    setNewPrompt('');
  };

  const removePrompt = (idx: number) => {
    onChange({ suggestedPrompts: chat.suggestedPrompts.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <ToggleRow
        label="AI Chat Enabled"
        description="Routes to Claude API (Standard mode). If disabled, uses static fallback responses."
        enabled={chat.aiEnabled}
        onToggle={() => onChange({ aiEnabled: !chat.aiEnabled })}
      />
      <ToggleRow
        label="Agentic Mode Enabled"
        description="Enables tool-calling agentic loop. Requires AI Chat to be enabled."
        enabled={chat.agenticEnabled && chat.aiEnabled}
        onToggle={() => onChange({ agenticEnabled: !chat.agenticEnabled })}
      />

      {/* Welcome message */}
      <div
        className="p-4 rounded-xl space-y-2"
        style={{ background: 'var(--cfg-surface)', border: '1px solid var(--cfg-border)' }}
      >
        <label className="text-sm font-medium block" style={{ color: 'var(--cfg-text)' }}>
          Welcome Message
        </label>
        <textarea
          value={chat.welcomeMessage}
          onChange={(e) => onChange({ welcomeMessage: e.target.value })}
          rows={3}
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
          style={{
            background: 'var(--cfg-surface-2)',
            border: '1px solid var(--cfg-border)',
            color: 'var(--cfg-text)',
          }}
        />
        {/* Live preview */}
        <div
          className="flex items-start gap-3 p-3 rounded-lg mt-2"
          style={{ background: 'var(--cfg-surface-2)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
            style={{ background: 'var(--cfg-accent)', color: '#fff' }}
          >
            AI
          </div>
          <div
            className="px-3 py-2 rounded-xl text-sm max-w-xs"
            style={{ background: 'var(--cfg-surface-3)', color: 'var(--cfg-text)' }}
          >
            {chat.welcomeMessage || 'Enter a welcome message…'}
          </div>
        </div>
      </div>

      {/* Suggested prompts */}
      <div
        className="p-4 rounded-xl space-y-3"
        style={{ background: 'var(--cfg-surface)', border: '1px solid var(--cfg-border)' }}
      >
        <div className="text-sm font-medium" style={{ color: 'var(--cfg-text)' }}>
          Suggested Prompts ({chat.suggestedPrompts.length})
        </div>
        <div className="space-y-2">
          {chat.suggestedPrompts.map((prompt, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: 'var(--cfg-surface-2)' }}
            >
              <span className="flex-1 text-sm" style={{ color: 'var(--cfg-text)' }}>{prompt}</span>
              <button
                onClick={() => removePrompt(idx)}
                className="text-xs px-2 py-0.5 rounded transition-colors"
                style={{ color: 'var(--cfg-text-faint)', background: 'var(--cfg-surface-3)' }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPrompt()}
            placeholder="Add a suggested prompt…"
            className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
            style={{
              background: 'var(--cfg-surface-2)',
              border: '1px solid var(--cfg-border)',
              color: 'var(--cfg-text)',
            }}
          />
          <button
            onClick={addPrompt}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ background: 'var(--cfg-accent)', color: '#fff' }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};
