/**
 * Split a text into plain and highlighted segments from (possibly overlapping)
 * evidence spans, so red-flag phrases can be marked in the user's own words.
 */

export type MarkTone = 'danger' | 'caution' | 'safe' | 'brand';

export interface MarkSpan {
  start: number;
  end: number;
  /** Anchor id of the explanation this phrase links to. */
  ref: string;
  tone: MarkTone;
  /** Higher wins when spans overlap (e.g. the signal weight). */
  priority: number;
  /** Order of the signal, used to stagger the highlighter animation. */
  order: number;
  /** Optional original text of the span, used to recover from shifted offsets. */
  text?: string;
}

export interface Segment {
  text: string;
  start: number;
  end: number;
  /** Covering spans, strongest first. Empty for plain text. */
  marks: MarkSpan[];
}

const isHigh = (code: number) => code >= 0xd800 && code <= 0xdbff;
const isLow = (code: number) => code >= 0xdc00 && code <= 0xdfff;

/** Move an index off the middle of a surrogate pair. */
function safeIndex(text: string, index: number, direction: -1 | 1): number {
  if (index > 0 && index < text.length && isLow(text.charCodeAt(index)) && isHigh(text.charCodeAt(index - 1))) {
    return index + (direction === 1 ? 1 : -1);
  }
  return index;
}

/** Validate a span against the text; if its offsets drifted, find its text instead. */
export function resolveSpan(text: string, span: MarkSpan): MarkSpan | null {
  let { start, end } = span;
  const valid = Number.isFinite(start) && Number.isFinite(end) && start >= 0 && end <= text.length && end > start;
  if (valid && (!span.text || text.slice(start, end) === span.text)) {
    return { ...span, start: safeIndex(text, start, -1), end: safeIndex(text, end, 1) };
  }
  if (span.text) {
    const found = text.indexOf(span.text);
    if (found >= 0) return { ...span, start: found, end: found + span.text.length };
    const lower = text.toLowerCase().indexOf(span.text.toLowerCase());
    if (lower >= 0) return { ...span, start: lower, end: lower + span.text.length };
  }
  if (!valid) return null;
  start = Math.max(0, Math.min(start, text.length));
  end = Math.max(start, Math.min(end, text.length));
  return end > start ? { ...span, start, end } : null;
}

export function segmentText(text: string, spans: MarkSpan[]): Segment[] {
  if (!text) return [];
  const usable = spans.map((s) => resolveSpan(text, s)).filter((s): s is MarkSpan => s !== null);
  if (usable.length === 0) return [{ text, start: 0, end: text.length, marks: [] }];

  const cuts = new Set<number>([0, text.length]);
  for (const s of usable) {
    cuts.add(s.start);
    cuts.add(s.end);
  }
  const points = [...cuts].sort((a, b) => a - b);

  const segments: Segment[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i]!;
    const end = points[i + 1]!;
    if (end <= start) continue;
    const marks = usable
      .filter((s) => s.start <= start && s.end >= end)
      .sort((a, b) => b.priority - a.priority || a.order - b.order);
    const prev = segments[segments.length - 1];
    if (prev && sameMarks(prev.marks, marks)) {
      prev.end = end;
      prev.text = text.slice(prev.start, end);
    } else {
      segments.push({ text: text.slice(start, end), start, end, marks });
    }
  }
  return segments;
}

function sameMarks(a: MarkSpan[], b: MarkSpan[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((m, i) => m.ref === b[i]!.ref && m.start === b[i]!.start && m.end === b[i]!.end);
}
