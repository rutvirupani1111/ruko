/**
 * URL extraction (with and without scheme, `www.`, bare domains) and
 * per-link risk analysis: official brand domains, lookalikes, free hosting,
 * shorteners, raw IPs, userinfo tricks, risky endings and app downloads.
 */
import type { Locale, UrlFinding } from '../types';
import { t } from '../i18n';
import { cleanIdentifier } from '../normalize';
import { parseUrl, type ParsedUrl } from './parseurl';
import { hostToAscii, hostToUnicode } from '../domains/punycode';
import { splitHost } from '../domains/psl';
import { isKnownGoodHost, isShortenerHost, isUserContentHost, officialBrandForHost, brandTokenInPath } from '../domains/brands';
import { findImpersonation, type Impersonation, type ImpersonationKind } from '../domains/lookalike';

const PUBLIC_KIND: Record<ImpersonationKind, NonNullable<UrlFinding['impersonationKind']>> = {
  homoglyph: 'homoglyph',
  typo: 'typo',
  tld_swap: 'tld_swap',
  token: 'brand_in_domain',
  subdomain: 'subdomain',
  hosting: 'free_hosting',
  path: 'path',
  userinfo: 'userinfo',
};
import { combine } from '../util';

/** Official short-link domains of brands (still official, but flagged as short links). */
const OFFICIAL_SHORT = /* @__PURE__ */ new Set(['amzn.in', 'amzn.to', 'a.co', 'fkrt.it', 'fkrt.co', 'fkrt.cc', 'myntr.it', 'swig.gy', 'zoma.to', 'hdfcbk.io', 'phon.pe', 'paytm.me', 'g.co', 'goo.gl']);

export { parseUrl };
export type { ParsedUrl };

const VERY_RISKY_TLDS = /* @__PURE__ */ new Set(
  /* @__PURE__ */ 'tk ml ga cf gq zip mov top xyz icu buzz cyou sbs cfd bond rest monster quest click link lol country kim loan win bid racing date review party trade science accountant download men stream gdn work cam su pw ws ink support help'.split(' '),
);
const MILD_RISKY_TLDS = /* @__PURE__ */ new Set(
  /* @__PURE__ */ 'online site website live life shop store club vip fun space tech today world info biz cc ru cn asia mobi best digital network services center email group social one plus run games bet cash money finance loans credit gift gifts lat rocks host press xin top10 fit uno'.split(' '),
);

const HOST_WORDS = [
  'kyc', 'ekyc', 'rekyc', 'verify', 'verification', 'login', 'signin', 'secure', 'unblock', 'reward', 'rewards',
  'refund', 'bonus', 'claim', 'prize', 'lottery', 'cashback', 'helpdesk', 'redeem', 'challan', 'kbc', 'winner',
  'lucky', 'otp', 'update', 'customercare', 'support', 'wallet', 'giftcard', 'freegift', 'subsidy', 'yojana',
];
const SHORT_HOST_WORDS = /* @__PURE__ */ new Set(['kyc', 'otp', 'kbc']);

function hostWords(body: string): string[] {
  const found: string[] = [];
  const parts = body.split(/[.\-_\d]+/).filter(Boolean);
  for (const w of HOST_WORDS) {
    for (const p of parts) {
      const hit = SHORT_HOST_WORDS.has(w)
        ? p === w || ((p.startsWith(w) || p.endsWith(w)) && p.length - w.length >= 3)
        : p.indexOf(w) >= 0;
      if (hit) {
        if (found.indexOf(w) < 0) found.push(w);
        break;
      }
    }
  }
  return found;
}

