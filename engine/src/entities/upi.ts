/**
 * UPI IDs (VPAs) and `upi://` payment links.
 *
 * The one rule every user must know: a UPI QR code or payment link can only
 * take money out of your account. Nobody ever needs your PIN or a scan to
 * send you money.
 */
import type { Locale, UpiFinding, UpiPaymentRequest } from '../types';
import { t } from '../i18n';
import { cleanIdentifier } from '../normalize';
import { parseUpiParams } from './upiparse';
import { brandTokenInHost } from '../domains/brands';
import { combine } from '../util';

/** UPI handle → app / bank behind it. */
const HANDLE_ROWS =
  'ybl=PhonePe (Yes Bank)|ibl=PhonePe (ICICI Bank)|axl=PhonePe (Axis Bank)|okhdfcbank=Google Pay (HDFC Bank)|' +
  'okicici=Google Pay (ICICI Bank)|oksbi=Google Pay (SBI)|okaxis=Google Pay (Axis Bank)|okbizaxis=Google Pay for Business (Axis Bank)|' +
  'paytm=Paytm|ptyes=Paytm (Yes Bank)|ptaxis=Paytm (Axis Bank)|pthdfc=Paytm (HDFC Bank)|ptsbi=Paytm (SBI)|' +
  'apl=Amazon Pay (Axis Bank)|yapl=Amazon Pay (Yes Bank)|rapl=Amazon Pay (RBL Bank)|upi=BHIM|ikwik=MobiKwik|' +
  'fbl=Federal Bank|airtel=Airtel Payments Bank|jio=Jio Payments|axisbank=Axis Bank|icici=ICICI Bank|' +
  'hdfcbank=HDFC Bank|sbi=SBI|kotak=Kotak Mahindra Bank|kmbl=Kotak Mahindra Bank|idfcbank=IDFC FIRST Bank|' +
  'idfcfirst=IDFC FIRST Bank|idfc=IDFC FIRST Bank|cmsidfc=IDFC FIRST Bank|yesbank=Yes Bank|yesbankltd=Yes Bank|' +
  'pnb=Punjab National Bank|barodampay=Bank of Baroda|barodapay=Bank of Baroda|cnrb=Canara Bank|' +
  'unionbank=Union Bank of India|unionbankofindia=Union Bank of India|uboi=Union Bank of India|indus=IndusInd Bank|' +
  'boi=Bank of India|mahb=Bank of Maharashtra|cbin=Central Bank of India|centralbank=Central Bank of India|' +
  'iob=Indian Overseas Bank|indianbank=Indian Bank|idbi=IDBI Bank|idbibank=IDBI Bank|rbl=RBL Bank|' +
  'federal=Federal Bank|dbs=DBS Bank|hsbc=HSBC|sc=Standard Chartered|citi=Citibank|citigold=Citibank|' +
  'aubank=AU Small Finance Bank|equitas=Equitas Small Finance Bank|ujjivansfb=Ujjivan Small Finance Bank|' +
  'kvb=Karur Vysya Bank|kbl=Karnataka Bank|tjsb=TJSB Bank|dcb=DCB Bank|dlb=Dhanlaxmi Bank|csbpay=CSB Bank|' +
  'jkb=J&K Bank|sib=South Indian Bank|uco=UCO Bank|psb=Punjab & Sind Bank|bandhan=Bandhan Bank|' +
  'fino=Fino Payments Bank|finobank=Fino Payments Bank|postbank=India Post Payments Bank|nsdl=NSDL Payments Bank|' +
  'freecharge=Freecharge|axisb=CRED (Axis Bank)|naviaxis=Navi (Axis Bank)|jupiteraxis=Jupiter (Axis Bank)|' +
  'fifederal=Fi (Federal Bank)|sliceaxis=slice (Axis Bank)|tapicici=Tata Neu (ICICI Bank)|' +
  'waicici=WhatsApp Pay (ICICI Bank)|waaxis=WhatsApp Pay (Axis Bank)|wahdfcbank=WhatsApp Pay (HDFC Bank)|' +
  'wasbi=WhatsApp Pay (SBI)|payzapp=PayZapp (HDFC Bank)|pockets=Pockets (ICICI Bank)|superyes=super.money (Yes Bank)|' +
  'fbpe=BharatPe (Federal Bank)|myicici=ICICI Bank|imobile=ICICI Bank|eazypay=ICICI Bank (merchant)|' +
  'timecosmos=Cosmos Bank|abfspay=Aditya Birla Capital';

let HANDLES: Map<string, string> | null = null;

