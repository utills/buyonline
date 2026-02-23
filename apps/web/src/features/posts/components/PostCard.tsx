import Link from 'next/link';
import type { Post } from '@buyonline/shared-types';
import PostTypeBadge from './PostTypeBadge';

export default function PostCard({ post }: { post: Partial<Post> & Pick<Post, 'slug' | 'title' | 'type'> }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="block bg-white rounded-xl border border-gray-200 hover:border-red-200 hover:shadow-md transition-all p-5"
    >
      {post.coverImage && (
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-40 object-cover rounded-lg mb-4"
        />
      )}
      <div className="flex items-center gap-2 mb-2">
        <PostTypeBadge type={post.type} />
        {post.publishedAt && (
          <span className="text-xs text-gray-400">
            {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )}
      </div>
      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{post.title}</h3>
      {post.excerpt && (
        <p className="text-sm text-gray-500 line-clamp-3">{post.excerpt}</p>
      )}
      <span className="mt-3 inline-block text-sm font-medium text-red-600 hover:text-red-700">
        Read more →
      </span>
    </Link>
  );
}
