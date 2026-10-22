/**
 * Entity extraction: links, UPI IDs and payment links, phone numbers, emails
 * and amounts, each with its own mini-verdict and a span in the original text.
 */
import type { AmountFinding, Entities, Locale, PhoneFinding, Span, UpiFinding, UpiPaymentRequest, UrlFinding } from '../types';
import { cleanIdentifier, normalize, toOriginal, type Normalized } from '../normalize';
import { analyzeUrl, findUrls } from './urls';
import { analyzeUpiId, findUpiLinks, findVpas, parseUpiUri } from './upi';
import { analyzePhone, findPhones } from './phones';
import { findAmounts } from './amounts';

export interface NSpan {
  s: number;
  e: number;
}

/** Entities plus their spans in normalised coordinates (for rule proximity checks). */
export interface Extraction {
  entities: Entities;
  urlSpans: NSpan[];
  upiSpans: NSpan[];
  upiLinkSpans: NSpan[];
  phoneSpans: NSpan[];
  emailSpans: NSpan[];
  amountSpans: NSpan[];
}

const EMAIL_RE = /[a-z0-9][a-z0-9._%+-]{0,63}@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,24}/g;

export function findEmails(n: string): Array<NSpan & { text: string }> {
  const out: Array<NSpan & { text: string }> = [];
  EMAIL_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = EMAIL_RE.exec(n)) !== null) {
    const s = m.index;
    if (s > 0 && /[a-z0-9._%+-]/.test(n.charAt(s - 1))) continue;
    out.push({ s, e: s + m[0].length, text: m[0] });
  }
  return out;
}

function span(original: string, norm: Normalized, s: number, e: number): Span {
  const o = toOriginal(norm, s, e);
  return { start: o.start, end: o.end, text: original.slice(o.start, o.end) };
}

function overlaps(a: NSpan, list: NSpan[]): boolean {
  return list.some((b) => a.s < b.e && a.e > b.s);
}

/** Extract every entity from text that has already been normalised. */
export function extractFromNormalized(original: string, norm: Normalized, locale: Locale): Extraction {
  const n = norm.text;
  const entities: Entities = { urls: [], upiIds: [], upiRequests: [], phones: [], emails: [], amounts: [] };
  const ex: Extraction = { entities, urlSpans: [], upiSpans: [], upiLinkSpans: [], phoneSpans: [], emailSpans: [], amountSpans: [] };

  // upi:// payment links first, so they are not also read as other things.
  for (const l of findUpiLinks(n)) {
    const sp = span(original, norm, l.s, l.e);
    const req = parseUpiUri(cleanIdentifier(sp.text), locale);
    if (req) {
      entities.upiRequests.push(req);
      ex.upiLinkSpans.push({ s: l.s, e: l.e });
    }
  }

  // Links with a scheme win over emails ("https://www.sbi.co.in@evil.tk" is a link trick, not an email).
  const rawUrls = findUrls(n).filter((u) => !overlaps(u, ex.upiLinkSpans));
  const schemeUrls = rawUrls.filter((u) => /^(?:https?|hxxps?|ftp|data|javascript):|^www\d{0,3}\./.test(u.text));
  const emails = findEmails(n).filter((m) => !overlaps(m, ex.upiLinkSpans) && !overlaps(m, schemeUrls));
  for (const m of emails) {
    entities.emails.push(m.text);
    ex.emailSpans.push({ s: m.s, e: m.e });
  }

  for (const u of rawUrls) {
    if (overlaps(u, ex.emailSpans)) continue;
    const sp = span(original, norm, u.s, u.e);
    const finding: UrlFinding = analyzeUrl(cleanIdentifier(sp.text), locale);
    finding.span = sp;
    entities.urls.push(finding);
    ex.urlSpans.push({ s: u.s, e: u.e });
  }

  for (const v of findVpas(n)) {
    if (overlaps(v, ex.urlSpans) || overlaps(v, ex.upiLinkSpans) || overlaps(v, ex.emailSpans)) continue;
    const finding: UpiFinding = analyzeUpiId(v.text, locale);
    finding.span = span(original, norm, v.s, v.e);
    entities.upiIds.push(finding);
    ex.upiSpans.push({ s: v.s, e: v.e });
  }

  const taken = ex.urlSpans.concat(ex.upiSpans, ex.upiLinkSpans, ex.emailSpans);
  for (const p of findPhones(n)) {
    if (overlaps(p, taken)) continue;
    const sp = span(original, norm, p.s, p.e);
    const finding: PhoneFinding = analyzePhone(p.text, locale);
    finding.raw = sp.text;
    finding.span = sp;
    entities.phones.push(finding);
    ex.phoneSpans.push({ s: p.s, e: p.e });
  }

  const takenWithPhones = taken.concat(ex.phoneSpans);
  for (const a of findAmounts(n)) {
    if (overlaps(a, takenWithPhones)) continue;
    const sp = span(original, norm, a.s, a.e);
    const finding: AmountFinding = { value: a.value, currency: a.currency, text: sp.text, span: sp };
    entities.amounts.push(finding);
    ex.amountSpans.push({ s: a.s, e: a.e });
  }
  return ex;
}

/** Extract links, UPI IDs, upi:// requests, phone numbers, emails and amounts from free text. */
export function extractEntities(text: string, locale: Locale = 'en'): Entities {
  if (typeof text !== 'string' || !text) return { urls: [], upiIds: [], upiRequests: [], phones: [], emails: [], amounts: [] };
  const norm = normalize(text);
  return extractFromNormalized(text, norm, locale).entities;
}

export type { UpiPaymentRequest };
