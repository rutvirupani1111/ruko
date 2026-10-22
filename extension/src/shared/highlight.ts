import type { Signal } from '@ruko/engine';

export interface Segment {
  text: string;
  /** Id of the strongest warning signal covering this text, if any. */
  signalId?: string;
}

/** Finds where a span really is: trusts the indices when they match, else searches nearby. */
function locate(text: string, span: { start: number; end: number; text: string }): [number, number] | null {
  if (span.start >= 0 && span.end <= text.length && span.end > span.start && text.slice(span.start, span.end) === span.text) {
    return [span.start, span.end];
  }
  if (!span.text) return null;
  const lower = text.toLowerCase();
  const needle = span.text.toLowerCase();
  const from = Math.max(0, span.start - 40);
  let index = lower.indexOf(needle, from);
  if (index === -1) index = lower.indexOf(needle);
  return index === -1 ? null : [index, index + span.text.length];
}

/**
 * Splits `text` into plain and highlighted segments for the warning signals' spans.
 * Overlaps resolve to the heavier signal. Reassuring (negative) signals never highlight.
 */
export function buildSegments(text: string, signals: Signal[]): Segment[] {
  if (!text) return [];
  const owner: Array<number | undefined> = new Array(text.length);
  const ordered = signals
    .map((signal, index) => ({ signal, index }))
    .filter(({ signal }) => signal.weight > 0 && signal.spans?.length)
    .sort((a, b) => a.signal.weight - b.signal.weight);
  for (const { signal, index } of ordered) {
    for (const span of signal.spans) {
      const range = locate(text, span);
      if (!range) continue;
      for (let i = range[0]; i < range[1]; i++) owner[i] = index;
    }
  }
  const segments: Segment[] = [];
  let start = 0;
  for (let i = 1; i <= text.length; i++) {
    if (i === text.length || owner[i] !== owner[start]) {
      const id = owner[start];
      segments.push({ text: text.slice(start, i), signalId: id === undefined ? undefined : signals[id]?.id });
      start = i;
    }
  }
  return segments;
}
