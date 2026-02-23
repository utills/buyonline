import type { PostType } from '@buyonline/shared-types';

const TYPE_LABELS: Record<PostType, string> = {
  INFORMATIVE: 'Article',
  ACTIONABLE: 'Take Action',
  LEAD_GEN: 'Get a Quote',
};

const TYPE_COLORS: Record<PostType, string> = {
  INFORMATIVE: 'bg-gray-100 text-gray-700',
  ACTIONABLE: 'bg-blue-100 text-blue-700',
  LEAD_GEN: 'bg-green-100 text-green-700',
};

export default function PostTypeBadge({ type }: { type: PostType }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[type]}`}>
      {TYPE_LABELS[type]}
    </span>
  );
}
