/**
 * analyze(): normalise → extract entities → evaluate rules and entity checks
 * → combine scores → localized headline, summary and advice.
 */
import type {
  AnalyzeOptions,
  Entities,
  InputKind,
  Locale,
  ScamCategory,
  Signal,
  Source,
  Span,
  UpiFinding,
  UrlFinding,
  Verdict,
} from './types';
import { ENGINE_VERSION } from './version';
import { cleanIdentifier, normalize, toOriginal, type Normalized } from './normalize';
import { detectLanguage } from './lang';
import { extractFromNormalized, type Extraction, type NSpan } from './entities';
import { analyzeUrl, parseUrl } from './entities/urls';
import { analyzeUpiId, parseUpiUri } from './entities/upi';
import { analyzePhone, isHighRiskCountry } from './entities/phones';
import { getBrands, officialBrandForHost, type Brand } from './domains/brands';
import { getRuleSet } from './rules';
import { evalRule, matchCue, type EvalContext, type Hit } from './rules/engine';
import { isFreeMailDomain, parseSender, senderFlags, type SenderInfo } from './sender';
import { scoreSignals, severityFor } from './score';
import { buildAdvice } from './advice';
import { t, type MessageKey } from './i18n';

const MAX_INPUT = 20000;

type Kind = Exclude<InputKind, 'auto'>;

const FILE_EXT = /\.(?:apk|apks|xapk|exe|pdf|jpe?g|png|gif|docx?|xlsx?|pptx?|zip|rar|mp4|mp3|txt|csv)$/i;

