import type { ReactNode } from 'react';

/**
 * Renders a markdown-lite string into React nodes.
 * Supports: **bold**, - bullet lines, numbered lists.
 */
export function renderMarkdown(text: string): ReactNode[] {
  const normalised = text.replace(/\n{3,}/g, '\n\n');
  const lines = normalised.split('\n');
  const nodes: ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];

    if (raw.trim() === '') {
      nodes.push(<div key={key++} className="h-2" />);
      continue;
    }

    // Bullet line
    if (/^-\s+/.test(raw)) {
      const content = raw.replace(/^-\s+/, '');
      nodes.push(
        <div key={key++} className="flex items-start gap-1.5 mt-0.5">
          <span className="mt-1 text-gray-500 flex-shrink-0">•</span>
          <span>{inlineBold(content)}</span>
        </div>
      );
      continue;
    }

    // Numbered line
    const numMatch = raw.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      nodes.push(
        <div key={key++} className="flex items-start gap-1.5 mt-0.5">
          <span className="text-gray-500 flex-shrink-0 font-medium">{numMatch[1]}.</span>
          <span>{inlineBold(numMatch[2])}</span>
        </div>
      );
      continue;
    }

    nodes.push(
      <p key={key++} className={i > 0 ? 'mt-1' : ''}>
        {inlineBold(raw)}
      </p>
    );
  }

  return nodes;
}

function inlineBold(text: string): ReactNode[] {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, j) =>
    j % 2 === 1 ? <strong key={j}>{part}</strong> : part
  );
}
