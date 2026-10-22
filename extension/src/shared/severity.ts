import type { Severity } from '@ruko/engine';

/** Ascending order of risk. */
export const SEVERITY_ORDER: readonly Severity[] = ['safe', 'low', 'medium', 'high', 'critical'];

/** The lowest severity that produces a warning, chosen on the options page. */
export type WarnAt = 'low' | 'medium' | 'high';

export const WARN_AT_VALUES: readonly WarnAt[] = ['low', 'medium', 'high'];

export function severityRank(severity: Severity): number {
  const rank = SEVERITY_ORDER.indexOf(severity);
  return rank === -1 ? 0 : rank;
}

/** True when a verdict of `severity` should be shown to someone who asked to be warned at `warnAt`. */
export function shouldWarn(severity: Severity, warnAt: WarnAt): boolean {
  return severityRank(severity) >= severityRank(warnAt);
}

/** Minimum URL risk for the lookalike interstitial, by sensitivity. Never below "medium". */
export function interstitialMinRisk(warnAt: WarnAt): number {
  switch (warnAt) {
    case 'low':
      return 35;
    case 'medium':
      return 50;
    case 'high':
      return 70;
  }
}
