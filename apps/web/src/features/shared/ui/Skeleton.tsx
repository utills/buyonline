import React from 'react';

/**
 * Base skeleton block — pulsing gray rectangle.
 * All variants are server-component safe.
 */
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={['animate-pulse bg-gray-200 rounded', className].filter(Boolean).join(' ')}
    />
  );
}

/** Single full-width text line placeholder (h-4). */
function SkeletonText({ className = '' }: { className?: string }) {
  return <Skeleton className={['w-full h-4', className].filter(Boolean).join(' ')} />;
}

/** Circular avatar/icon placeholder. */
function SkeletonCircle({ className = '' }: { className?: string }) {
  return <Skeleton className={['w-10 h-10 rounded-full', className].filter(Boolean).join(' ')} />;
}

/** Card composed of a circle and three text lines. */
function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={[
        'flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100',
        className,
      ].filter(Boolean).join(' ')}
    >
      <SkeletonCircle className="flex-shrink-0 mt-0.5" />
      <div className="flex-1 flex flex-col gap-2.5">
        <SkeletonText className="w-3/4" />
        <SkeletonText className="w-full" />
        <SkeletonText className="w-1/2" />
      </div>
    </div>
  );
}

Skeleton.Text   = SkeletonText;
Skeleton.Circle = SkeletonCircle;
Skeleton.Card   = SkeletonCard;

export default Skeleton;
