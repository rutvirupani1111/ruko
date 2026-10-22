import { useId } from 'react';
import { BARS, BARS_SMALL, MARK_COLORS, MARK_VIEWBOX, SHIELD_PATH, type MarkTone } from '../../shared/mark';

/** The Ruko pause-shield mark. Decorative unless a title is given. */
export function Mark({ size = 32, tone = 'brand', title, className }: { size?: number; tone?: MarkTone; title?: string; className?: string }) {
  const id = `rk-mark-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const colors = MARK_COLORS[tone];
  const bars = size <= 24 ? BARS_SMALL : BARS;
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      width={size}
      height={size}
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={colors.shieldFrom} />
          <stop offset="1" stopColor={colors.shieldTo} />
        </linearGradient>
      </defs>
      <path d={SHIELD_PATH} fill={`url(#${id})`} stroke={colors.ring} strokeWidth={1.5} />
      {bars.map((bar, i) => (
        <rect key={i} x={bar.x} y={bar.y} width={bar.width} height={bar.height} rx={bar.rx} fill={colors.bars} />
      ))}
    </svg>
  );
}

/** Mark + wordmark used in page headers. */
export function Wordmark({ size = 28, subtitle }: { size?: number; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Mark size={size} />
      <div className="leading-tight">
        <div className="rk-display text-[17px] font-extrabold tracking-tight">
          Ruko <span className="text-[var(--muted)] font-semibold">Shield</span>
        </div>
        {subtitle ? <div className="text-xs text-[var(--muted)]">{subtitle}</div> : null}
      </div>
    </div>
  );
}
