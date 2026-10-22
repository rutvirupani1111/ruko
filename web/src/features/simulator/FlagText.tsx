import { Fragment, type CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import type { Flag } from './scenarios';

export interface NumberedFlag {
  flag: Flag;
  /** 1-based number shown on the badge and in the explanation list. */
  n: number;
}

const URL_RE = /\b(?:https?:\/\/|www\.)[^\s]+|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:in|com|top|app|me|co|org|net)\/[^\s]*/gi;

interface Range {
  start: number;
  end: number;
}

/**
 * Message text inside a phone mock-up. Links look like links (they are not
 * clickable). After the answer, every flag phrase gets the highlighter sweep
 * and a numbered badge matching the explanation list.
 */
export function FlagText({
  text,
  flags,
  revealed,
  tone,
  linkClass = 'underline decoration-1 underline-offset-2 text-[var(--link)]',
}: {
  text: string;
  flags: NumberedFlag[];
  revealed: boolean;
  tone: 'danger' | 'safe';
  linkClass?: string;
}) {
  const links: Range[] = [];
  for (const m of text.matchAll(URL_RE)) {
    const raw = m[0];
    const trimmed = raw.replace(/[.,;:!?)]+$/, '');
    links.push({ start: m.index ?? 0, end: (m.index ?? 0) + trimmed.length });
  }

  const marks: Array<Range & { n: number }> = [];
  if (revealed) {
    for (const { flag, n } of flags) {
      if (!flag.phrase) continue;
      let from = 0;
      for (;;) {
        const i = text.indexOf(flag.phrase, from);
        if (i < 0) break;
        marks.push({ start: i, end: i + flag.phrase.length, n });
        from = i + flag.phrase.length;
      }
    }
  }

  if (!links.length && !marks.length) return <>{text}</>;

  const cuts = new Set<number>([0, text.length]);
  for (const r of [...links, ...marks]) {
    cuts.add(r.start);
    cuts.add(r.end);
  }
  const points = [...cuts].sort((a, b) => a - b);

  const parts = [];
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i]!;
    const end = points[i + 1]!;
    if (end <= start) continue;
    const slice = text.slice(start, end);
    const mark = marks.filter((m) => m.start <= start && m.end >= end).sort((a, b) => a.n - b.n)[0];
    const isLink = links.some((l) => l.start <= start && l.end >= end);
    const inner = isLink ? <span className={linkClass}>{slice}</span> : slice;
    if (!mark) {
      parts.push(<Fragment key={start}>{inner}</Fragment>);
      continue;
    }
    const last = mark.end === end;
    parts.push(
      <mark key={start} className={cn('hl', tone === 'safe' ? 'hl-safe' : 'hl-danger')} style={{ '--i': mark.n - 1 } as CSSProperties}>
        {inner}
        {last ? (
          <span aria-hidden="true" className={cn('flag-n', tone === 'safe' && 'flag-n-safe')}>
            {mark.n}
          </span>
        ) : null}
      </mark>,
    );
  }
  return <>{parts}</>;
}
