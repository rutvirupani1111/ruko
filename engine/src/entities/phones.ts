/**
 * Phone numbers: Indian mobiles and landlines, TRAI 140-series
 * (telemarketing) and 1600-series (banks and financial services), toll-free
 * 1800/1860, the 1930 cyber crime helpline, and international numbers.
 */
import type { Locale, PhoneFinding } from '../types';
import { t } from '../i18n';
import { cleanIdentifier } from '../normalize';

const CC_ROWS =
  '1=US 7=RU 20=EG 27=ZA 30=GR 31=NL 32=BE 33=FR 34=ES 36=HU 39=IT 40=RO 41=CH 43=AT 44=GB 45=DK 46=SE 47=NO 48=PL ' +
  '49=DE 51=PE 52=MX 54=AR 55=BR 56=CL 57=CO 60=MY 61=AU 62=ID 63=PH 64=NZ 65=SG 66=TH 81=JP 82=KR 84=VN 86=CN ' +
  '90=TR 91=IN 92=PK 93=AF 94=LK 95=MM 98=IR 212=MA 213=DZ 216=TN 225=CI 233=GH 234=NG 237=CM 251=ET 254=KE ' +
  '255=TZ 256=UG 260=ZM 263=ZW 351=PT 353=IE 357=CY 358=FI 370=LT 371=LV 372=EE 375=BY 380=UA 420=CZ 852=HK ' +
  '853=MO 855=KH 856=LA 880=BD 886=TW 960=MV 961=LB 962=JO 963=SY 964=IQ 965=KW 966=SA 967=YE 968=OM 971=AE ' +
  '972=IL 973=BH 974=QA 975=BT 976=MN 977=NP 992=TJ 993=TM 994=AZ 995=GE 996=KG 998=UZ';

let CC: Map<string, string> | null = null;
function countryCodes(): Map<string, string> {
  if (!CC) {
    CC = new Map();
    for (const row of CC_ROWS.split(' ')) {
      const [code, iso] = row.split('=') as [string, string];
      CC.set(code, iso);
    }
  }
  return CC;
}

/** Countries whose numbers are heavily used by scam call centres targeting India. */
const HIGH_RISK = new Set(['PK', 'VN', 'ID', 'KH', 'BD', 'NP', 'KE', 'NG', 'MM', 'LA', 'PH']);
/** Common for genuine contacts abroad, but a red flag on WhatsApp job offers. */
export const CONTEXT_RISK = new Set(['GB', 'US']);

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

type Kind = NonNullable<PhoneFinding['kind']>;

interface Classified {
  e164: string;
  country: string;
  kind: Kind;
}

function indian(n: string, raw: string): Classified | null {
  if (/^[6-9]\d{9}$/.test(n)) {
    // "080-2654 3210" style: an STD code with a leading 0 and a separator is a landline.
    const local = raw.replace(/^\s*(?:\+|00)?91[\s-]?/, '').trim();
    if (/^0\d{2,4}[\s-]\d/.test(local)) return { e164: '+91' + n, country: 'IN', kind: 'landline' };
    return { e164: '+91' + n, country: 'IN', kind: 'mobile' };
  }
  if (/^140\d{7}$/.test(n)) return { e164: '+91' + n, country: 'IN', kind: 'telemarketing_140' };
  if (/^1600\d{6}$/.test(n)) return { e164: '+91' + n, country: 'IN', kind: 'service_1600' };
  if (/^18[06]0\d{6,7}$/.test(n)) return { e164: '+91' + n, country: 'IN', kind: 'tollfree' };
  if (/^[1-5]\d{9}$/.test(n)) return { e164: '+91' + n, country: 'IN', kind: 'landline' };
  return null;
}

const SHORT_CODES: Record<string, Kind> = { '1930': 'tollfree', '155260': 'tollfree', '112': 'unknown', '100': 'unknown', '1098': 'unknown', '181': 'unknown', '198': 'unknown', '121': 'unknown', '139': 'unknown', '14422': 'unknown' };

function classify(raw: string): Classified | null {
  const s = raw.trim();
  const plus = s.startsWith('+') || /^00[1-9]/.test(s);
  let d = s.replace(/\D/g, '');
  if (!plus && SHORT_CODES[d]) return { e164: d, country: 'IN', kind: SHORT_CODES[d] as Kind };
  if (plus) {
    if (s.startsWith('00')) d = d.slice(2);
    if (d.startsWith('91')) return indian(d.slice(2), s);
    const cc = countryCodes();
    for (const len of [3, 2, 1]) {
      const iso = cc.get(d.slice(0, len));
      if (iso) {
        const rest = d.slice(len);
        if (rest.length >= 6 && rest.length <= 12) return { e164: '+' + d, country: iso, kind: 'international' };
        return null;
      }
    }
    return null;
  }
  if (d.length === 12 && d.startsWith('91')) return indian(d.slice(2), s);
  if (d.length === 11 && d.startsWith('0')) return indian(d.slice(1), s);
  if (d.length === 10) return indian(d, s);
  if (d.length === 11 && /^18[06]0/.test(d)) return { e164: '+91' + d, country: 'IN', kind: 'tollfree' };
  return null;
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
