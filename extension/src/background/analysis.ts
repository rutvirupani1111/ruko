/**
 * All engine calls made on behalf of content scripts happen here, in the background,
 * so the pages people use never parse or run the engine. Results are cached.
 */
import { analyze, analyzeUrl, parseUpiUri, severityFor } from '@ruko/engine';
import type { Locale, UrlFinding, Verdict } from '@ruko/engine';
import { textKey } from '../shared/hash';
import { Lru } from '../shared/lru';
import { decidePage } from '../shared/lookalike';
import type { AnalyzeItem, LinkVerdict, PageCheck } from '../shared/messages';
import type { WarnAt } from '../shared/severity';
import { hostOf, isHttpUrl, isUpiHref, unwrapRedirect } from '../shared/url';

const MAX_TEXT = 6000;
const verdictCache = new Lru<string, Verdict>(1000);
const urlCache = new Lru<string, UrlFinding>(1000);

export function analyzeItems(items: AnalyzeItem[], locale: Locale): Record<string, Verdict> {
  const results: Record<string, Verdict> = {};
  for (const item of items.slice(0, 50)) {
    if (!item || typeof item.key !== 'string' || typeof item.text !== 'string') continue;
    const cacheKey = textKey(locale, item.source, item.sender, item.kind, item.pageUrl ? hostOf(item.pageUrl) : '', item.text);
    let verdict = verdictCache.get(cacheKey);
    if (!verdict) {
      verdict = analyze(item.text.slice(0, MAX_TEXT), {
        locale,
        source: item.source,
        sender: item.sender,
        pageUrl: item.pageUrl,
        kind: item.kind ?? 'auto',
      });
      verdictCache.set(cacheKey, verdict);
    }
    results[item.key] = verdict;
  }
  return results;
}

function findingFor(url: string, locale: Locale): UrlFinding {
  const key = `${locale}|${url}`;
  let finding = urlCache.get(key);
  if (!finding) {
    finding = analyzeUrl(url, locale);
    urlCache.set(key, finding);
  }
  return finding;
}

/** Lookalike check for the address of the page itself. Hash fragments are ignored. */
export function checkPage(url: string, locale: Locale, warnAt: WarnAt): PageCheck {
  const clean = url.split('#')[0] ?? url;
  if (!isHttpUrl(clean)) {
    return { warn: false, host: hostOf(clean), risk: 0, severity: 'safe', reasons: [] };
  }
  const finding = findingFor(clean, locale);
  const check = decidePage(finding, severityFor(finding.risk), warnAt);
  return { ...check, host: check.host || hostOf(clean) };
}

/** Everything the hover tooltip shows for a link. */
export function checkLink(rawUrl: string, locale: Locale): LinkVerdict {
  const url = unwrapRedirect(rawUrl.trim());
  if (isUpiHref(url)) {
    const request = parseUpiUri(url, locale);
    const risk = request?.risk ?? 50;
    return {
      url,
      host: '',
      kind: 'upi',
      risk,
      severity: severityFor(risk),
      official: false,
      shortener: false,
      reasons: request?.reasons.slice(0, 3) ?? [],
      upi: request,
    };
  }
  if (!isHttpUrl(url)) {
    return { url, host: '', kind: 'other', risk: 0, severity: 'safe', official: false, shortener: false, reasons: [] };
  }
  const finding = findingFor(url.split('#')[0] ?? url, locale);
  return {
    url,
    host: finding.host || hostOf(url),
    kind: 'web',
    risk: finding.risk,
    severity: severityFor(finding.risk),
    brand: finding.official ? undefined : finding.impersonates,
    official: !!finding.official,
    shortener: !!finding.shortener,
    knownGood: !!finding.knownGood,
    download: !!finding.download,
    reasons: finding.reasons.slice(0, 3),
  };
}

export function checkUpi(uri: string, locale: Locale) {
  const request = parseUpiUri(uri.trim(), locale);
  return { request, severity: severityFor(request?.risk ?? 50) };
}

/** For tests and the "clear cache" path when the engine version changes. */
export function clearAnalysisCaches(): void {
  verdictCache.clear();
  urlCache.clear();
}
