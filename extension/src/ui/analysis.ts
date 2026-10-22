/** Running the engine directly in extension pages (popup, side panel). */
import { analyze, ENGINE_VERSION, type InputKind, type Locale, type Verdict } from '@ruko/engine';
import { textKey } from '../shared/hash';
import type { HistoryEntry, HistorySource } from '../shared/history';
import { send } from '../shared/messages';

export interface CheckInput {
  text: string;
  source?: HistorySource;
  kind?: InputKind;
  sender?: string;
  pageUrl?: string;
}

export function runCheck(input: CheckInput, locale: Locale): Verdict {
  const source = input.source === 'context' || !input.source ? 'manual' : input.source;
  return analyze(input.text.slice(0, 6000), {
    locale,
    kind: input.kind ?? 'auto',
    source,
    sender: input.sender,
    pageUrl: input.pageUrl,
  });
}

export function isStubEngine(): boolean {
  return ENGINE_VERSION.includes('stub');
}

export function historyId(input: CheckInput): string {
  return textKey(input.source ?? 'manual', input.sender, input.text);
}

/** Saves a check to history through the background (the single writer). */
export function recordCheck(input: CheckInput, verdict: Verdict, warned = false): void {
  let host: string | undefined;
  try {
    host = input.pageUrl ? new URL(input.pageUrl).hostname : undefined;
  } catch {
    host = undefined;
  }
  const entry: HistoryEntry = {
    id: historyId(input),
    at: Date.now(),
    source: input.source ?? 'manual',
    host,
    sender: input.sender,
    kind: input.kind,
    text: input.text,
    score: verdict.score,
    severity: verdict.severity,
    category: verdict.category,
    headline: verdict.headline,
    warned,
  };
  send<'record'>({ type: 'record', entry }).catch(() => undefined);
}
