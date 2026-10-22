/**
 * @ruko/engine public contract.
 *
 * The web app (ruko/web) and the browser extension (ruko/extension) are built
 * against these types in parallel. You may ADD optional fields or new exports.
 * Never rename or remove anything here without updating both consumers.
 */

export type Locale = 'en' | 'hi';

export type InputKind = 'auto' | 'message' | 'url' | 'upi' | 'phone' | 'email';

export type Source = 'whatsapp' | 'sms' | 'email' | 'web' | 'qr' | 'call' | 'manual';

export interface AnalyzeOptions {
  /** Language of every human-readable string in the verdict. Default 'en'. */
  locale?: Locale;
  /** What the input is. Default 'auto' (detected). */
  kind?: InputKind;
  /** Where the text came from; some rules only apply to some channels. */
  source?: Source;
  /** Shown sender: phone number, email, display name or SMS header such as 'VM-HDFCBK'. */
  sender?: string;
  /** Page the text appeared on (the extension passes location.href). */
  pageUrl?: string;
}

export type Severity = 'safe' | 'low' | 'medium' | 'high' | 'critical';

export type ScamCategory =
  | 'digital_arrest'
  | 'kyc_update'
  | 'upi_collect'
  | 'qr_receive'
  | 'fake_refund'
  | 'job_task'
  | 'investment'
  | 'lottery_prize'
  | 'loan_app'
  | 'sextortion'
  | 'otp_theft'
  | 'fake_support'
  | 'courier_parcel'
  | 'utility_disconnect'
  | 'reward_points'
  | 'tax_refund'
  | 'govt_scheme'
  | 'malicious_app'
  | 'remote_access'
  | 'impersonation'
  | 'romance'
  | 'sim_swap'
  | 'phishing_link'
  | 'lookalike_domain'
  | 'other';

/** A range in the analysed text, in UTF-16 code units (JS string indices). */
export interface Span {
  start: number;
  end: number;
  text: string;
}

export interface Signal {
  /** Stable rule id, e.g. 'kyc.link_update'. */
  id: string;
  category: ScamCategory;
  /** Contribution 0..100 before combination. Negative values are reassuring signals. */
  weight: number;
  /** Short, plain-language, localized. */
  title: string;
  /** Why it matters, localized, one or two sentences. */
  detail: string;
  /** Where the evidence is in the input text. May be empty. */
  spans: Span[];
}

export interface UrlFinding {
  url: string;
  host: string;
  registrableDomain: string;
  tld: string;
  /** 0..100 */
  risk: number;
  /** Localized short reasons. */
  reasons: string[];
  /** Brand being imitated, if the domain looks like a lookalike or abuses a brand name. */
  impersonates?: string;
  /** True when the host is a known official domain of a brand or the government. */
  official?: boolean;
  shortener?: boolean;
  span?: Span;
  /**
   * How the link imitates `impersonates` (added in 0.1.0). Domain-level kinds
   * (everything except 'path') mean the site itself is a fake: the extension's
   * lookalike interstitial should use these.
   */
  impersonationKind?: 'homoglyph' | 'typo' | 'tld_swap' | 'brand_in_domain' | 'subdomain' | 'free_hosting' | 'path' | 'userinfo';
  /** The imitated brand's real domain, e.g. 'onlinesbi.sbi' (for a "go to the real site" action). */
  officialDomain?: string;
  /** A well-known site (news, reference, big services) that is not a verified brand domain. */
  knownGood?: boolean;
  /** The link downloads an app or program file (.apk, .exe ...). */
  download?: boolean;
}

export interface UpiFinding {
  vpa: string;
  handle: string;
  /** App or bank behind the handle, e.g. 'PhonePe', 'Google Pay (HDFC)'. */
  app?: string;
  risk: number;
  reasons: string[];
  span?: Span;
}

/** A parsed `upi://pay?...` link or UPI QR payload. */
export interface UpiPaymentRequest {
  payee: string;
  payeeName?: string;
  amount?: number;
  note?: string;
  currency?: string;
  risk: number;
  reasons: string[];
}

export interface PhoneFinding {
  raw: string;
  e164: string;
  /** ISO 3166-1 alpha-2 country, e.g. 'IN', 'PK'. */
  country?: string;
  kind?: 'mobile' | 'landline' | 'telemarketing_140' | 'service_1600' | 'tollfree' | 'international' | 'unknown';
  risk: number;
  reasons: string[];
  span?: Span;
}

export interface AmountFinding {
  value: number;
  currency: 'INR' | 'USD' | 'OTHER';
  text: string;
  span: Span;
}

export interface Entities {
  urls: UrlFinding[];
  upiIds: UpiFinding[];
  upiRequests: UpiPaymentRequest[];
  phones: PhoneFinding[];
  emails: string[];
  amounts: AmountFinding[];
}

export interface Advice {
  id: string;
  title: string;
  detail: string;
  /** e.g. { label: 'Call 1930', href: 'tel:1930' } or https://cybercrime.gov.in */
  action?: { label: string; href: string };
  urgent?: boolean;
}

export interface Verdict {
  /** Combined risk 0..100. */
  score: number;
  severity: Severity;
  category: ScamCategory | null;
  /** Sorted by score, descending; only categories with score > 0. */
  categories: Array<{ id: ScamCategory; score: number }>;
  /** Localized, e.g. "Very likely a 'digital arrest' scam". */
  headline: string;
  /** Localized, one to three plain sentences. */
  summary: string;
  /** Sorted by weight, descending. */
  signals: Signal[];
  entities: Entities;
  advice: Advice[];
  detectedLanguage: 'en' | 'hi' | 'hinglish' | 'other';
  locale: Locale;
  engineVersion: string;
  /** What the input was treated as (resolved from options.kind or auto-detected). Added in 0.1.0. */
  inputKind?: Exclude<InputKind, 'auto'>;
}

export interface CategoryInfo {
  id: ScamCategory;
  name: string;
  nameHi: string;
  short: string;
  shortHi: string;
  howItWorks: string[];
  howItWorksHi: string[];
  redFlags: string[];
  redFlagsHi: string[];
  whatToDo: string[];
  whatToDoHi: string[];
  /** Typical severity of this scam type. */
  severity: Severity;
}

export type IdentifierKind = 'upi' | 'phone' | 'url' | 'domain' | 'email';