function handles(): Map<string, string> {
  if (!HANDLES) {
    HANDLES = new Map();
    for (const row of HANDLE_ROWS.split('|')) {
      const eq = row.indexOf('=');
      HANDLES.set(row.slice(0, eq), row.slice(eq + 1));
    }
  }
  return HANDLES;
}

/** App or bank behind a UPI handle, e.g. `ybl` → `PhonePe (Yes Bank)`. */
export function upiHandleApp(handle: string): string | undefined {
  return handles().get(handle.toLowerCase());
}

/** Number of handles in the registry (exported for tests and docs). */
export function upiHandleCount(): number {
  return handles().size;
}

const RISKY_LOCAL_WORDS = [
  'refund', 'support', 'customercare', 'care', 'helpdesk', 'helpline', 'help', 'kyc', 'cashback', 'reward', 'lottery',
  'prize', 'winner', 'lucky', 'claim', 'bonus', 'gift', 'govt', 'gov', 'government', 'rbi', 'npci', 'police', 'cbi',
  'customs', 'court', 'incometax', 'itdept', 'sebi', 'trai', 'verify', 'verification', 'official', 'security',
  'unblock', 'cybercell', 'cybercrime', 'crime', 'penalty', 'challan', 'fine', 'tax', 'ed',
];
const EXACT_ONLY = /* @__PURE__ */ new Set(['ed', 'fine', 'tax', 'gov', 'help', 'care', 'kyc', 'rbi', 'cbi']);

function riskyWord(local: string): string | null {
  const parts = local.split(/[._\-\d]+/).filter(Boolean);
  for (const w of RISKY_LOCAL_WORDS) {
    for (const p of parts) {
      if (p === w) return w;
      if (EXACT_ONLY.has(w)) {
        if (w.length >= 3 && p.length > w.length && (p.startsWith(w) || p.endsWith(w)) && p.length - w.length >= 3) return w;
        continue;
      }
      if (p.indexOf(w) >= 0) return w;
    }
  }
  return null;
}

const VPA_FULL = /^[a-z0-9][a-z0-9._-]{1,255}@[a-z][a-z0-9.]{1,63}$/;

/** Analyse a UPI ID such as `rahul@okhdfcbank` or `refund.support@ybl`. */
export function analyzeUpiId(vpa: string, locale: Locale = 'en'): UpiFinding {
  let v = cleanIdentifier(vpa).toLowerCase();
  if (/^[a-z]+:\/\//.test(v)) {
    const req = parseUpiUri(vpa, locale);
    if (req) v = req.payee.toLowerCase();
  }
  const at = v.lastIndexOf('@');
  const handle = at >= 0 ? v.slice(at + 1) : '';
  if (!VPA_FULL.test(v)) {
    return { vpa: v, handle, risk: 30, reasons: [t(locale, 'upi.invalid')] };
  }
  const local = v.slice(0, at);
  const finding: UpiFinding = { vpa: v, handle, risk: 0, reasons: [] };
  const risks: number[] = [];
  const app = upiHandleApp(handle);
  if (app) {
    finding.app = app;
    finding.reasons.push(t(locale, 'upi.known', { app }));
  } else {
    risks.push(30);
    finding.reasons.push(t(locale, 'upi.unknown', { handle }));
  }
  const word = riskyWord(local);
  const brand = brandTokenInHost(local);
  if (word) {
    risks.push(brand ? 75 : 60);
    finding.reasons.push(t(locale, 'upi.risky', { word }));
  } else if (brand && brand.brand.kind !== 'tech') {
    risks.push(10);
    const name = locale === 'hi' ? brand.brand.nameHi : brand.brand.name;
    finding.reasons.push(t(locale, 'upi.brand', { brand: name }));
  }
  if (/^(?:\+?91)?[6-9]\d{9}$/.test(local)) finding.reasons.push(t(locale, 'upi.mobile'));
  finding.risk = Math.round(combine(risks));
  return finding;
}

const RECEIVE_WORDS =
  /(receiv|refund|cash ?back|prize|lottery|reward|\bwon\b|winning|winner|claim|bonus|credit|return|kyc|verif|unblock|gift|lucky|get money|प्राप्त|रिफंड|इनाम|कैशबैक|वापस|जीत|paise milenge|paisa milega)/i;
const AUTHORITY_NAMES = /(police|cbi|\brbi\b|reserve bank|income ?tax|govt|government|customs|court|npci|sebi|trai|cyber ?cell|crime branch|पुलिस|सरकार)/i;