const LOGIN_WORDS = /(?:login|log-in|signin|sign-in|verify|password|passwd|otp|kyc|netbanking|banking|account|card|cvv|upi|pin|payment|update)/;
const APP_FILE = /\.(apk|xapk|apks|aab)(?:$|[?#/&=])/i;
const EXE_FILE = /\.(exe|msi|scr|bat|cmd|vbs|jar|ps1|dmg|pkg)(?:$|[?#/&=])/i;

/** Analyse one link. `url` may be a full URL or a bare domain like `sbi-kyc.in`. */
export function analyzeUrl(url: string, locale: Locale = 'en'): UrlFinding {
  const clean = cleanIdentifier(url);
  const p = parseUrl(clean);
  if (!p) {
    return { url: clean, host: '', registrableDomain: '', tld: '', risk: 30, reasons: [t(locale, 'url.invalid')] };
  }
  if (p.scheme === 'data' || p.scheme === 'javascript' || p.scheme === 'vbscript') {
    return {
      url: clean,
      host: '',
      registrableDomain: '',
      tld: '',
      risk: p.scheme === 'data' ? 85 : 90,
      reasons: [t(locale, p.scheme === 'data' ? 'url.data' : 'url.script')],
    };
  }
  const asciiHost = hostToAscii(p.host);
  const uhost = hostToUnicode(p.host);
  const bareHost = asciiHost.replace(/^www\d{0,3}\./, '');
  const parts = splitHost(asciiHost);
  const base: UrlFinding = {
    url: clean,
    host: asciiHost,
    registrableDomain: parts.registrable,
    tld: parts.tld,
    risk: 0,
    reasons: [],
  };
  const fullPath = p.path + (p.query ? '?' + p.query : '');
  const appFile = APP_FILE.exec(fullPath);
  const exeFile = appFile ? null : EXE_FILE.exec(fullPath);
  const fileRisk = (): void => {
    if (appFile) {
      base.reasons.push(t(locale, 'url.apk'));
    } else if (exeFile) {
      base.reasons.push(t(locale, 'url.exe', { ext: (exeFile[1] as string).toLowerCase() }));
    }
  };

  // Official domains first (a user-content platform never counts as proof).
  const userContent = isUserContentHost(bareHost);
  if (!p.isIp && !userContent && !p.userinfo) {
    const brand = officialBrandForHost(bareHost);
    let reason = '';
    if (brand) reason = t(locale, 'url.official', { brand: locale === 'hi' ? brand.nameHi : brand.name });
    else if (parts.suffix === 'gov.in' || parts.suffix === 'nic.in' || parts.suffix === 'mil.in') reason = t(locale, 'url.gov');
    else if (parts.suffix === 'bank.in' || parts.suffix === 'fin.in') reason = t(locale, 'url.bankin');
    else if (parts.tld === 'sbi' && parts.label !== '') reason = t(locale, 'url.official', { brand: 'SBI' });
    if (reason) {
      base.official = true;
      base.reasons.push(reason);
      if (appFile || exeFile) {
        fileRisk();
        base.download = true;
        base.risk = 40;
      }
      if (OFFICIAL_SHORT.has(bareHost)) base.shortener = true;
      return base;
    }
    if (isKnownGoodHost(bareHost) && !appFile && !exeFile) {
      base.knownGood = true;
      base.reasons.push(t(locale, 'url.known'));
      return base;
    }
  }

  const risks: number[] = [];
  const add = (risk: number, reason: string): void => {
    risks.push(risk);
    base.reasons.push(reason);
  };

  if (appFile) add(85, t(locale, 'url.apk'));
  else if (exeFile) add(80, t(locale, 'url.exe', { ext: (exeFile[1] as string).toLowerCase() }));
  if (appFile || exeFile) base.download = true;

  if (p.isIp) add(60, t(locale, 'url.ip'));

  const uparts = splitHost(uhost.replace(/^www\d{0,3}\./, ''));
  let imp: Impersonation | null = null;
  if (userContent || p.isIp) {
    const pb = brandTokenInPath(fullPath);
    if (pb) imp = { brand: pb.brand, kind: 'path', target: pb.brand.domains[0] ?? '' };
  } else {
    imp = findImpersonation(uhost.replace(/^www\d{0,3}\./, ''), uparts, fullPath, p.userinfo);
  }
  if (p.userinfo && (!imp || imp.kind !== 'userinfo')) add(55, t(locale, 'url.userinfo', { host: asciiHost }));
  if (imp) {
    const brandName = locale === 'hi' ? imp.brand.nameHi : imp.brand.name;
    base.impersonates = brandName;
    base.impersonationKind = PUBLIC_KIND[imp.kind];
    if (imp.target) base.officialDomain = imp.target;
    const vars = { brand: brandName, target: imp.target, reg: parts.registrable, suffix: parts.suffix, host: asciiHost };
    switch (imp.kind) {
      case 'homoglyph':
        add(92, t(locale, 'url.homoglyph', vars));
        break;
      case 'typo':
        add(82, t(locale, 'url.typo', vars));
        break;
      case 'tld_swap':
        add(78, t(locale, 'url.tld_swap', vars));
        break;
      case 'subdomain':
        add(85, t(locale, 'url.subdomain', vars));
        break;
      case 'hosting':
        add(80, t(locale, 'url.hosting_brand', vars));
        break;
      case 'userinfo':
        add(85, t(locale, 'url.userinfo', vars));
        break;
      case 'path':
        add(userContent || parts.hosting || p.isIp ? 70 : 40, t(locale, 'url.path_brand', vars));
        break;
      default:
        add(72, t(locale, 'url.token', vars));
        break;
    }
  }

  if (/[^\x00-\x7f]/.test(uhost) || asciiHost.indexOf('xn--') >= 0) {
    if (!imp || imp.kind !== 'homoglyph') add(40, t(locale, 'url.punycode'));
  }

  if (userContent) add(12, t(locale, 'url.user_content'));
  else if (parts.hosting && (!imp || imp.kind !== 'hosting')) add(30, t(locale, 'url.hosting', { suffix: parts.suffix }));

  if (isShortenerHost(bareHost)) {
    base.shortener = true;
    add(25, t(locale, 'url.shortener'));
  }

  if (!p.isIp) {
    if (VERY_RISKY_TLDS.has(parts.tld)) add(35, t(locale, 'url.risky_tld', { tld: parts.tld }));
    else if (MILD_RISKY_TLDS.has(parts.tld)) add(15, t(locale, 'url.risky_tld', { tld: parts.tld }));
    const body = uparts.subdomain ? uparts.subdomain + '.' + uparts.label : uparts.label;
    const words = hostWords(body);
    if (words.length > 0) add(words.length > 1 ? 30 : 20, t(locale, 'url.words', { words: words.slice(0, 3).join(', ') }));
    const hyphens = (asciiHost.match(/-/g) || []).length;
    if (asciiHost.length > 40 || hyphens >= 4 || asciiHost.split('.').length >= 6) add(10, t(locale, 'url.complex'));
  }

  if (p.scheme === 'http' && LOGIN_WORDS.test((asciiHost + fullPath).toLowerCase())) add(25, t(locale, 'url.http_login'));
  if (p.port && p.port !== '80' && p.port !== '443') add(15, t(locale, 'url.port'));

  if (risks.length === 0) {
    risks.push(5);
    base.reasons.push(t(locale, 'url.unknown'));
  }
  base.risk = Math.min(99, Math.round(combine(risks)));
  return base;
}

// ---------------------------------------------------------------------------
// Extraction

/** TLDs accepted for bare domains (no scheme). Two-letter codes that are common English words are left out. */
const BARE_TLDS =
  'com net org in co io info biz xyz top online site website live life shop store club vip icu buzz click link tk ml ' +
  'ga cf gq pw cc ws su ru cn ly app dev page cloud tech space fun ink work today news blog pro asia sbs cfd cyou ' +
  'bond rest monster quest lol mobi tv uk ae pk bd np lk sg vn kh ke ng gov edu bank sbi network center services ' +
  'support help care delivery express finance money loan loans credit cash win bid date review party trade science ' +
  'download stream men gdn mom uno fit zip mov digital email group solutions systems company agency media social team ' +
  'zone one plus run gold bet games game cam rocks shopping deals sale gift gifts global ltd llc kim country racing ' +
  'accountant host press wiki best lat guru red blue pink black me';

let BARE_RE: RegExp | null = null;
const SCHEME_RE = /(?:(?:https?|hxxps?|ftp):\/\/|www\d{0,3}\.)[^\s<>"'`]+/g;
const SPECIAL_RE = /(?:data:[a-z]+\/[a-z0-9.+-]+[;,][^\s<>"']*|javascript:[^\s<>"']+)/g;
const IP_PATH_RE = /(?:\d{1,3}\.){3}\d{1,3}(?::\d{2,5})?\/[^\s<>"']*/g;

function bareRe(): RegExp {
  if (!BARE_RE) {
    const L = 'a-z0-9\\u00a1-\\u0963\\u0966-\\uffff';
    BARE_RE = new RegExp(
      `(?:[${L}](?:[${L}-]{0,61}[${L}])?\\.)+(?:${BARE_TLDS.split(' ').sort((a, b) => b.length - a.length).join('|')}|भारत)(?![${L}-])(?::\\d{2,5})?(?:[/?#][^\\s<>"'\`]*)?`,
      'g',
    );
  }
  return BARE_RE;
}

export interface RawUrl {
  s: number;
  e: number;
  text: string;
}

const TRAIL = /[.,;:!?'"*>\]}]+$/;

function trimUrl(text: string): string {
  let out = text;
  for (let guard = 0; guard < 4; guard++) {
    const before = out;
    out = out.replace(TRAIL, '');
    if (out.endsWith(')') && out.indexOf('(') < 0) out = out.slice(0, -1);
    if (out === before) break;
  }
  return out;
}

const URL_PREFIX_CHARS = /[a-z0-9@._\-/:\\]/;

/** Find links in normalised text. Spans are in normalised coordinates. */
export function findUrls(n: string): RawUrl[] {
  const out: RawUrl[] = [];
  const overlaps = (s: number, e: number): boolean => out.some((u) => s < u.e && e > u.s);
  const push = (s: number, raw: string, checkPrefix: boolean): void => {
    const text = trimUrl(raw);
    if (text.length < 4) return;
    const e = s + text.length;
    if (overlaps(s, e)) return;
    if (checkPrefix && s > 0) {
      const prev = n.charAt(s - 1);
      if (URL_PREFIX_CHARS.test(prev)) return;
    }
    out.push({ s, e, text });
  };
  let m: RegExpExecArray | null;
  SCHEME_RE.lastIndex = 0;
  while ((m = SCHEME_RE.exec(n)) !== null) push(m.index, m[0], false);
  SPECIAL_RE.lastIndex = 0;
  while ((m = SPECIAL_RE.exec(n)) !== null) push(m.index, m[0], false);
  IP_PATH_RE.lastIndex = 0;
  while ((m = IP_PATH_RE.exec(n)) !== null) push(m.index, m[0], true);
  const re = bareRe();
  re.lastIndex = 0;
  while ((m = re.exec(n)) !== null) {
    const s = m.index;
    if (s > 0 && URL_PREFIX_CHARS.test(n.charAt(s - 1))) {
      continue;
    }
    push(s, m[0], false);
  }
  out.sort((a, b) => a.s - b.s);
  return out;
}
