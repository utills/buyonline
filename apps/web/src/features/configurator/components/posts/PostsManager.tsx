'use client';

import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/lib/constants';
import type { Post, PostStatus } from '@buyonline/shared-types';
import PostTypeBadge from '@/features/posts/components/PostTypeBadge';
import { PostEditor } from './PostEditor';

const STATUS_COLORS: Record<PostStatus, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-gray-100 text-gray-500',
};

interface PostWithCount extends Post {
  _count?: { leads: number };
}

export function PostsManager() {
  const [posts, setPosts] = useState<PostWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Post | null | 'new'>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/posts/admin/all`);
      if (res.ok) setPosts((await res.json()) as PostWithCount[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchPosts(); }, [fetchPosts]);

  const handlePublish = async (post: Post) => {
    const newStatus: PostStatus = post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    await fetch(`${API_BASE_URL}/api/v1/posts/admin/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    void fetchPosts();
  };

  const handleDelete = async (post: Post) => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    await fetch(`${API_BASE_URL}/api/v1/posts/admin/${post.id}`, { method: 'DELETE' });
    void fetchPosts();
  };

  const handleSaved = () => {
    setEditing(null);
    void fetchPosts();
  };

  if (editing !== null) {
    return (
      <PostEditor
        post={editing === 'new' ? null : editing}
        onSaved={handleSaved}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm" style={{ color: 'var(--cfg-text-muted)' }}>
          {posts.length} post{posts.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setEditing('new')}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ background: 'var(--cfg-accent)' }}
        >
          + New Post
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12" style={{ color: 'var(--cfg-text-faint)' }}>Loading…</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 rounded-xl" style={{ border: '2px dashed var(--cfg-border)', color: 'var(--cfg-text-faint)' }}>
          <p className="text-sm">No posts yet. Create your first post.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{ background: 'var(--cfg-surface-raised)', border: '1px solid var(--cfg-border)' }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <PostTypeBadge type={post.type} />
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[post.status]}`}>
                    {post.status}
                  </span>
                  {post._count && post._count.leads > 0 && (
                    <span className="text-xs text-gray-500">{post._count.leads} lead{post._count.leads !== 1 ? 's' : ''}</span>
                  )}
                </div>
                <p className="text-sm font-medium truncate" style={{ color: 'var(--cfg-text)' }}>{post.title}</p>
                <p className="text-xs" style={{ color: 'var(--cfg-text-faint)' }}>/posts/{post.slug}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setEditing(post)}
                  className="px-3 py-1.5 text-xs rounded-lg transition-colors"
                  style={{ background: 'var(--cfg-accent-dim)', color: 'var(--cfg-accent)' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => void handlePublish(post)}
                  className="px-3 py-1.5 text-xs rounded-lg transition-colors"
                  style={{ background: 'var(--cfg-border)', color: 'var(--cfg-text-muted)' }}
                >
                  {post.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => void handleDelete(post)}
                  className="px-3 py-1.5 text-xs rounded-lg text-red-500 transition-colors"
                  style={{ background: 'rgba(239,68,68,0.1)' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
