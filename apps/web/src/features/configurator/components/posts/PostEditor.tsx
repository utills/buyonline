'use client';

import { useState } from 'react';
import { API_BASE_URL } from '@/lib/constants';
import type { Post, PostType } from '@buyonline/shared-types';

interface PostEditorProps {
  post: Post | null;
  onSaved: () => void;
  onCancel: () => void;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

export function PostEditor({ post, onSaved, onCancel }: PostEditorProps) {
  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [type, setType] = useState<PostType>(post?.type ?? 'INFORMATIVE');
  const [content, setContent] = useState(post?.content ?? '');
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '');
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? '');
  const [tags, setTags] = useState((post?.tags ?? []).join(', '));
  const [ctaLabel, setCtaLabel] = useState(post?.ctaLabel ?? '');
  const [ctaType, setCtaType] = useState<'journey' | 'plan'>(
    (post?.ctaType as 'journey' | 'plan') ?? 'journey'
  );
  const [ctaPlanId, setCtaPlanId] = useState(post?.ctaPlanId ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!post) setSlug(slugify(val));
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const body = {
        title: title.trim(),
        slug: slug.trim() || slugify(title.trim()),
        type,
        content: content.trim(),
        excerpt: excerpt.trim() || undefined,
        coverImage: coverImage.trim() || undefined,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        ctaLabel: type === 'ACTIONABLE' ? (ctaLabel.trim() || undefined) : undefined,
        ctaType: type === 'ACTIONABLE' ? ctaType : undefined,
        ctaPlanId: type === 'ACTIONABLE' && ctaType === 'plan' ? (ctaPlanId.trim() || undefined) : undefined,
      };

      const url = post
        ? `${API_BASE_URL}/api/v1/posts/admin/${post.id}`
        : `${API_BASE_URL}/api/v1/posts/admin`;
      const method = post ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(Array.isArray(data.message) ? (data.message as string[]).join(', ') : (data.message ?? 'Save failed'));
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    background: 'var(--cfg-bg)',
    border: '1px solid var(--cfg-border)',
    color: 'var(--cfg-text)',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
  } as React.CSSProperties;

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 500,
    marginBottom: '4px',
    color: 'var(--cfg-text-muted)',
  } as React.CSSProperties;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-base" style={{ color: 'var(--cfg-text)' }}>
          {post ? 'Edit Post' : 'New Post'}
        </h3>
        <button onClick={onCancel} className="text-sm" style={{ color: 'var(--cfg-text-faint)' }}>
          ← Back
        </button>
      </div>

      <div className="space-y-4 max-w-2xl">
        {/* Type selector */}
        <div>
          <label style={labelStyle}>Post Type</label>
          <div className="flex gap-2">
            {(['INFORMATIVE', 'ACTIONABLE', 'LEAD_GEN'] as PostType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background: type === t ? 'var(--cfg-accent)' : 'var(--cfg-border)',
                  color: type === t ? 'white' : 'var(--cfg-text-muted)',
                }}
              >
                {t === 'INFORMATIVE' ? 'Informative' : t === 'ACTIONABLE' ? 'Actionable' : 'Lead Gen'}
              </button>
            ))}
          </div>
        </div>

        {/* Title + auto-slug */}
        <div>
          <label style={labelStyle}>Title *</label>
          <input
            style={inputStyle}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Post title"
          />
        </div>

        <div>
          <label style={labelStyle}>Slug</label>
          <input
            style={inputStyle}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto-generated from title"
          />
        </div>

        <div>
          <label style={labelStyle}>Excerpt</label>
          <input
            style={inputStyle}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short summary (shown on listing)"
          />
        </div>

        <div>
          <label style={labelStyle}>Content *</label>
          <textarea
            style={{ ...inputStyle, minHeight: 200, resize: 'vertical' } as React.CSSProperties}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post content here…"
          />
        </div>

        <div>
          <label style={labelStyle}>Cover Image URL</label>
          <input
            style={inputStyle}
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://…"
          />
        </div>

        <div>
          <label style={labelStyle}>Tags (comma-separated)</label>
          <input
            style={inputStyle}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="health, insurance, family"
          />
        </div>

        {/* ACTIONABLE-specific CTA config */}
        {type === 'ACTIONABLE' && (
          <div
            className="p-4 rounded-xl space-y-3"
            style={{ background: 'var(--cfg-surface-raised)', border: '1px solid var(--cfg-border)' }}
          >
            <p className="text-xs font-semibold" style={{ color: 'var(--cfg-accent)' }}>
              Call-to-Action Settings
            </p>
            <div>
              <label style={labelStyle}>CTA Button Label</label>
              <input
                style={inputStyle}
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                placeholder="Get Covered Now"
              />
            </div>
            <div>
              <label style={labelStyle}>Link To</label>
              <div className="flex gap-2">
                {(['journey', 'plan'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setCtaType(t)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      background: ctaType === t ? 'var(--cfg-accent)' : 'var(--cfg-border)',
                      color: ctaType === t ? 'white' : 'var(--cfg-text-muted)',
                    }}
                  >
                    {t === 'journey' ? 'Buy Journey (homepage)' : 'Specific Plan'}
                  </button>
                ))}
              </div>
            </div>
            {ctaType === 'plan' && (
              <div>
                <label style={labelStyle}>Plan ID</label>
                <input
                  style={inputStyle}
                  value={ctaPlanId}
                  onChange={(e) => setCtaPlanId(e.target.value)}
                  placeholder="e.g. plan-premier"
                />
              </div>
            )}
          </div>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => void handleSave()}
            disabled={saving}
            className="px-6 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors"
            style={{ background: 'var(--cfg-accent)' }}
          >
            {saving ? 'Saving…' : 'Save Post'}
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-lg text-sm transition-colors"
            style={{ background: 'var(--cfg-border)', color: 'var(--cfg-text-muted)' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
