export default function PostContent({ content }: { content: string }) {
  return (
    <div className="prose prose-gray max-w-none">
      <div
        className="text-gray-700 leading-relaxed whitespace-pre-wrap"
        style={{ fontFamily: 'inherit' }}
      >
        {content}
      </div>
    </div>
  );
}
