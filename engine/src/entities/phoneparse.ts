/**
 * Phone number classification only (no localized reasons), kept in its own
 * module so identifierHash() stays small.
 */
import type { PhoneFinding } from '../types';

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

export type Kind = NonNullable<PhoneFinding['kind']>;

export interface Classified {
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

/** Classify a cleaned phone number (Indian numbers default to +91). Null when it is not a valid number. */
export function classify(raw: string): Classified | null {
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
