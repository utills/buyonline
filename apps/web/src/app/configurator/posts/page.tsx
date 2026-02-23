'use client';

import React from 'react';
import { ConfigHeader } from '@/features/configurator/components/layout/ConfigHeader';
import { PostsManager } from '@/features/configurator/components/posts/PostsManager';

export default function PostsConfigPage() {
  return (
    <>
      <ConfigHeader
        title="Posts"
        subtitle="Create and manage informative, actionable, and lead generation articles"
      />
      <div className="flex-1 p-6">
        <PostsManager />
      </div>
    </>
  );
}
