import type { Severity, UrlFinding } from '@ruko/engine';
import type { LinkVerdict, PageCheck } from './messages';
import { interstitialMinRisk, type WarnAt } from './severity';

/** A bare hostname we are willing to link to ("onlinesbi.sbi"), nothing else. */
const DOMAIN = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

export function safeOfficialDomain(value: string | undefined): string | undefined {
  const domain = value?.trim().toLowerCase();
  return domain && DOMAIN.test(domain) ? domain : undefined;
}

/**
 * Decides whether a page address deserves the full-page lookalike warning.
 *
 * SPEC: "when the domain impersonates a brand (lookalike, brand on free hosting,
 * punycode)". Being merely unknown or risky is not enough to block a page: the
 * engine must name the brand being imitated, the imitation must be in the domain
 * itself (engine `impersonationKind` other than 'path'; a brand word in the path of
 * an ordinary site is not a fake site), the host must not be official, and the risk
 * must clear the sensitivity-dependent bar (never below "medium").
 */
export function decidePage(finding: UrlFinding, severity: Severity, warnAt: WarnAt): PageCheck {
  const host = finding.host || '';
  const brand = finding.impersonates?.trim() || undefined;
  const domainLevel = finding.impersonationKind !== 'path';
  const warn = !finding.official && !!brand && domainLevel && finding.risk >= interstitialMinRisk(warnAt);
  return {
    warn,
    host,
    brand,
    officialDomain: warn ? safeOfficialDomain(finding.officialDomain) : undefined,
    risk: finding.risk,
    severity,
    reasons: finding.reasons.slice(0, 5),
  };
}

export type TooltipTone = 'official' | 'safe' | 'caution' | 'danger' | 'upi';

/** Maps a link verdict to the tooltip's visual tone. */
export function tooltipTone(link: LinkVerdict): TooltipTone {
  if (link.kind === 'upi') return 'upi';
  if (link.official && !link.download) return 'official';
  if (link.download || link.severity === 'high' || link.severity === 'critical' || (link.brand && link.risk >= 35)) return 'danger';
  if (link.knownGood && !link.shortener) return 'safe';
  if (link.shortener || link.severity === 'medium' || link.severity === 'low') return 'caution';
  return 'safe';
}
