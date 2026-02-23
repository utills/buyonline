import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/constants';
import type { Post } from '@buyonline/shared-types';
import PostTypeBadge from '@/features/posts/components/PostTypeBadge';
import PostContent from '@/features/posts/components/PostContent';
import ActionableCTA from '@/features/posts/components/ActionableCTA';
import LeadCaptureWidget from '@/features/posts/components/LeadCaptureWidget';

async function getPost(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/posts/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<Post>;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.metaTitle ?? `${post.title} — BuyOnline`,
    description: post.metaDesc ?? post.excerpt,
  };
}

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/posts" className="text-sm text-red-600 hover:text-red-700 mb-6 inline-block">
          ← Back to articles
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <PostTypeBadge type={post.type} />
          {post.publishedAt && (
            <span className="text-xs text-gray-400">
              {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">{post.title}</h1>
        {post.excerpt && <p className="text-gray-500 mb-6 text-base leading-relaxed">{post.excerpt}</p>}

        {post.coverImage && (
          <img src={post.coverImage} alt={post.title} className="w-full rounded-xl mb-6 object-cover max-h-64" />
        )}

        {/* LEAD_GEN: show lead capture above content */}
        {post.type === 'LEAD_GEN' && (
          <LeadCaptureWidget slug={post.slug} />
        )}

        <PostContent content={post.content} />

        {/* ACTIONABLE: CTA after content */}
        {post.type === 'ACTIONABLE' && (
          <ActionableCTA
            label={post.ctaLabel}
            ctaType={post.ctaType as 'journey' | 'plan' | undefined}
            ctaPlanId={post.ctaPlanId ?? undefined}
          />
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
