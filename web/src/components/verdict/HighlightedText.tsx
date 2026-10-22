import { useMemo, type CSSProperties, type MouseEvent } from 'react';
import type { Signal } from '@ruko/engine';
import { cn } from '@/lib/cn';
import { segmentText, type MarkSpan, type MarkTone } from '@/lib/highlight';

export function toneForWeight(weight: number): MarkTone {
  if (weight < 0) return 'safe';
  if (weight >= 45) return 'danger';
  if (weight >= 20) return 'caution';
  return 'brand';
}

export function signalAnchor(prefix: string, index: number) {
  return `${prefix}-sig-${index}`;
}

/** Move focus to a signal's explanation and bring it into view. */
export function jumpTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  el.focus({ preventScroll: true });
  el.classList.remove('flash');
  // Restart the flash animation.
  void el.offsetWidth;
  el.classList.add('flash');
}

interface HighlightedTextProps {
  text: string;
  signals: Signal[];
  idPrefix: string;
  className?: string;
}

/**
 * The user's own text with every red-flag phrase swept by a highlighter pen.
 * Each mark links to the explanation of its signal.
 */
export function HighlightedText({ text, signals, idPrefix, className }: HighlightedTextProps) {
  const segments = useMemo(() => {
    const spans: MarkSpan[] = [];
    signals.forEach((signal, index) => {
      for (const span of signal.spans) {
        spans.push({
          start: span.start,
          end: span.end,
          text: span.text,
          ref: signalAnchor(idPrefix, index),
          tone: toneForWeight(signal.weight),
          priority: signal.weight > 0 ? 1000 + signal.weight : -signal.weight,
          order: index,
        });
      }
    });
    return segmentText(text, spans);
  }, [text, signals, idPrefix]);

  const onMarkClick = (event: MouseEvent<HTMLAnchorElement>, ref: string) => {
    event.preventDefault();
    jumpTo(ref);
  };

  return (
    <p className={cn('whitespace-pre-wrap break-words [overflow-wrap:anywhere]', className)} data-testid="highlighted-text">
      {segments.map((segment) => {
        const mark = segment.marks[0];
        if (!mark) return <span key={`t${segment.start}`}>{segment.text}</span>;
        return (
          <a
            key={`m${mark.ref}:${segment.start}:${segment.end}`}
            href={`#${mark.ref}`}
            onClick={(e) => onMarkClick(e, mark.ref)}
            className={cn('hl', `hl-${mark.tone}`)}
            style={{ '--i': mark.order } as CSSProperties}
            aria-describedby={`${mark.ref}-title`}
            data-tone={mark.tone}
          >
            {segment.text}
          </a>
        );
      })}
    </p>
  );
}
