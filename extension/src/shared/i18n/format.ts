import type { Locale } from '@ruko/engine';

export type Params = Record<string, string | number>;

/** Replaces {name} placeholders. Unknown placeholders are left visible so tests catch them. */
export function format(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match,
  );
}

/** Formats a number the way people in India read it (lakh/crore grouping). */
export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'hi' ? 'hi-IN' : 'en-IN').format(value);
}

export function formatRupees(value: number, locale: Locale): string {
  return `₹${new Intl.NumberFormat(locale === 'hi' ? 'hi-IN' : 'en-IN', { maximumFractionDigits: 2 }).format(value)}`;
}

/** Short relative time, e.g. "5 min ago" / "5 मिनट पहले". */
export function timeAgo(timestamp: number, locale: Locale, now = Date.now()): string {
  const seconds = Math.round((timestamp - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale === 'hi' ? 'hi-IN' : 'en-IN', { numeric: 'auto', style: 'short' });
  const abs = Math.abs(seconds);
  if (abs < 60) return rtf.format(seconds, 'second');
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(seconds / 3600), 'hour');
  if (abs < 86400 * 30) return rtf.format(Math.round(seconds / 86400), 'day');
  return new Date(timestamp).toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
