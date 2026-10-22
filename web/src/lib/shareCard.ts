import type { Severity } from '@ruko/engine';
import { SHIELD_PATH } from '@/components/brand/Mark';

/**
 * Draws shareable PNG cards (the "Share this warning" image and the simulator
 * result card) on a canvas, entirely on the device. The card never includes
 * the user's own message, only the verdict.
 */

export interface CardSpec {
  kind: 'warning' | 'result';
  eyebrow: string;
  title: string;
  /** 0..100, drawn as the semicircle meter. */
  score?: number;
  severity?: Severity;
  severityLabel?: string;
  /** Big number for result cards, e.g. "6/7". */
  bigStat?: string;
  bigStatLabel?: string;
  bullets: string[];
  bulletsTitle?: string;
  tagline: string;
  footer: string;
  hindi: boolean;
}

const W = 1080;
const H = 1350;
const INK = '#0B1020';
const PAPER = '#FBF8F2';
const SAFFRON = '#FF7A1A';
const SEVERITY_COLOR: Record<Severity, string> = {
  safe: '#10B981',
  low: '#6366F1',
  medium: '#F59E0B',
  high: '#E11D48',
  critical: '#BE123C',
};

const DISPLAY = '"Bricolage Grotesque Variable", Mukta, system-ui, sans-serif';
const BODY = '"Inter Variable", Mukta, system-ui, sans-serif';

async function ensureFonts(hindi: boolean) {
  if (!('fonts' in document)) return;
  const loads = [
    document.fonts.load(`800 64px ${DISPLAY}`, 'Ruko'),
    document.fonts.load(`500 36px ${BODY}`, 'Ruko'),
  ];
  if (hindi) {
    loads.push(document.fonts.load('800 64px Mukta', 'रुको'), document.fonts.load('400 36px Mukta', 'रुको'), document.fonts.load('600 36px Mukta', 'रुको'));
  }
  await Promise.race([Promise.allSettled(loads), new Promise((r) => setTimeout(r, 1500))]);
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines) {
    const used = lines.join(' ').length;
    if (used < text.trim().length) {
      let last = lines[maxLines - 1]!;
      while (last.length > 1 && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
      lines[maxLines - 1] = `${last.trimEnd()}…`;
    }
  }
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawMark(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 64, size / 64);
  ctx.fillStyle = SAFFRON;
  ctx.fill(new Path2D(SHIELD_PATH));
  ctx.fillStyle = INK;
  roundRect(ctx, 22.5, 21, 7, 23, 3.5);
  ctx.fill();
  roundRect(ctx, 34.5, 21, 7, 23, 3.5);
  ctx.fill();
  ctx.restore();
}

function drawMeter(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, score: number, color: string) {
  const grad = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
  grad.addColorStop(0, '#10B981');
  grad.addColorStop(0.42, '#F59E0B');
  grad.addColorStop(0.72, '#E11D48');
  grad.addColorStop(1, '#9F1239');
  ctx.lineCap = 'round';
  ctx.lineWidth = 34;
  ctx.strokeStyle = 'rgba(251,248,242,0.12)';
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, 2 * Math.PI);
  ctx.stroke();
  const pct = Math.max(0, Math.min(100, score)) / 100;
  if (pct > 0) {
    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, Math.PI + Math.PI * pct);
    ctx.stroke();
  }
  const a = Math.PI + Math.PI * pct;
  ctx.fillStyle = INK;
  ctx.strokeStyle = color;
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