/** Parse `upi://pay?pa=..&pn=..&am=..&tn=..&cu=..` (and app variants such as `tez://upi/pay`). */
export function parseUpiUri(uri: string, locale: Locale = 'en'): UpiPaymentRequest | null {
  const parsed = parseUpiParams(cleanIdentifier(uri));
  if (!parsed) return null;
  const { action, params } = parsed;
  const payee = (params.get('pa') ?? '').toLowerCase();
  const req: UpiPaymentRequest = { payee, risk: 0, reasons: [t(locale, 'upi.pay_only')] };
  const risks: number[] = [25];
  const pn = params.get('pn');
  if (pn) req.payeeName = pn;
  const am = params.get('am');
  if (am) {
    const v = parseFloat(am.replace(/,/g, ''));
    if (isFinite(v) && v > 0) req.amount = v;
  }
  const note = params.get('tn') ?? params.get('purpose') ?? '';
  if (note) req.note = note;
  const cu = params.get('cu');
  if (cu) req.currency = cu.toUpperCase();

  if (!payee) {
    risks.push(40);
    req.reasons.push(t(locale, 'upi.no_payee'));
  } else {
    const vf = analyzeUpiId(payee, locale);
    if (vf.risk >= 30) {
      risks.push(vf.risk);
      for (const r of vf.reasons) if (req.reasons.indexOf(r) < 0) req.reasons.push(r);
    }
  }
  const text = `${note} ${pn ?? ''}`;
  const rm = RECEIVE_WORDS.exec(text);
  if (rm) {
    risks.push(92);
    req.reasons.push(t(locale, 'upi.note_receive', { note: (note || pn || '').slice(0, 60) }));
  }
  if (pn && AUTHORITY_NAMES.test(pn)) {
    risks.push(45);
    req.reasons.push(t(locale, 'upi.payee_name', { name: pn.slice(0, 40) }));
  }
  if (action.indexOf('mandate') >= 0 || params.has('mn') || params.has('recur')) {
    risks.push(60);
    req.reasons.push(t(locale, 'upi.mandate'));
  }
  if (req.amount !== undefined && req.amount >= 20000) {
    risks.push(15);
    req.reasons.push(t(locale, 'upi.big_amount', { amount: req.amount.toLocaleString('en-IN') }));
  }
  if (req.currency && req.currency !== 'INR') {
    risks.push(20);
    req.reasons.push(t(locale, 'upi.currency', { cu: req.currency }));
  }
  req.risk = Math.min(99, Math.round(combine(risks)));
  return req;
}

// ---------------------------------------------------------------------------
// Extraction from normalised text

export interface RawSpan {
  s: number;
  e: number;
  text: string;
}

const UPI_LINK_RE = /(?:upi|tez|gpay|phonepe|paytmmp|bhim|credpay):\/\/[^\s<>"']+/g;
const VPA_RE = /[a-z0-9][a-z0-9._-]{1,255}@[a-z][a-z0-9]{1,63}/g;
const UPI_CONTEXT = /(upi|vpa|gpay|google pay|phonepe|phone pe|paytm|bhim|\bpay\b|send|transfer|₹|\brs\.? ?\d|payment|collect|यूपीआई|पेमेंट|भेज|भुगतान)/;

export function findUpiLinks(n: string): RawSpan[] {
  const out: RawSpan[] = [];
  let m: RegExpExecArray | null;
  UPI_LINK_RE.lastIndex = 0;
  while ((m = UPI_LINK_RE.exec(n)) !== null) {
    const text = m[0].replace(/[.,;:!?)'"]+$/, '');
    out.push({ s: m.index, e: m.index + text.length, text });
  }
  return out;
}

/** Find UPI IDs. Unknown handles count only when the text is clearly about payments. */
export function findVpas(n: string, forceUnknown = false): RawSpan[] {
  const out: RawSpan[] = [];
  const context = forceUnknown || UPI_CONTEXT.test(n);
  let m: RegExpExecArray | null;
  VPA_RE.lastIndex = 0;
  while ((m = VPA_RE.exec(n)) !== null) {
    const s = m.index;
    const e = s + m[0].length;
    const prev = s > 0 ? n.charAt(s - 1) : ' ';
    if (/[a-z0-9._\-@/]/.test(prev)) continue;
    const next = n.charAt(e);
    if (next === '.' && /[a-z]/.test(n.charAt(e + 1))) continue; // an email address
    if (/[a-z0-9@]/.test(next)) continue;
    const handle = m[0].slice(m[0].lastIndexOf('@') + 1);
    const known = upiHandleApp(handle) !== undefined;
    if (!known && !(context && /(bank|pay|upi|ok|axis|icici|hdfc|sbi|yes|kotak)/.test(handle)) && !forceUnknown) {
      if (!context) continue;
      // Unknown handle in payment context: accept short alphabetic handles only.
      if (!/^[a-z]{2,15}$/.test(handle)) continue;
    }
    out.push({ s, e, text: m[0] });
  }
  return out;
}