/** Guess what a pasted input is: a link, a UPI ID or upi:// link, a phone number, an email or a message. */
export function detectInputKind(input: string): Kind {
  const s = cleanIdentifier(typeof input === 'string' ? input : '');
  if (!s) return 'message';
  if (/\s/.test(s)) {
    const digits = s.replace(/\D/g, '');
    if (/^\+?[\d\s().-]{6,22}$/.test(s) && digits.length >= 7 && digits.length <= 15) return 'phone';
    return 'message';
  }
  if (/^(?:upi|tez|gpay|phonepe|paytmmp|paytm|bhim|credpay):\/\//i.test(s)) return 'upi';
  if (/^[a-z0-9][a-z0-9._-]{1,255}@[a-z][a-z0-9]{1,63}$/i.test(s)) return 'upi';
  if (/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(s)) return 'email';
  if (/^\+?[\d().-]{3,20}$/.test(s) && /\d{3}/.test(s)) return 'phone';
  if (/^(?:https?|hxxps?|ftp):\/\//i.test(s) || /^www\./i.test(s) || /^(?:data|javascript):/i.test(s)) return 'url';
  if (FILE_EXT.test(s)) return 'message';
  if (/^[^./]+(?:\.[^./\s]+)+(?::\d+)?(?:[/?#]\S*)?$/.test(s) && parseUrl(s)) return 'url';
  return 'message';
}

function sourceFromPage(pageUrl: string | undefined): Source | undefined {
  if (!pageUrl) return undefined;
  const host = (parseUrl(pageUrl)?.host ?? '').replace(/^www\./, '');
  if (host === 'web.whatsapp.com') return 'whatsapp';
  if (host === 'mail.google.com' || host.endsWith('outlook.live.com') || host.endsWith('outlook.office.com') || host === 'mail.yahoo.com') return 'email';
  return 'web';
}

function emptyEntities(): Entities {
  return { urls: [], upiIds: [], upiRequests: [], phones: [], emails: [], amounts: [] };
}

// ---------------------------------------------------------------------------
// Brand mentions (for the "text names a brand, link goes elsewhere" check)

let mentionRe: RegExp | null = null;
let mentionMap: Map<string, Brand> | null = null;
const MENTION_KINDS = new Set(['bank', 'pay', 'gov', 'post', 'tel', 'util', 'ins', 'fin', 'shop', 'travel']);
const MENTION_STOP = new Set(['bob', 'upi', 'rto', 'lic', 'tez', 'gst', 'uber', 'yatra', 'apple', 'ola', 'cred', 'vahan', 'amzn', 'ekart']);
const EXTRA_MENTIONS: Array<[string, string]> = [
  ['state bank', 'sbi'], ['punjab national bank', 'pnb'], ['bank of baroda', 'bob'], ['india post', 'indiapost'],
  ['income tax', 'incometax'], ['blue dart', 'bluedart'], ['google pay', 'gpay'], ['amazon pay', 'amazonpay'],
  ['axis bank', 'axis'], ['canara bank', 'canara'], ['union bank', 'union'], ['yes bank', 'yes'], ['bank of india', 'boi'],
  ['एसबीआई', 'sbi'], ['आयकर', 'incometax'], ['इंडिया पोस्ट', 'indiapost'], ['पेटीएम', 'paytm'], ['फोनपे', 'phonepe'],
];

function brandMentions(n: string): Brand[] {
  if (!mentionRe || !mentionMap) {
    mentionMap = new Map();
    const brands = getBrands();
    for (const b of brands) {
      if (!MENTION_KINDS.has(b.kind)) continue;
      for (const raw of b.tokens) {
        const tok = raw.charAt(0) === '=' ? raw.slice(1) : raw;
        if (tok.length < 3 || MENTION_STOP.has(tok)) continue;
        if (!mentionMap.has(tok)) mentionMap.set(tok, b);
      }
    }
    for (const [phrase, id] of EXTRA_MENTIONS) {
      const b = brands.find((x) => x.id === id);
      if (b) mentionMap.set(phrase, b);
    }
    const keys = Array.from(mentionMap.keys()).sort((a, b) => b.length - a.length);
    mentionRe = new RegExp(keys.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
  }
  const out: Brand[] = [];
  const re = mentionRe;
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(n)) !== null) {
    const s = m.index;
    const e = s + m[0].length;
    const before = s > 0 ? n.charAt(s - 1) : ' ';
    const after = e < n.length ? n.charAt(e) : ' ';
    if (/[a-z0-9ऀ-ॿ]/.test(before) || /[a-z0-9ऀ-ॿ]/.test(after)) {
      re.lastIndex = s + 1;
      continue;
    }
    // Skip names that are part of a link or email.
    if (/[./@-]/.test(before) || (after === '.' && /[a-z]/.test(n.charAt(e + 1)))) continue;
    const b = mentionMap.get(m[0]);
    if (b && out.indexOf(b) < 0) out.push(b);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Signals

interface SigInput {
  id: string;
  category: ScamCategory;
  weight: number;
  title: string;
  detail: string;
  spans: Span[];
}

function mergeSpans(spans: Span[], max = 8): Span[] {
  const sorted = spans.slice().sort((a, b) => a.start - b.start || b.end - a.end);
  const out: Span[] = [];
  for (const sp of sorted) {
    const last = out[out.length - 1];
    if (last && sp.start <= last.end) {
      if (sp.end > last.end) {
        last.end = sp.end;
      }
      continue;
    }
    out.push({ start: sp.start, end: sp.end, text: '' });
  }
  return out.slice(0, max);
}

function urlSignals(ex: Extraction, locale: Locale, spanOf: (n: NSpan) => Span): SigInput[] {
  const out: SigInput[] = [];
  ex.entities.urls.forEach((u, i) => {
    const ns = ex.urlSpans[i];
    const spans = u.span ? [u.span] : ns ? [spanOf(ns)] : [];
    out.push(...signalsForUrl(u, locale, spans));
  });
  return out;
}

function signalsForUrl(u: UrlFinding, locale: Locale, spans: Span[]): SigInput[] {
  if (u.knownGood) return [];
  if (u.official && !u.download) return [];
  const brand = u.impersonates ?? '';
  const detail = u.reasons.slice(0, 2).join('. ') + '.';
  if (u.download) {
    return [{ id: 'url.download', category: 'malicious_app', weight: 75, title: t(locale, 'sig.url_download.t'), detail: t(locale, 'sig.url_download.d'), spans }];
  }
  if (u.impersonates && u.impersonationKind && u.impersonationKind !== 'path') {
    const w = Math.max(60, Math.min(90, u.risk));
    return [{ id: 'url.lookalike', category: 'lookalike_domain', weight: w, title: t(locale, 'sig.url_lookalike.t', { brand }), detail, spans }];
  }
  if (u.impersonates) {
    const w = Math.max(30, Math.min(60, Math.round(u.risk * 0.8)));
    return [{ id: 'url.brand_path', category: 'phishing_link', weight: w, title: t(locale, 'sig.url_brand_path.t', { brand }), detail, spans }];
  }
  if (u.risk >= 30) {
    const w = Math.min(55, Math.round(u.risk * 0.75));
    return [{ id: 'url.risky', category: 'phishing_link', weight: w, title: t(locale, 'sig.url_risky.t'), detail, spans }];
  }
  if (u.shortener) {
    return [{ id: 'url.shortener', category: 'phishing_link', weight: 12, title: t(locale, 'sig.url_short.t'), detail: t(locale, 'sig.url_short.d'), spans }];
  }
  return [];
}

const UPI_WORD_CATEGORY: Array<[RegExp, ScamCategory]> = [
  [/refund|support|care|help/, 'fake_support'],
  [/kyc/, 'kyc_update'],
  [/lottery|prize|winner|lucky|reward|cashback|bonus|gift|claim/, 'lottery_prize'],
  [/police|cbi|court|customs|crime|cyber/, 'digital_arrest'],
  [/rbi|npci|govt|gov|government|sebi|trai|tax|official|verif|security|unblock|penalty|challan|fine/, 'impersonation'],
];

function signalsForUpiId(f: UpiFinding, locale: Locale, spans: Span[], alone = false): SigInput[] {
  if (f.risk >= 50) {
    const local = f.vpa.slice(0, f.vpa.lastIndexOf('@'));
    let category: ScamCategory = 'other';
    for (const [re, cat] of UPI_WORD_CATEGORY) {
      if (re.test(local)) {
        category = cat;
        break;
      }
    }
    const weight = alone ? f.risk : Math.round(f.risk * 0.75);
    return [{ id: 'upi.risky_id', category, weight, title: t(locale, 'sig.upi_risky.t'), detail: f.reasons.filter((r) => r).slice(-1)[0] + '.', spans }];
  }
  if (f.risk >= 30 && !f.app) {
    return [{ id: 'upi.unknown_handle', category: 'other', weight: alone ? 25 : 15, title: t(locale, 'sig.upi_unknown.t'), detail: (f.reasons[0] ?? '') + '.', spans }];
  }
  return [];
}

function signalsForUpiRequest(req: Verdict['entities']['upiRequests'][number], locale: Locale, spans: Span[], fromQr: boolean): SigInput[] {
  const detail = req.reasons.slice(0, 3).join(' ');
  if (req.risk >= 90) {
    return [{ id: 'upi.receive_trick', category: 'qr_receive', weight: 88, title: t(locale, 'sig.upi_receive.t'), detail, spans }];
  }
  if (req.reasons.indexOf(t(locale, 'upi.mandate')) >= 0) {
    return [{ id: 'upi.mandate', category: 'upi_collect', weight: 50, title: t(locale, 'sig.upi_mandate.t'), detail, spans }];
  }
  const w = Math.max(20, Math.min(50, Math.round(req.risk * 0.6)));
  return [{ id: 'upi.pay_link', category: fromQr ? 'qr_receive' : 'upi_collect', weight: w, title: t(locale, 'sig.upi_link.t'), detail, spans }];
}

const OFFICIAL_WORDS = /(cbi|police|rbi|reserve.?bank|sbi|hdfc|icici|axis|kotak|income.?tax|incometax|customs|court|govt|gov|government|officer|department|ministry|cyber|crime|kyc|refund|uidai|aadhaa?r|npci|trai|sebi|bank|helpdesk|support|customercare)/;

function emailSignals(email: string, locale: Locale, spans: Span[], idPrefix: 'email' | 'sender', displayName = ''): SigInput[] {
  const at = email.lastIndexOf('@');
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (isFreeMailDomain(domain)) {
    if (OFFICIAL_WORDS.test(local) || (displayName && OFFICIAL_WORDS.test(displayName.toLowerCase()))) {
      if (idPrefix === 'sender' && displayName && OFFICIAL_WORDS.test(displayName.toLowerCase())) {
        return [{ id: 'sender.free_brand', category: 'impersonation', weight: 35, title: t(locale, 'sig.sender_free_brand.t', { brand: displayName.slice(0, 40) }), detail: t(locale, 'sig.email_free_official.d'), spans }];
      }
      return [{ id: `${idPrefix}.free_official`, category: 'impersonation', weight: 35, title: t(locale, 'sig.email_free_official.t'), detail: t(locale, 'sig.email_free_official.d'), spans }];
    }
    return [];
  }
  const u = analyzeUrl(domain, locale);
  if (u.official && !u.download) {
    if (idPrefix === 'sender') {
      const brand = officialBrandForHost(domain);
      const name = brand ? (locale === 'hi' ? brand.nameHi : brand.name) : domain;
      return [{ id: 'ok.sender_official', category: 'other', weight: -15, title: t(locale, 'sig.sender_official.t', { brand: name }), detail: t(locale, 'sig.sender_official.d'), spans }];
    }
    return [];
  }
  if (u.impersonates && u.impersonationKind && u.impersonationKind !== 'path') {
    const key: MessageKey = idPrefix === 'sender' ? 'sig.sender_lookalike.t' : 'sig.email_lookalike.t';
    return [{ id: `${idPrefix}.lookalike`, category: 'lookalike_domain', weight: Math.max(55, Math.min(88, u.risk)), title: t(locale, key, { brand: u.impersonates }), detail: u.reasons[0] + '.', spans }];
  }
  return [];
}

// ---------------------------------------------------------------------------

function toSpan(original: string, norm: Normalized, s: number, e: number): Span {
  const o = toOriginal(norm, s, e);
  return { start: o.start, end: o.end, text: original.slice(o.start, o.end) };
}

function finalizeSpans(original: string, spans: Span[]): Span[] {
  return mergeSpans(spans).map((sp) => ({ start: sp.start, end: sp.end, text: original.slice(sp.start, sp.end) }));
}

function headlineFor(locale: Locale, score: number, category: ScamCategory | null, officialBrand: string | null): string {
  const sev = severityFor(score);
  if (officialBrand && sev === 'safe') return t(locale, 'head.official', { brand: officialBrand });
  const label = t(locale, `cat.${category ?? 'other'}` as MessageKey);
  if (sev === 'critical') return t(locale, 'head.critical', { label });
  if (sev === 'high') return t(locale, 'head.high', { label });
  if (sev === 'medium') return t(locale, 'head.medium', { label });
  if (sev === 'low') return t(locale, 'head.low');
  return t(locale, 'head.safe');
}

function summaryFor(locale: Locale, score: number, category: ScamCategory | null, signals: Signal[], entityReasons: string[] | null): string {
  const sev = severityFor(score);
  const pos = signals.filter((s) => s.weight > 0);
  const top = pos[0]?.title ?? '';
  if (entityReasons && entityReasons.length > 0) {
    const text = entityReasons.slice(0, 2).map((r) => r.replace(/[.।]$/, '')).join(locale === 'hi' ? '। ' : '. ');
    return text + (locale === 'hi' ? '।' : '.');
  }
  if (sev === 'safe') return t(locale, 'sum.safe');
  if (sev === 'low') return t(locale, 'sum.low', { top });
  const label = t(locale, `cat.${category ?? 'other'}` as MessageKey);
  if (sev === 'medium') return t(locale, 'sum.medium', { label, top });
  const short = t(locale, `short.${category ?? 'other'}` as MessageKey);
  if (pos.length > 1) return t(locale, 'sum.many', { short, n: pos.length, top });
  return t(locale, 'sum.one', { short, top });
}

/** Analyse a message, link, UPI ID, upi:// link, phone number or email address. */
export function analyze(input: string, options: AnalyzeOptions = {}): Verdict {
  const locale: Locale = options.locale === 'hi' ? 'hi' : 'en';
  const raw = typeof input === 'string' ? input : '';
  const text = raw.length > MAX_INPUT ? raw.slice(0, MAX_INPUT) : raw;
  const base = {
    detectedLanguage: 'other' as Verdict['detectedLanguage'],
    locale,
    engineVersion: ENGINE_VERSION,
  };
  if (!text.trim()) {
    return {
      score: 0,
      severity: 'safe',
      category: null,
      categories: [],
      headline: t(locale, 'head.empty'),
      summary: '',
      signals: [],
      entities: emptyEntities(),
      advice: [],
      ...base,
      inputKind: 'message',
    };
  }

  const kind: Kind = options.kind && options.kind !== 'auto' ? options.kind : detectInputKind(text);
  const source: Source | undefined = options.source ?? sourceFromPage(options.pageUrl);
  const sender: SenderInfo = parseSender(options.sender, locale);
  const norm = normalize(text);
  const n = norm.text;
  const detectedLanguage = detectLanguage(n);
  const spanOf = (ns: NSpan): Span => toSpan(text, norm, ns.s, ns.e);
  const whole: Span = { start: 0, end: text.length, text };

  const sigs: SigInput[] = [];
  let entities: Entities = emptyEntities();
  let entityReasons: string[] | null = null;
  let officialBrand: string | null = null;

  if (kind === 'url') {
    const u = analyzeUrl(text.trim(), locale);
    const start = text.indexOf(text.trim());
    u.span = { start, end: start + text.trim().length, text: text.trim() };
    entities.urls.push(u);
    sigs.push(...signalsForUrl(u, locale, [u.span]));
    entityReasons = u.reasons;
    if (u.official && !u.download) officialBrand = (u.reasons[0] ?? '').length ? brandNameFromOfficial(u, locale) : null;
  } else if (kind === 'upi') {
    const trimmed = text.trim();
    const req = /^[a-z]+:\/\//i.test(trimmed) ? parseUpiUri(trimmed, locale) : null;
    if (req) {
      entities.upiRequests.push(req);
      if (req.payee) {
        const f = analyzeUpiId(req.payee, locale);
        entities.upiIds.push(f);
      }
      sigs.push(...signalsForUpiRequest(req, locale, [whole], source === 'qr' || !source));
      entityReasons = req.reasons;
    } else {
      const f = analyzeUpiId(trimmed, locale);
      f.span = whole;
      entities.upiIds.push(f);
      sigs.push(...signalsForUpiId(f, locale, [whole], true));
      entityReasons = f.reasons;
    }
  } else if (kind === 'phone') {
    const p = analyzePhone(text.trim(), locale);
    p.span = whole;
    entities.phones.push(p);
    entityReasons = p.reasons;
    if (p.kind === 'international' && p.risk >= 40) {
      sigs.push({ id: 'phone.intl_risky', category: 'other', weight: 40, title: t(locale, 'sig.phone_intl.t'), detail: (p.reasons[0] ?? '') + '.', spans: [whole] });
    } else if (p.kind === 'international') {
      sigs.push({ id: 'phone.intl', category: 'other', weight: 15, title: t(locale, 'sig.phone_intl.t'), detail: (p.reasons[0] ?? '') + '.', spans: [whole] });
    } else if (p.kind === 'telemarketing_140') {
      sigs.push({ id: 'phone.telemarketing', category: 'other', weight: 15, title: t(locale, 'sig.phone_tm.t'), detail: (p.reasons[0] ?? '') + '.', spans: [whole] });
    } else if (p.kind === 'unknown' && p.risk >= 20) {
      sigs.push({ id: 'phone.invalid', category: 'other', weight: 10, title: t(locale, 'sig.phone_invalid.t'), detail: (p.reasons[0] ?? '') + '.', spans: [whole] });
    }
  } else if (kind === 'email') {
    const email = cleanIdentifier(text).toLowerCase();
    entities.emails.push(email);
    sigs.push(...emailSignals(email, locale, [whole], 'email'));
    const domain = email.slice(email.lastIndexOf('@') + 1);
    const u = analyzeUrl(domain, locale);
    entityReasons = sigs.length ? [sigs[0]?.detail ?? ''] : u.reasons;
  } else {
    // Full message analysis.
    const ex = extractFromNormalized(text, norm, locale);
    entities = ex.entities;
    const flags = computeFlags(n, ex, source, sender, norm);
    // Words inside links, emails and UPI IDs are judged by the entity checks, not the text rules.
    const ruleText = maskSpans(n, ex.urlSpans.concat(ex.emailSpans, ex.upiSpans, ex.upiLinkSpans));
    const rs = getRuleSet();
    const memo = new Map<string, Hit[]>();
    const ctx: EvalContext = {
      cue(name: string): Hit[] {
        let h = memo.get(name);
        if (!h) {
          h = matchCue(rs.cue(name), ruleText);
          memo.set(name, h);
        }
        return h;
      },
      flag(name: string): Hit[] | null {
        return flags.get(name) ?? null;
      },
    };
    const fired: Array<{ def: (typeof rs.rules)[number]['def']; hits: Hit[][] }> = [];
    for (const rule of rs.rules) {
      const hits = evalRule(rule, ctx);
      if (hits) fired.push({ def: rule.def, hits });
    }
    // Exclusive groups: keep the strongest rule per group.
    const best = new Map<string, number>();
    for (const f of fired) {
      if (!f.def.x) continue;
      const cur = best.get(f.def.x);
      if (cur === undefined || f.def.w > cur) best.set(f.def.x, f.def.w);
    }
    const usedX = new Set<string>();
    for (const f of fired) {
      if (f.def.x) {
        if (f.def.w !== best.get(f.def.x) || usedX.has(f.def.x)) continue;
        usedX.add(f.def.x);
      }
      const spans: Span[] = [];
      for (const g of f.hits) for (const h of g.slice(0, 3)) spans.push(toSpan(text, norm, h.s, h.e));
      const pair = locale === 'hi' ? f.def.hi : f.def.en;
      sigs.push({ id: f.def.id, category: f.def.cat, weight: f.def.w, title: pair[0], detail: pair[1], spans });
    }
    // Entity-derived signals.
    sigs.push(...urlSignals(ex, locale, spanOf));
    ex.entities.upiIds.forEach((f, i) => {
      const ns = ex.upiSpans[i];
      sigs.push(...signalsForUpiId(f, locale, ns ? [spanOf(ns)] : []));
    });
    ex.entities.upiRequests.forEach((req, i) => {
      const ns = ex.upiLinkSpans[i];
      sigs.push(...signalsForUpiRequest(req, locale, ns ? [spanOf(ns)] : [], source === 'qr'));
    });
    ex.entities.emails.forEach((email, i) => {
      const ns = ex.emailSpans[i];
      sigs.push(...emailSignals(email, locale, ns ? [spanOf(ns)] : [], 'email'));
    });
  }

  // Sender-derived signals (all kinds).
  if (sender.kind === 'email' && sender.email) {
    sigs.push(...emailSignals(sender.email, locale, [], 'sender', sender.displayName ?? ''));
  }

  // Merge signals that share an id (e.g. two risky links): keep the strongest, union spans.
  const byId = new Map<string, SigInput>();
  for (const s of sigs) {
    const prev = byId.get(s.id);
    if (!prev) byId.set(s.id, { ...s, spans: s.spans.slice() });
    else {
      if (Math.abs(s.weight) > Math.abs(prev.weight)) {
        prev.weight = s.weight;
        prev.title = s.title;
        prev.detail = s.detail;
        prev.category = s.category;
      }
      prev.spans.push(...s.spans);
    }
  }
  const signals: Signal[] = Array.from(byId.values())
    .map((s) => ({ id: s.id, category: s.category, weight: s.weight, title: s.title, detail: s.detail, spans: finalizeSpans(text, s.spans) }))
    .sort((a, b) => b.weight - a.weight);

  const scored = scoreSignals(signals);
  const severity = severityFor(scored.score);
  const telecom = source === 'sms' || source === 'call' || source === 'whatsapp' || entities.phones.length > 0 || sender.kind === 'phone' || sender.kind === 'dlt';
  return {
    score: scored.score,
    severity,
    category: scored.category,
    categories: scored.categories,
    headline: headlineFor(locale, scored.score, scored.category, officialBrand),
    summary: summaryFor(locale, scored.score, scored.category, signals, entityReasons),
    signals,
    entities,
    advice: buildAdvice(scored.category, severity, locale, { telecom }),
    detectedLanguage,
    locale,
    engineVersion: ENGINE_VERSION,
    inputKind: kind,
  };
}

/** Replace the given ranges with spaces (same length, so indices stay valid). */
function maskSpans(text: string, spans: NSpan[]): string {
  if (spans.length === 0) return text;
  let out = '';
  let pos = 0;
  for (const sp of spans.slice().sort((a, b) => a.s - b.s)) {
    if (sp.s < pos) continue;
    out += text.slice(pos, sp.s) + ' '.repeat(sp.e - sp.s);
    pos = sp.e;
  }
  return out + text.slice(pos);
}

const TG_HOSTS = /(?:^|\.)(?:t\.me|telegram\.me|telegram\.org|wa\.me|chat\.whatsapp\.com)$/;

function brandNameFromOfficial(u: UrlFinding, locale: Locale): string | null {
  const host = u.host.replace(/^www\d{0,3}\./, '');
  const b = officialBrandForHost(host);
  if (b) return locale === 'hi' ? b.nameHi : b.name;
  return null;
}

function computeFlags(n: string, ex: Extraction, source: Source | undefined, sender: SenderInfo, norm: Normalized): Map<string, Hit[]> {
  const flags = new Map<string, Hit[]>();
  const e = ex.entities;
  const pick = <T>(list: T[], spans: NSpan[], pred: (x: T) => boolean): Hit[] => {
    const out: Hit[] = [];
    list.forEach((x, i) => {
      const sp = spans[i];
      if (pred(x) && sp) out.push({ s: sp.s, e: sp.e });
    });
    return out;
  };
  const setIf = (name: string, hits: Hit[]): void => {
    if (hits.length > 0) flags.set(name, hits);
  };
  if (e.urls.length > 0) {
    flags.set('link', ex.urlSpans.map((s) => ({ s: s.s, e: s.e })));
    setIf('ulink', pick(e.urls, ex.urlSpans, (u) => !u.official && !u.knownGood));
    if (e.urls.every((u) => (u.official || u.knownGood) && !u.download)) flags.set('olink', []);
    setIf('short', pick(e.urls, ex.urlSpans, (u) => u.shortener === true && !u.official));
    setIf('risky_link', pick(e.urls, ex.urlSpans, (u) => u.risk >= 40));
    setIf('apk', pick(e.urls, ex.urlSpans, (u) => u.download === true));
    setIf('tglink', pick(e.urls, ex.urlSpans, (u) => TG_HOSTS.test(u.host)));
  }
  setIf('mobile', pick(e.phones, ex.phoneSpans, (p) => p.kind === 'mobile'));
  setIf('intl', pick(e.phones, ex.phoneSpans, (p) => p.kind === 'international'));
  setIf('intl_risky', pick(e.phones, ex.phoneSpans, (p) => p.kind === 'international' && isHighRiskCountry(p.country)));
  setIf('phone', ex.phoneSpans.map((s) => ({ s: s.s, e: s.e })));
  setIf('amount', ex.amountSpans.map((s) => ({ s: s.s, e: s.e })));
  setIf('bigamt', pick(e.amounts, ex.amountSpans, (a) => (a.currency === 'INR' ? a.value >= 100000 : a.value >= 1000)));
  setIf('smallamt', pick(e.amounts, ex.amountSpans, (a) => a.currency === 'INR' && a.value <= 500));
  setIf('upi', ex.upiSpans.map((s) => ({ s: s.s, e: s.e })));
  setIf('upilink', ex.upiLinkSpans.map((s) => ({ s: s.s, e: s.e })));
  setIf('email', ex.emailSpans.map((s) => ({ s: s.s, e: s.e })));
  if (source === 'sms') flags.set('sms', []);
  if (source === 'whatsapp') flags.set('wa', []);
  if (source === 'email') flags.set('mail', []);
  if (source === 'call') flags.set('call', []);
  if (source === 'qr') flags.set('qr', []);
  if (source === 'web') flags.set('web', []);
  for (const f of senderFlags(sender)) flags.set(f, []);
  if (norm.mixedScript) flags.set('mixed', []);
  if (norm.bidiOverride) flags.set('bidi', []);
  // Text names a brand, but an unofficial link (that is not already flagged as a lookalike) goes elsewhere.
  if (flags.has('ulink')) {
    const brands = brandMentions(n);
    if (brands.length > 0) {
      const hits = pick(e.urls, ex.urlSpans, (u) => !u.official && !u.knownGood && !u.impersonates);
      setIf('brand_mismatch', hits);
    }
  }
  return flags;
}
