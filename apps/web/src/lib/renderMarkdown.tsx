import type { ReactNode } from 'react';

/**
 * Shared markdown-lite renderer used by both the chat widget and AI journey.
 * Supports: **bold**, - bullets, 1. numbered lists, ₹ currency highlights, plan name chips.
 */

const PLAN_NAMES = ['Premier', 'Signature', 'Global'];
const CURRENCY_RE = /₹[\d,]+(\.\d+)?(\s*(L|Lakh|lakhs?|Cr|crore|\/yr|\/year|p\.a\.))?/gi;

/** Wrap ₹ amounts in a highlight span */
function highlightCurrency(text: string): ReactNode[] {
  const parts = text.split(CURRENCY_RE);
  if (parts.length === 1) return [text];

  const matches = text.match(CURRENCY_RE) ?? [];
  const result: ReactNode[] = [];
  let matchIdx = 0;

  // Re-split preserving matches
  const segments = text.split(/(₹[\d,]+(?:\.\d+)?(?:\s*(?:L|Lakh|lakhs?|Cr|crore|\/yr|\/year|p\.a\.))?)/gi);
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (!seg) continue;
    if (seg.match(/^₹/i)) {
      result.push(
        <span key={`amt-${matchIdx++}`} className="inline-flex items-center font-semibold text-[#ED1B2D] bg-red-50 rounded px-1 py-0.5 text-[0.8em] mx-0.5">
          {seg}
        </span>
      );
    } else {
      // Check for plan name chips within non-currency text
      result.push(...highlightPlanNames(seg, `seg-${i}`));
    }
  }
  return result;
}

/** Wrap plan names in subtle chips */
function highlightPlanNames(text: string, keyPrefix: string): ReactNode[] {
  const planRe = new RegExp(`\\b(${PLAN_NAMES.join('|')})\\b`, 'g');
  const segments = text.split(planRe);
  return segments.map((seg, i) =>
    PLAN_NAMES.includes(seg) ? (
      <span key={`${keyPrefix}-p${i}`} className="inline-flex items-center font-medium text-gray-700 bg-gray-100 rounded px-1.5 py-0.5 text-[0.82em] mx-0.5 border border-gray-200">
        {seg}
      </span>
    ) : (
      seg
    )
  );
}

/** Process inline bold + currency + plan names */
function renderInline(text: string): ReactNode[] {
  const boldParts = text.split(/\*\*(.*?)\*\*/g);
  const result: ReactNode[] = [];
  boldParts.forEach((part, i) => {
    if (i % 2 === 1) {
      result.push(<strong key={i}>{part}</strong>);
    } else {
      // Collapse " ." / " ," / " !" / " ?" patterns that arise when bold text
      // ends immediately before punctuation (the flex gap makes the space visible).
      const normalized = part.replace(/\s+([.,!?;:])/g, '$1');
      result.push(...highlightCurrency(normalized));
    }
  });
  return result;
}

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

    if (/^-\s+/.test(raw)) {
      const content = raw.replace(/^-\s+/, '');
      nodes.push(
        <div key={key++} className="flex items-start gap-1.5 mt-1">
          <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-[#ED1B2D]/60 flex-shrink-0" />
          <span className="flex-1 flex flex-wrap items-baseline gap-0.5">{renderInline(content)}</span>
        </div>
      );
      continue;
    }

    const numMatch = raw.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      nodes.push(
        <div key={key++} className="flex items-start gap-2 mt-1">
          <span className="text-[#ED1B2D] font-bold text-xs flex-shrink-0 mt-0.5">{numMatch[1]}.</span>
          <span className="flex-1 flex flex-wrap items-baseline gap-0.5">{renderInline(numMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Heading: line starts with ###/##/#
    const headMatch = raw.match(/^(#{1,3})\s+(.*)/);
    if (headMatch) {
      nodes.push(
        <p key={key++} className="font-semibold text-gray-800 mt-1.5 mb-0.5">
          {renderInline(headMatch[2])}
        </p>
      );
      continue;
    }

    nodes.push(
      <p key={key++} className={i > 0 ? 'mt-1 flex flex-wrap items-baseline gap-0.5' : 'flex flex-wrap items-baseline gap-0.5'}>
        {renderInline(raw)}
      </p>
    );
  }

  return nodes;
}

/** Extract [ACTIONS:label1|val1, label2|val2] from text, return cleaned text + actions */
export function extractActions(text: string): {
  cleanText: string;
  actions: { label: string; value: string }[];
} {
  const actions: { label: string; value: string }[] = [];
  const cleanText = text.replace(/\[ACTIONS:([\s\S]*?)\]/g, (_, inner: string) => {
    inner.split(',').forEach((pair) => {
      const [label, value] = pair.trim().split('|');
      if (label && value) actions.push({ label: label.trim(), value: value.trim() });
    });
    return '';
  }).trim();
  return { cleanText, actions };
}
