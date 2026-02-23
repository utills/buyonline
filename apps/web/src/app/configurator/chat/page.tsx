'use client';

import React from 'react';
import { ConfigHeader } from '@/features/configurator/components/layout/ConfigHeader';
import { ChatConfigurator } from '@/features/configurator/components/chat/ChatConfigurator';
import { useConfigStore } from '@/features/configurator/store/useConfigStore';

export default function ChatConfigPage() {
  const { config, updateChat } = useConfigStore();

  return (
    <>
      <ConfigHeader
        title="Chat & AI"
        subtitle="Configure AI mode, welcome message, and suggested quick-reply prompts"
      />
      <div className="flex-1 p-6">
        <ChatConfigurator chat={config.chat} onChange={updateChat} />
      </div>
    </>
  );
}
