import type { Severity } from '@ruko/engine';

/** Same thresholds as the engine's severityFor(), usable before the engine chunk loads. */
export function severityOf(score: number): Severity {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 35) return 'medium';
  if (score >= 15) return 'low';
  return 'safe';
}

export const SEVERITY_ORDER: Severity[] = ['safe', 'low', 'medium', 'high', 'critical'];

export function atLeast(severity: Severity, min: Severity): boolean {
  return SEVERITY_ORDER.indexOf(severity) >= SEVERITY_ORDER.indexOf(min);
}

/** Tailwind classes per severity: chip background/text and accent color. */
export const severityTone: Record<Severity, { chip: string; text: string; ring: string; tint: string; hl: string }> = {
  safe: { chip: 'bg-safe-tint text-safe', text: 'text-safe', ring: 'ring-safe/30', tint: 'bg-safe-tint', hl: 'hl-safe' },
  low: { chip: 'bg-accent-tint text-accent', text: 'text-accent', ring: 'ring-accent/30', tint: 'bg-accent-tint', hl: 'hl-caution' },
  medium: { chip: 'bg-caution-tint text-caution', text: 'text-caution', ring: 'ring-caution/30', tint: 'bg-caution-tint', hl: 'hl-caution' },
  high: { chip: 'bg-danger-tint text-danger', text: 'text-danger', ring: 'ring-danger/30', tint: 'bg-danger-tint', hl: 'hl-danger' },
  critical: { chip: 'bg-critical-bg text-on-critical', text: 'text-critical', ring: 'ring-critical/40', tint: 'bg-critical-tint', hl: 'hl-danger' },
};
