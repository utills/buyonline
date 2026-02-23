export default function AIJourneyLoading() {
  return (
    <div className="flex flex-1 overflow-hidden h-[calc(100vh-57px)]">
      {/* Left sidebar skeleton (hidden on mobile) */}
      <aside className="hidden md:flex w-64 flex-shrink-0 border-r border-gray-200 bg-white flex-col p-4 gap-3">
        <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
        <div className="h-2 bg-gray-100 rounded animate-pulse w-full" />
        <div className="space-y-3 mt-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
              <div className="h-3 rounded bg-gray-100 animate-pulse" style={{ width: `${60 + i * 8}%` }} />
            </div>
          ))}
        </div>
      </aside>

      {/* Chat area skeleton */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 px-4 py-4 space-y-4 overflow-hidden">
          {/* Assistant bubble */}
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
            <div className="space-y-1.5 max-w-[70%]">
              <div className="h-4 w-48 bg-gray-100 rounded-2xl animate-pulse" />
              <div className="h-4 w-64 bg-gray-100 rounded-2xl animate-pulse" />
              <div className="h-4 w-40 bg-gray-100 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
        {/* Input skeleton */}
        <div className="border-t border-gray-200 bg-white px-4 py-3">
          <div className="h-11 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
