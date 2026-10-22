/**
 * The Ruko mark: a rounded shield holding two vertical "pause" bars (pause = ruko).
 * Single source of geometry for the in-page UI, the React pages and the generated
 * toolbar icons (scripts/gen-icons.mjs imports this file directly).
 */

export type MarkTone = 'brand' | 'danger' | 'ink' | 'paper';

export const MARK_VIEWBOX = '0 0 64 64';

/** Rounded shield: soft top corners, sides curving into a rounded point. */
export const SHIELD_PATH =
  'M14 6h36a8 8 0 0 1 8 8v15.5c0 15.2-10.4 26.4-24.3 31.2a5.4 5.4 0 0 1-3.4 0C16.4 55.9 6 44.7 6 29.5V14a8 8 0 0 1 8-8Z';

/** Bars for 32px and up. */
export const BARS = [
  { x: 21.5, y: 18, width: 7.5, height: 24, rx: 3.75 },
  { x: 35, y: 18, width: 7.5, height: 24, rx: 3.75 },
] as const;

/** Bolder bars so the mark stays readable at 16px. */
export const BARS_SMALL = [
  { x: 19, y: 16, width: 10, height: 27, rx: 4 },
  { x: 35, y: 16, width: 10, height: 27, rx: 4 },
] as const;

export const MARK_COLORS: Record<MarkTone, { shieldFrom: string; shieldTo: string; bars: string; ring: string }> = {
  brand: { shieldFrom: '#FF9445', shieldTo: '#FF6A00', bars: '#0B1020', ring: 'rgba(11,16,32,0.18)' },
  danger: { shieldFrom: '#F43F5E', shieldTo: '#BE123C', bars: '#FFFFFF', ring: 'rgba(255,255,255,0.25)' },
  ink: { shieldFrom: '#1B2238', shieldTo: '#0B1020', bars: '#FF7A1A', ring: 'rgba(255,255,255,0.12)' },
  paper: { shieldFrom: '#FFFFFF', shieldTo: '#FBF8F2', bars: '#0B1020', ring: 'rgba(11,16,32,0.12)' },
};

/** Static SVG markup for the mark. Contains no user data. */
export function markSvgString(options: { tone?: MarkTone; size?: number; small?: boolean; idSuffix?: string } = {}): string {
  const tone = options.tone ?? 'brand';
  const colors = MARK_COLORS[tone];
  const bars = options.small ? BARS_SMALL : BARS;
  const id = `rk-mark-grad-${tone}${options.idSuffix ?? ''}`;
  const size = options.size ?? 64;
  const rects = bars
    .map((b) => `<rect x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" rx="${b.rx}" fill="${colors.bars}"/>`)
    .join('');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK_VIEWBOX}" width="${size}" height="${size}" aria-hidden="true" focusable="false">` +
    `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="${colors.shieldFrom}"/><stop offset="1" stop-color="${colors.shieldTo}"/>` +
    `</linearGradient></defs>` +
    `<path d="${SHIELD_PATH}" fill="url(#${id})" stroke="${colors.ring}" stroke-width="1.5"/>` +
    rects +
    `</svg>`
  );
}
