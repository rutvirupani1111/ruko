import type { Severity } from '@ruko/engine';
import { severityFor } from '@ruko/engine';
import { SEVERITY_LABELS } from '../../shared/i18n/inpage';
import { useI18n } from '../i18n';

const STYLES: Record<Severity, string> = {
  safe: 'bg-safe/15 text-[var(--safe-text)]',
  low: 'bg-indigo/12 text-[var(--indigo-text)]',
  medium: 'bg-caution text-ink',
  high: 'bg-danger text-white',
  critical: 'bg-critical text-white',
};

export function SeverityChip({ severity, className = '' }: { severity: Severity; className?: string }) {
  const { locale } = useI18n();
  return (
    <span
      className={`rk-chip inline-flex items-center rounded-full px-2.5 py-0.5 whitespace-nowrap ${STYLES[severity]} ${className}`}
      data-severity={severity}
    >
      {SEVERITY_LABELS[locale][severity]}
    </span>
  );
}

/** Small risk pill for one link / UPI ID / number. */
export function RiskPill({ risk, official, label }: { risk: number; official?: boolean; label?: string }) {
  const severity: Severity = official ? 'safe' : severityFor(risk);
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${STYLES[severity]}`}>
      {label ?? risk}
    </span>
  );
}

export function severityTextClass(severity: Severity): string {
  switch (severity) {
    case 'safe':
      return 'text-[var(--safe-text)]';
    case 'low':
      return 'text-[var(--indigo-text)]';
    case 'medium':
      return 'text-[var(--caution-text)]';
    default:
      return 'text-[var(--danger-text)]';
  }
}
