/**
 * Phone numbers: Indian mobiles and landlines, TRAI 140-series
 * (telemarketing) and 1600-series (banks and financial services), toll-free
 * 1800/1860, the 1930 cyber crime helpline, and international numbers.
 */
import type { Locale, PhoneFinding } from '../types';
import { t } from '../i18n';
import { cleanIdentifier } from '../normalize';
import { classify } from './phoneparse';

/** Countries whose numbers are heavily used by scam call centres targeting India. */
const HIGH_RISK = /* @__PURE__ */ new Set(['PK', 'VN', 'ID', 'KH', 'BD', 'NP', 'KE', 'NG', 'MM', 'LA', 'PH']);
/** Common for genuine contacts abroad, but a red flag on WhatsApp job offers. */
export const CONTEXT_RISK = /* @__PURE__ */ new Set(['GB', 'US']);

const COUNTRY_NAMES: Record<string, [string, string]> = {
  PK: ['Pakistan', 'पाकिस्तान'], VN: ['Vietnam', 'वियतनाम'], ID: ['Indonesia', 'इंडोनेशिया'], KH: ['Cambodia', 'कंबोडिया'],
  BD: ['Bangladesh', 'बांग्लादेश'], NP: ['Nepal', 'नेपाल'], KE: ['Kenya', 'केन्या'], NG: ['Nigeria', 'नाइजीरिया'],
  GB: ['the UK', 'ब्रिटेन'], US: ['the USA or Canada', 'अमेरिका या कनाडा'], MM: ['Myanmar', 'म्यांमार'], LA: ['Laos', 'लाओस'],
  PH: ['the Philippines', 'फ़िलीपींस'], AE: ['the UAE', 'यूएई'], SA: ['Saudi Arabia', 'सऊदी अरब'], MY: ['Malaysia', 'मलेशिया'],
  TH: ['Thailand', 'थाईलैंड'], CN: ['China', 'चीन'], LK: ['Sri Lanka', 'श्रीलंका'], SG: ['Singapore', 'सिंगापुर'],
  AU: ['Australia', 'ऑस्ट्रेलिया'], RU: ['Russia', 'रूस'], HK: ['Hong Kong', 'हांगकांग'], QA: ['Qatar', 'क़तर'],
  KW: ['Kuwait', 'कुवैत'], OM: ['Oman', 'ओमान'],
};

function countryName(iso: string, locale: Locale): string {
  const pair = COUNTRY_NAMES[iso];
  if (!pair) return iso;
  return locale === 'hi' ? pair[1] : pair[0];
}

/** Analyse a phone number. Indian numbers default to +91. */
export function analyzePhone(raw: string, locale: Locale = 'en'): PhoneFinding {
  const clean = cleanIdentifier(raw);
  const c = classify(clean);
  if (!c) {
    const digits = clean.replace(/[^\d+]/g, '');
    return { raw: clean, e164: digits, kind: 'unknown', risk: 20, reasons: [t(locale, 'phone.invalid')] };
  }
  const f: PhoneFinding = { raw: clean, e164: c.e164, country: c.country, kind: c.kind, risk: 0, reasons: [] };
  switch (c.kind) {
    case 'mobile':
      f.risk = 5;
      f.reasons.push(t(locale, 'phone.mobile'));
      break;
    case 'landline':
      f.reasons.push(t(locale, 'phone.landline'));
      break;
    case 'telemarketing_140':
      f.risk = 15;
      f.reasons.push(t(locale, 'phone.tm140'));
      break;
    case 'service_1600':
      f.reasons.push(t(locale, 'phone.s1600'));
      break;
    case 'tollfree':
      f.reasons.push(t(locale, c.e164 === '1930' ? 'phone.1930' : 'phone.tollfree'));
      break;
    case 'international':
      if (HIGH_RISK.has(c.country)) {
        f.risk = 45;
        f.reasons.push(t(locale, 'phone.intl_risky', { country: countryName(c.country, locale) }));
      } else {
        f.risk = CONTEXT_RISK.has(c.country) ? 20 : 15;
        f.reasons.push(t(locale, 'phone.intl', { country: countryName(c.country, locale) }));
      }
      break;
    default:
      f.reasons.push(t(locale, 'phone.emergency'));
      break;
  }
  return f;
}

/** True when the number is from a country flagged as high risk for scams aimed at India. */
export function isHighRiskCountry(iso: string | undefined): boolean {
  return iso !== undefined && HIGH_RISK.has(iso);
}

// ---------------------------------------------------------------------------
// Extraction from normalised text

export interface RawSpan {
  s: number;
  e: number;
  text: string;
}

const PHONE_RE = /(?:\+|\b00)?\d[\d ().-]{5,18}\d/g;
const HELPLINE_RE = /\b1930\b/g;
/** Words right before a long number that mean it is not a phone number. */
const NOT_PHONE_BEFORE =
  /(?:a\/c|acct|account|card|ref|txn|utr|rrn|pnr|awb|order|id|aadhaa?r|pan|invoice|consumer|ca|policy|tracking|track|otp|code|pin|no\.? of|imps|neft|rtgs|loan|folio|reference|transaction|shipment|consignment|docket|ticket|booking|serial|imei|खाता|संदर्भ)[^a-zऀ-ॿ]{0,6}(?:no\.?|number|num|#|:)?[^a-zऀ-ॿ]{0,3}$/;

/** Find phone numbers in normalised text. */
export function findPhones(n: string): RawSpan[] {
  const out: RawSpan[] = [];
  let m: RegExpExecArray | null;
  PHONE_RE.lastIndex = 0;
  while ((m = PHONE_RE.exec(n)) !== null) {
    let text = m[0].replace(/[\s().-]+$/, '');
    let s = m.index;
    // Trim leading separators like "(" that the regex may not include.
    while (text.length > 0 && /[\s().-]/.test(text.charAt(0)) && text.charAt(0) !== '(') {
      text = text.slice(1);
      s++;
    }
    const prev = s > 0 ? n.charAt(s - 1) : ' ';
    if (/[a-z0-9/:@._\-₹$]/.test(prev)) continue;
    const before = n.slice(Math.max(0, s - 24), s);
    if (NOT_PHONE_BEFORE.test(before)) continue;
    if (/(?:rs|inr)\.?\s?$/.test(n.slice(Math.max(0, s - 4), s))) continue;
    let valid: string | null = classify(text) ? text : null;
    if (!valid) {
      // Two numbers in a row ("98765 43210 99887 76655"): keep the longest valid prefix.
      for (let i = text.length - 1; i > 6; i--) {
        if (/[ ().-]/.test(text.charAt(i))) {
          const cand = text.slice(0, i).replace(/[ ().-]+$/, '');
          if (classify(cand)) {
            valid = cand;
            break;
          }
        }
      }
      if (!valid) continue;
      PHONE_RE.lastIndex = s + valid.length;
    } else {
      const after = n.charAt(s + text.length);
      if (/[a-z0-9@%]/.test(after)) continue;
    }
    out.push({ s, e: s + valid.length, text: valid });
  }
  HELPLINE_RE.lastIndex = 0;
  while ((m = HELPLINE_RE.exec(n)) !== null) {
    const s = m.index;
    if (out.some((p) => s >= p.s && s < p.e)) continue;
    out.push({ s, e: s + 4, text: '1930' });
  }
  return out.sort((a, b) => a.s - b.s);
}