export async function renderCard(spec: CardSpec): Promise<Blob> {
  await ensureFonts(spec.hindi);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available');

  const accent = spec.severity ? SEVERITY_COLOR[spec.severity] : SAFFRON;

  // Background: ink with a soft glow in the severity colour.
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W * 0.85, 120, 40, W * 0.85, 120, 760);
  glow.addColorStop(0, `${accent}66`);
  glow.addColorStop(1, `${accent}00`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Brand row.
  drawMark(ctx, 72, 64, 92);
  ctx.fillStyle = PAPER;
  ctx.font = `800 60px ${DISPLAY}`;
  ctx.textBaseline = 'middle';
  ctx.fillText('Ruko', 182, 112);
  ctx.font = `600 30px ${BODY}`;
  ctx.fillStyle = 'rgba(251,248,242,0.7)';
  ctx.textAlign = 'right';
  ctx.fillText(spec.eyebrow, W - 72, 112);
  ctx.textAlign = 'left';

  let y = 230;
  if (spec.kind === 'warning' && typeof spec.score === 'number') {
    drawMeter(ctx, W / 2, 470, 210, spec.score, accent);
    ctx.fillStyle = PAPER;
    ctx.textAlign = 'center';
    ctx.font = `800 132px ${DISPLAY}`;
    ctx.fillText(String(Math.round(spec.score)), W / 2, 420);
    ctx.font = `600 30px ${BODY}`;
    ctx.fillStyle = 'rgba(251,248,242,0.7)';
    ctx.fillText('/ 100', W / 2, 500);
    ctx.textAlign = 'left';
    y = 560;
  } else if (spec.bigStat) {
    ctx.fillStyle = PAPER;
    ctx.textAlign = 'center';
    ctx.font = `800 220px ${DISPLAY}`;
    ctx.fillText(spec.bigStat, W / 2, 420);
    if (spec.bigStatLabel) {
      ctx.font = `600 36px ${BODY}`;
      ctx.fillStyle = 'rgba(251,248,242,0.75)';
      ctx.fillText(spec.bigStatLabel, W / 2, 545);
    }
    ctx.textAlign = 'left';
    y = 600;
  }

  // Severity pill.
  if (spec.severityLabel) {
    ctx.font = `700 34px ${BODY}`;
    const label = spec.severityLabel.toUpperCase();
    const w = ctx.measureText(label).width + 64;
    ctx.fillStyle = accent;
    roundRect(ctx, 72, y, w, 64, 32);
    ctx.fill();
    ctx.fillStyle = spec.severity === 'medium' || spec.severity === 'safe' ? INK : '#FFFFFF';
    ctx.fillText(label, 104, y + 33);
    y += 100;
  }

  // Headline.
  ctx.fillStyle = PAPER;
  ctx.font = `800 ${spec.hindi ? 62 : 68}px ${DISPLAY}`;
  const titleLines = wrap(ctx, spec.title, W - 144, 3);
  const titleLead = spec.hindi ? 92 : 78;
  titleLines.forEach((line, i) => ctx.fillText(line, 72, y + 34 + i * titleLead));
  y += titleLines.length * titleLead + 36;

  // Bullets.
  if (spec.bullets.length) {
    if (spec.bulletsTitle) {
      ctx.font = `700 30px ${BODY}`;
      ctx.fillStyle = accent === SEVERITY_COLOR.low ? '#AAB6FF' : accent;
      ctx.fillText(spec.bulletsTitle.toUpperCase(), 72, y + 10);
      y += 56;
    }
    ctx.font = `500 ${spec.hindi ? 36 : 38}px ${BODY}`;
    for (const bullet of spec.bullets.slice(0, 3)) {
      const lines = wrap(ctx, bullet, W - 144 - 48, 2);
      if (y + lines.length * 52 > H - 240) break;
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(84, y + 2, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(251,248,242,0.92)';
      lines.forEach((line, i) => ctx.fillText(line, 120, y + 2 + i * (spec.hindi ? 56 : 50)));
      y += lines.length * (spec.hindi ? 56 : 50) + 26;
    }
  }

  // Footer band.
  ctx.fillStyle = SAFFRON;
  ctx.fillRect(0, H - 190, W, 190);
  ctx.fillStyle = INK;
  ctx.font = `800 52px ${DISPLAY}`;
  ctx.fillText(spec.tagline, 72, H - 122);
  ctx.font = `600 32px ${BODY}`;
  ctx.fillText(spec.footer, 72, H - 58);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not create image'))), 'image/png');
  });
}

export type ShareOutcome = 'shared' | 'downloaded' | 'cancelled';

/** Share an image with the Web Share API, or save it when sharing files is not supported. */
export async function shareImage(blob: Blob, filename: string, text: string, title: string): Promise<ShareOutcome> {
  const file = new File([blob], filename, { type: 'image/png' });
  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], text, title });
      return 'shared';
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return 'cancelled';
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return 'downloaded';
}
