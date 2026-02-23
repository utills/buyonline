import Link from 'next/link';
import { API_BASE_URL } from '@/lib/constants';
import type { Post } from '@buyonline/shared-types';
import PostCard from '@/features/posts/components/PostCard';

async function getLatestPosts(): Promise<Post[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/posts`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const posts = (await res.json()) as Post[];
    return posts.slice(0, 3);
  } catch {
    return [];
  }
}

export default async function LatestPosts() {
  const posts = await getLatestPosts();
  if (posts.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Latest Articles</h2>
            <p className="text-sm text-gray-500">Tips, guides, and health insurance insights</p>
          </div>
          <Link href="/posts" className="text-sm font-medium text-red-600 hover:text-red-700 whitespace-nowrap">
            View all →
          </Link>
        </div>
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
