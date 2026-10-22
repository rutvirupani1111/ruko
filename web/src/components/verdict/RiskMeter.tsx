import { useId } from 'react';
import type { Severity } from '@ruko/engine';
import { cn } from '@/lib/cn';
import { useCountUp } from '@/lib/useCountUp';

const R = 80;
const CX = 100;
const CY = 100;
const ARC_LENGTH = Math.PI * R;
const ARC = `M${CX - R} ${CY} A${R} ${R} 0 0 1 ${CX + R} ${CY}`;
/** Severity band edges, drawn as small notches outside the arc. */
const THRESHOLDS = [15, 35, 60, 80];

const needleStroke: Record<Severity, string> = {
  safe: '#10B981',
  low: '#4F46E5',
  medium: '#F59E0B',
  high: '#E11D48',
  critical: '#9F1239',
};

function pointAt(value: number, radius: number) {
  const a = Math.PI * (1 - value / 100);
  return { x: CX + radius * Math.cos(a), y: CY - radius * Math.sin(a) };
}

interface RiskMeterProps {
  score: number;
  severity: Severity;
  /** Accessible name, e.g. "Risk score". */
  label: string;
  /** Accessible value, e.g. "82 out of 100, high risk". */
  valueText: string;
  /** Text under the number, e.g. "out of 100". */
  caption?: string;
  className?: string;
  compact?: boolean;
}

/** Animated semicircle meter: safe (green) through caution (amber) to danger (red). */
export function RiskMeter({ score, severity, label, valueText, caption, className, compact = false }: RiskMeterProps) {
  const id = useId().replace(/:/g, '');
  const target = Math.max(0, Math.min(100, Math.round(score)));
  const shown = useCountUp(target, 300);
  const tip = pointAt(shown, R);

  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={target}
      aria-valuetext={valueText}
      className={cn('relative mx-auto w-full', compact ? 'max-w-[8.5rem]' : 'max-w-[15.5rem]', className)}
      data-testid="risk-meter"
    >
      <svg viewBox="0 0 200 118" className="block w-full overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id={`g${id}`} x1={CX - R} y1="0" x2={CX + R} y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#10B981" />
            <stop offset="0.42" stopColor="#F59E0B" />
            <stop offset="0.72" stopColor="#E11D48" />
            <stop offset="1" stopColor="#9F1239" />
          </linearGradient>
        </defs>
        <path d={ARC} fill="none" stroke="var(--line)" strokeWidth="15" strokeLinecap="round" />
        <path d={ARC} fill="none" stroke={`url(#g${id})`} strokeOpacity="0.18" strokeWidth="15" strokeLinecap="round" />
        {THRESHOLDS.map((v) => {
          const a = pointAt(v, R + 11);
          const b = pointAt(v, R + 16);
          return <line key={v} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--line-strong)" strokeWidth="2" strokeLinecap="round" />;
        })}
        {shown > 0 ? (
          <path
            d={ARC}
            fill="none"
            stroke={`url(#g${id})`}
            strokeWidth="15"
            strokeLinecap="round"
            strokeDasharray={ARC_LENGTH}
            strokeDashoffset={ARC_LENGTH * (1 - shown / 100)}
          />
        ) : null}
        <circle cx={tip.x} cy={tip.y} r="10" fill="var(--surface)" stroke={needleStroke[severity]} strokeWidth="5" />
      </svg>
      <div className={cn('pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center', compact ? 'pb-0' : 'pb-0.5')}>
        <span className={cn('display num tabular-nums text-fg', compact ? 'text-3xl' : 'text-[3.4rem] leading-none')}>{shown}</span>
        {caption && !compact ? <span className="mt-1 text-xs font-medium tracking-wide text-subtle uppercase">{caption}</span> : null}
      </div>
    </div>
  );
}
