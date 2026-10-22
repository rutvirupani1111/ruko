import { useEffect, useId, useRef, useState } from 'react';
import { prefersReducedMotion } from '../theme';

/** Animates a number from its previous value to `target` within `duration` ms. */
export function useCountUp(target: number, duration = 300): number {
  const [value, setValue] = useState(prefersReducedMotion() ? target : 0);
  const from = useRef(value);
  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target);
      from.current = target;
      return;
    }
    const start = performance.now();
    const initial = from.current;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      const next = Math.round(initial + (target - initial) * eased);
      setValue(next);
      from.current = next;
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}

/**
 * Semicircle risk meter: gradient track safe -> caution -> danger, an arc for the
 * score and the number counting up. Purely visual; the label carries the meaning.
 */
export function RiskMeter({ score, label, size = 132 }: { score: number; label: string; size?: number }) {
  const target = Math.max(0, Math.min(100, Math.round(score)));
  const value = useCountUp(target);
  const gradient = `rk-meter-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const r = 52;
  const d = `M ${60 - r} 60 A ${r} ${r} 0 0 1 ${60 + r} 60`;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size * 0.62 }} role="img" aria-label={label}>
      <svg viewBox="0 0 120 68" width={size} height={size * 0.62} aria-hidden="true">
        <defs>
          <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#10B981" />
            <stop offset="0.5" stopColor="#F59E0B" />
            <stop offset="1" stopColor="#E11D48" />
          </linearGradient>
        </defs>
        <path d={d} fill="none" stroke="var(--border)" strokeWidth={11} strokeLinecap="round" />
        <path
          d={d}
          fill="none"
          stroke={`url(#${gradient})`}
          strokeWidth={11}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${value} 100`}
          opacity={value > 0 ? 1 : 0}
        />
      </svg>
      <div
        className="rk-display absolute inset-x-0 bottom-0 text-center font-extrabold leading-none tabular-nums"
        style={{ fontSize: size * 0.27 }}
        aria-hidden="true"
      >
        {value}
      </div>
    </div>
  );
}
