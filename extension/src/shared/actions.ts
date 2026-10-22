import type { Advice, Locale, Severity } from '@ruko/engine';
import { LINKS } from '../config';

export interface Action {
  label: string;
  href: string;
}

/** Only phone numbers and https links ever become buttons. */
const SAFE_HREF = /^(tel:\+?[\d-]+|https:\/\/[^\s"'<>]+)$/i;

const STANDARD_LABELS: Record<Locale, { call: string; report: string; chakshu: string }> = {
  en: { call: 'Call 1930', report: 'Report at cybercrime.gov.in', chakshu: 'Report on Chakshu' },
  hi: { call: '1930 पर कॉल करें', report: 'cybercrime.gov.in पर शिकायत करें', chakshu: 'चक्षु पर रिपोर्ट करें' },
};

export function standardActions(locale: Locale): Action[] {
  const labels = STANDARD_LABELS[locale];
  return [
    { label: labels.call, href: LINKS.helpline },
    { label: labels.report, href: LINKS.cybercrime },
    { label: labels.chakshu, href: LINKS.chakshu },
  ];
}

/**
 * Action buttons for a verdict: the engine's own advice actions, plus (when money may be
 * at risk, high and critical) the three emergency actions from the spec: Call 1930, report
 * at cybercrime.gov.in, report on Chakshu. Deduplicated; 1930 always comes first.
 */
export function verdictActions(advice: Advice[], severity: Severity, locale: Locale): Action[] {
  const out: Action[] = [];
  const seen = new Set<string>();
  const push = (action: Action | undefined) => {
    if (!action || !SAFE_HREF.test(action.href.trim())) return;
    const key = action.href.trim().replace(/\/+$/, '').toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ label: action.label, href: action.href.trim() });
  };
  for (const item of advice) push(item.action);
  if (severity === 'high' || severity === 'critical') for (const action of standardActions(locale)) push(action);
  return out.sort((a, b) => Number(b.href.startsWith('tel:1930')) - Number(a.href.startsWith('tel:1930')));
}
