import type { Severity, Signal } from '@ruko/engine';
import { useMemo } from 'react';
import { buildSegments } from '../../shared/highlight';

/**
 * The signature interaction: red-flag phrases in the user's own text get a
 * highlighter-pen sweep, each one a button linked to the explanation of its signal.
 */
export function HighlightedText({
  text,
  signals,
  severity,
  activeId,
  onSelect,
}: {
  text: string;
  signals: Signal[];
  severity: Severity;
  activeId?: string | null;
  onSelect: (signalId: string) => void;
}) {
  const segments = useMemo(() => buildSegments(text, signals), [text, signals]);
  const titles = useMemo(() => new Map(signals.map((s) => [s.id, s.title])), [signals]);
  let marks = 0;
  return (
    <p className="whitespace-pre-wrap break-words text-[15px] leading-7" data-testid="highlighted-text">
      {segments.map((segment, i) => {
        if (!segment.signalId) return <span key={i}>{segment.text}</span>;
        const id = segment.signalId;
        const delay = Math.min(marks++, 8) * 70;
        return (
          <mark
            key={i}
            className="rk-mark"
            data-severity={severity}
            data-signal={id}
            role="button"
            tabIndex={0}
            title={titles.get(id)}
            aria-pressed={activeId === id}
            aria-controls={`signal-${id}`}
            style={{ ['--rk-delay' as string]: `${delay}ms` }}
            onClick={() => onSelect(id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(id);
              }
            }}
          >
            {segment.text}
          </mark>
        );
      })}
    </p>
  );
}
