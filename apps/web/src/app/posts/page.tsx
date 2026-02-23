import { Metadata } from 'next';
import { API_BASE_URL } from '@/lib/constants';
import type { Post } from '@buyonline/shared-types';
import PostCard from '@/features/posts/components/PostCard';

export const metadata: Metadata = {
  title: 'Health Insurance Articles — BuyOnline',
  description: 'Read expert articles on health insurance, plans, and coverage tips from PRUHealth.',
};

async function getPosts(): Promise<Post[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/posts`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json() as Promise<Post[]>;
  } catch {
    return [];
  }
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Health Insurance Insights</h1>
        <p className="text-gray-500 mb-8">Expert advice, tips, and guides for smarter health coverage.</p>

        {posts.length === 0 ? (
          <p className="text-gray-400 text-center py-16">No articles yet. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
