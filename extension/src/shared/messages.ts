/**
 * Typed messages between content scripts / extension pages and the background.
 * The background is the only place that runs the engine for content scripts, so
 * pages that users visit never parse the engine and analysis never runs on the
 * page's main thread.
 */
import { browser } from 'wxt/browser';
import type {
  IdentifierKind,
  InputKind,
  Locale,
  Severity,
  Source,
  UpiPaymentRequest,
  Verdict,
} from '@ruko/engine';
import type { HistoryEntry, HistorySource } from './history';
import type { WarnAt } from './severity';

export interface AnalyzeItem {
  /** Caller's cache key (text hash). Echoed back in the result map. */
  key: string;
  text: string;
  source: Source;
  sender?: string;
  pageUrl?: string;
  kind?: InputKind;
}

/** Everything a link tooltip needs, computed by the background from the engine. */
export interface LinkVerdict {
  /** Destination after unwrapping redirect shims (Gmail's google.com/url?q=...). */
  url: string;
  host: string;
  kind: 'web' | 'upi' | 'other';
  risk: number;
  severity: Severity;
  /** Brand being imitated (when risky). */
  brand?: string;
  official: boolean;
  shortener: boolean;
  /** A well-known site that is not a verified brand domain (engine `knownGood`). */
  knownGood?: boolean;
  /** The link downloads an app or program file. */
  download?: boolean;
  reasons: string[];
  upi?: UpiPaymentRequest | null;
}

/** Result of checking the address of the page the user is on. */
export interface PageCheck {
  warn: boolean;
  host: string;
  brand?: string;
  /** The imitated brand's real domain, e.g. "onlinesbi.sbi", validated as a bare hostname. */
  officialDomain?: string;
  risk: number;
  severity: Severity;
  reasons: string[];
}

export type CountSource = 'whatsapp' | 'gmail' | 'page';

/** Text handed to the side panel by the context menu, popup or an in-page "See full analysis". */
export interface PendingCheck {
  text: string;
  source: HistorySource;
  kind?: InputKind;
  sender?: string;
  pageUrl?: string;
  at: number;
}

export interface CommunityQuery {
  kind: IdentifierKind;
  value: string;
}

export interface CommunityResult {
  kind: IdentifierKind;
  value: string;
  reports: number;
  categories: string[];
  lastReportedAt?: string;
}

export type RukoRequest =
  | { type: 'analyze'; items: AnalyzeItem[]; locale: Locale }
  | { type: 'check-page'; url: string; locale: Locale; warnAt: WarnAt }
  | { type: 'check-link'; url: string; locale: Locale }
  | { type: 'check-upi'; uri: string; locale: Locale }
  | { type: 'set-count'; source: CountSource; count: number }
  | { type: 'record'; entry: HistoryEntry }
  | { type: 'allow-site'; host: string }
  | { type: 'leave-site'; host: string; brand?: string }
  | { type: 'open-panel'; check?: Omit<PendingCheck, 'at'> }
  | { type: 'community'; queries: CommunityQuery[] }
  | { type: 'tab-count'; tabId: number };

export interface RukoResponseMap {
  analyze: { results: Record<string, Verdict> };
  'check-page': PageCheck;
  'check-link': LinkVerdict;
  'check-upi': { request: UpiPaymentRequest | null; severity: Severity };
  'set-count': { total: number };
  record: { ok: boolean };
  'allow-site': { ok: boolean };
  'leave-site': { ok: boolean };
  'open-panel': { opened: 'panel' | 'tab' | 'none' };
  community: { results: CommunityResult[]; enabled: boolean };
  'tab-count': { total: number };
}

export type RukoRequestType = RukoRequest['type'];
export type RequestOf<T extends RukoRequestType> = Extract<RukoRequest, { type: T }>;
export type ResponseOf<T extends RukoRequestType> = RukoResponseMap[T];

const TYPES: ReadonlySet<string> = new Set<RukoRequestType>([
  'analyze',
  'check-page',
  'check-link',
  'check-upi',
  'set-count',
  'record',
  'allow-site',
  'leave-site',
  'open-panel',
  'community',
  'tab-count',
]);

export function isRukoRequest(value: unknown): value is RukoRequest {
  return !!value && typeof value === 'object' && TYPES.has((value as { type?: unknown }).type as string);
}

/** Thrown when the extension was reloaded or updated under a still-open page. */
export class ExtensionGoneError extends Error {
  constructor() {
    super('Ruko Shield was updated or disabled. Reload the page to turn protection back on.');
  }
}

export function isExtensionAlive(): boolean {
  try {
    return !!browser.runtime?.id;
  } catch {
    return false;
  }
}

/** Sends a request to the background and returns its typed response. */
export async function send<T extends RukoRequestType>(request: RequestOf<T>): Promise<ResponseOf<T>> {
  if (!isExtensionAlive()) throw new ExtensionGoneError();
  const response = (await browser.runtime.sendMessage(request)) as ResponseOf<T> | { error: string } | undefined;
  if (response == null) throw new Error(`No response for ${request.type}`);
  if (typeof response === 'object' && 'error' in response && typeof response.error === 'string') {
    throw new Error(response.error);
  }
  return response as ResponseOf<T>;
}
