import { analyzePhone, analyzeUpiId, analyzeUrl, detectInputKind, type IdentifierKind } from '@ruko/engine';
import { linkReportable, type Reportable } from '@/lib/community';

/** What the person says they are reporting. Links become a 'url' or 'domain' report. */
export type ReportTab = 'upi' | 'phone' | 'link';
export const REPORT_TABS: readonly ReportTab[] = ['upi', 'phone', 'link'];

export type Prepared =
  | {
      ok: true;
      kind: IdentifierKind;
      /** The value that gets hashed (the engine normalises it again). */
      value: string;
      /** What we show back: the exact thing that will be reported. */
      display: string;
      /** Extra context, e.g. the UPI app behind a handle. */
      app?: string;
      /** For links: whole website or one exact link. */
      scope?: 'site' | 'link';
    }
  | {
      ok: false;
      reason: 'empty' | 'invalid' | 'official';
      /** The input looks like another kind: offer to switch. */
      suggest?: ReportTab;
      host?: string;
    };

function suggestionFor(input: string, tab: ReportTab): ReportTab | undefined {
  const kind = detectInputKind(input);
  const asTab: ReportTab | undefined = kind === 'upi' ? 'upi' : kind === 'phone' ? 'phone' : kind === 'url' ? 'link' : undefined;
  return asTab && asTab !== tab ? asTab : undefined;
}

function formatPhone(e164: string): string {
  const m = /^\+?91(\d{5})(\d{5})$/.exec(e164);
  if (m) return `+91 ${m[1]} ${m[2]}`;
  return e164.startsWith('+') ? e164 : `+${e164}`;
}

/**
 * Validate and normalise what the person typed, the same way the checker
 * builds lookups (`reportablesFrom`), so a report matches later lookups.
 * Official websites are refused: reports must never flag the real bank.
 */
export function prepareReport(tab: ReportTab, raw: string): Prepared {
  const input = raw.trim();
  if (!input) return { ok: false, reason: 'empty' };

  if (tab === 'upi') {
    if (detectInputKind(input) !== 'upi') return { ok: false, reason: 'invalid', suggest: suggestionFor(input, tab) };
    const finding = analyzeUpiId(input);
    if (!finding.vpa.includes('@')) return { ok: false, reason: 'invalid' };
    return { ok: true, kind: 'upi', value: finding.vpa, display: finding.vpa, app: finding.app };
  }

  if (tab === 'phone') {
    const finding = analyzePhone(input);
    if (!finding.kind || finding.kind === 'unknown' || !finding.e164) {
      return { ok: false, reason: 'invalid', suggest: suggestionFor(input, tab) };
    }
    // Short codes (1930, 1098, 14416 ...) are helplines, not numbers a scammer owns.
    if (!finding.e164.startsWith('+') && finding.e164.replace(/\D/g, '').length <= 6) {
      return { ok: false, reason: 'official', host: finding.e164 };
    }
    return { ok: true, kind: 'phone', value: finding.e164, display: formatPhone(finding.e164) };
  }

  const kind = detectInputKind(input);
  if (kind === 'upi' || kind === 'phone' || kind === 'email') {
    return { ok: false, reason: 'invalid', suggest: suggestionFor(input, tab) };
  }
  const url = analyzeUrl(input);
  if (!url.host) return { ok: false, reason: 'invalid' };
  if (url.official) return { ok: false, reason: 'official', host: url.registrableDomain || url.host };
  const link = linkReportable(url);
  if (!link) return { ok: false, reason: 'invalid' };
  return { ok: true, kind: link.kind, value: link.value, display: link.display, scope: link.kind === 'domain' ? 'site' : 'link' };
}

/** Which tab an item handed over from the checker belongs to. Emails are not offered here. */
export function tabForKind(kind: IdentifierKind): ReportTab | null {
  if (kind === 'upi') return 'upi';
  if (kind === 'phone') return 'phone';
  if (kind === 'url' || kind === 'domain') return 'link';
  return null;
}

/** Router state from the checker's "Report this" button, validated (it can come from history). */
export function readHandoff(state: unknown): { items: Reportable[]; category: string | null } {
  const s = (state ?? {}) as { items?: unknown; category?: unknown };
  const items = Array.isArray(s.items)
    ? (s.items as Reportable[]).filter(
        (item) => item && typeof item.value === 'string' && typeof item.display === 'string' && tabForKind(item.kind) !== null,
      )
    : [];
  return { items: items.slice(0, 6), category: typeof s.category === 'string' ? s.category : null };
}
