import type { Entities, IdentifierKind, ScamCategory } from '@ruko/engine';
import { config } from '@/config';
import { loadEngine } from './engine';
import { PREF, readPref, writePref } from './storage';

/**
 * Community reports with k-anonymity: we hash an identifier on the device,
 * send only the first 5 hex characters, and match the rest locally. The
 * server never learns which UPI ID, number or link you checked.
 */

export const POW_DIFFICULTY = 18;
/** Show "reported by N people" only from this many reports. */
export const COMMUNITY_THRESHOLD = 3;
export const PREFIX_LENGTH = 5;

export interface RangeEntry {
  suffix: string;
  reports: number;
  categories: string[];
  lastReportedAt: string;
}

export interface CommunityHit {
  reports: number;
  categories: string[];
  lastReportedAt: string;
}

export interface Reportable {
  kind: IdentifierKind;
  value: string;
  /** Text shown to the user. */
  display: string;
}

export function communityLookupsEnabled(): boolean {
  return config.apiBase !== null && readPref(PREF.communityLookups) !== 'off';
}

export function setCommunityLookups(on: boolean): void {
  writePref(PREF.communityLookups, on ? null : 'off');
}

const rangeCache = new Map<string, Promise<RangeEntry[]>>();

export async function fetchRange(prefix: string, signal?: AbortSignal): Promise<RangeEntry[]> {
  if (!config.apiBase) return [];
  const key = prefix.toLowerCase();
  let pending = rangeCache.get(key);
  if (!pending) {
    pending = fetch(`${config.apiBase}/v1/range/${key}`, { signal, headers: { accept: 'application/json' } })
      .then(async (res) => {
        if (!res.ok) throw new Error(`range ${res.status}`);
        const body = (await res.json()) as { entries?: RangeEntry[] };
        return Array.isArray(body.entries) ? body.entries : [];
      })
      .catch((err) => {
        rangeCache.delete(key);
        throw err;
      });
    rangeCache.set(key, pending);
  }
  return pending;
}

/** Look up one identifier privately. Returns null when nobody reported it. */
export async function lookupIdentifier(kind: IdentifierKind, value: string, signal?: AbortSignal): Promise<CommunityHit | null> {
  const { identifierHash } = await loadEngine();
  const hash = await identifierHash(kind, value);
  const entries = await fetchRange(hash.slice(0, PREFIX_LENGTH), signal);
  const suffix = hash.slice(PREFIX_LENGTH);
  const hit = entries.find((e) => e.suffix === suffix);
  return hit ? { reports: hit.reports, categories: hit.categories, lastReportedAt: hit.lastReportedAt } : null;
}

export function communityKey(kind: IdentifierKind, value: string): string {
  return `${kind}:${value.toLowerCase()}`;
}

/** Identifiers in a verdict that can be looked up or reported. Official domains are skipped. */
export function reportablesFrom(entities: Entities): Reportable[] {
  const out: Reportable[] = [];
  const seen = new Set<string>();
  const add = (r: Reportable) => {
    const key = communityKey(r.kind, r.value);
    if (seen.has(key) || !r.value) return;
    seen.add(key);
    out.push(r);
  };
  for (const u of entities.upiIds) add({ kind: 'upi', value: u.vpa, display: u.vpa });
  for (const r of entities.upiRequests) add({ kind: 'upi', value: r.payee, display: r.payee });
  for (const p of entities.phones) add({ kind: 'phone', value: p.e164 || p.raw, display: p.raw });
  for (const u of entities.urls) {
    if (u.official) continue;
    if (u.shortener) add({ kind: 'url', value: u.url, display: u.url });
    else if (u.registrableDomain) add({ kind: 'domain', value: u.registrableDomain, display: u.registrableDomain });
  }
  for (const e of entities.emails) add({ kind: 'email', value: e, display: e });
  return out;
}

export type ReportError = 'disabled' | 'invalid' | 'rate_limited' | 'duplicate' | 'network' | 'server' | 'pow_failed';

export interface ReportResult {
  ok: boolean;
  error?: ReportError;
  reports?: number;
  hash?: string;
}

/** Solve the proof-of-work in a Web Worker. */
export function solveInWorker(prefix: string, difficulty: number, onProgress?: (tries: number) => void, signal?: AbortSignal): Promise<string> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./pow.worker.ts', import.meta.url), { type: 'module' });
    const cleanup = () => worker.terminate();
    signal?.addEventListener('abort', () => {
      cleanup();
      reject(new DOMException('Aborted', 'AbortError'));
    });
    worker.onmessage = (event: MessageEvent<{ type: 'progress' | 'done'; tries?: number; nonce?: number | null }>) => {
      if (event.data.type === 'progress') {
        onProgress?.(event.data.tries ?? 0);
        return;
      }
      cleanup();
      if (typeof event.data.nonce === 'number') resolve(String(event.data.nonce));
      else reject(new Error('pow_failed'));
    };
    worker.onerror = (err) => {
      cleanup();
      reject(err);
    };
    worker.postMessage({ prefix, difficulty });
  });
}

export async function submitReport(
  kind: IdentifierKind,
  value: string,
  category: ScamCategory,
  onProgress?: (stage: 'hashing' | 'working' | 'sending', tries?: number) => void,
  signal?: AbortSignal,
): Promise<ReportResult> {
  if (!config.apiBase) return { ok: false, error: 'disabled' };
  onProgress?.('hashing');
  const { identifierHash } = await loadEngine();
  const hash = await identifierHash(kind, value);
  const issuedAt = Date.now();
  onProgress?.('working', 0);
  let nonce: string;
  try {
    nonce = await solveInWorker(`${hash}:${issuedAt}:`, POW_DIFFICULTY, (tries) => onProgress?.('working', tries), signal);
  } catch (err) {
    if ((err as DOMException)?.name === 'AbortError') throw err;
    return { ok: false, error: 'pow_failed' };
  }
  onProgress?.('sending');
  try {
    const res = await fetch(`${config.apiBase}/v1/reports`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ hash, kind, category, pow: { nonce, issuedAt, difficulty: POW_DIFFICULTY } }),
      signal,
    });
    if (res.ok) {
      const body = (await res.json().catch(() => ({}))) as { reports?: number };
      rangeCache.delete(hash.slice(0, PREFIX_LENGTH));
      return { ok: true, reports: body.reports, hash };
    }
    if (res.status === 429) return { ok: false, error: 'rate_limited' };
    if (res.status === 409) return { ok: false, error: 'duplicate' };
    if (res.status >= 400 && res.status < 500) return { ok: false, error: 'invalid' };
    return { ok: false, error: 'server' };
  } catch (err) {
    if ((err as DOMException)?.name === 'AbortError') throw err;
    return { ok: false, error: 'network' };
  }
}
