import { useId } from 'react';

/** The Ruko mark: a rounded shield holding two "pause" bars. Pause equals Ruko. */
export const SHIELD_PATH =
  'M32 4.5c-7 4.1-14.8 6.4-22.9 6.9A2.6 2.6 0 0 0 6.7 14v15.9c0 15.4 10.1 27.7 24.6 32a2.4 2.4 0 0 0 1.4 0c14.5-4.3 24.6-16.6 24.6-32V14a2.6 2.6 0 0 0-2.4-2.6C46.8 10.9 39 8.6 32 4.5Z';

interface MarkProps {
  size?: number;
  className?: string;
  /** Visible name for screen readers; omit when the mark sits next to the word "Ruko". */
  title?: string;
  /** Animate the pause bars once on mount. */
  animate?: boolean;
  tone?: 'saffron' | 'ink' | 'paper';
}

export function Mark({ size = 32, className, title, animate = false, tone = 'saffron' }: MarkProps) {
  const id = useId();
  const shield = tone === 'saffron' ? '#FF7A1A' : tone === 'ink' ? '#0B1020' : '#FBF8F2';
  const bars = tone === 'saffron' ? '#0B1020' : tone === 'ink' ? '#FF7A1A' : '#0B1020';
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-labelledby={title ? `${id}-t` : undefined}
      focusable="false"
    >
      {title ? <title id={`${id}-t`}>{title}</title> : null}
      <path d={SHIELD_PATH} fill={shield} />
      <g fill={bars}>
        <rect x="22.5" y="21" width="7" height="23" rx="3.5" className={animate ? 'mark-bar mark-bar-1' : undefined} />
        <rect x="34.5" y="21" width="7" height="23" rx="3.5" className={animate ? 'mark-bar mark-bar-2' : undefined} />
      </g>
    </svg>
  );
}
