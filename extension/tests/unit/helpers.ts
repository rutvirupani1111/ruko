import type { Severity, Verdict } from '@ruko/engine';

/** A complete Verdict for tests, independent of the real engine's rules. */
export function fakeVerdict(overrides: Partial<Verdict> = {}): Verdict {
  const severity: Severity = overrides.severity ?? 'safe';
  return {
    score: 0,
    severity,
    category: null,
    categories: [],
    headline: 'No warning signs found',
    summary: '',
    signals: [],
    entities: { urls: [], upiIds: [], upiRequests: [], phones: [], emails: [], amounts: [] },
    advice: [],
    detectedLanguage: 'en',
    locale: 'en',
    engineVersion: 'test',
    ...overrides,
  };
}

export const SCAM_VERDICT = fakeVerdict({
  score: 88,
  severity: 'critical',
  category: 'kyc_update',
  categories: [{ id: 'kyc_update', score: 88 }],
  headline: 'Very likely a KYC update scam',
  summary: 'Banks never ask you to update KYC through a link in a message.',
  signals: [
    {
      id: 'kyc.link_update',
      category: 'kyc_update',
      weight: 60,
      title: 'Asks you to update KYC through a link',
      detail: 'Real banks ask you to visit a branch or use the official app.',
      spans: [],
    },
  ],
  advice: [
    {
      id: 'call-1930',
      title: 'Lost money? Call 1930 now',
      detail: 'The national cyber fraud helpline can freeze money quickly.',
      action: { label: 'Call 1930', href: 'tel:1930' },
      urgent: true,
    },
  ],
});

export const MEDIUM_VERDICT = fakeVerdict({
  score: 45,
  severity: 'medium',
  category: 'job_task',
  categories: [{ id: 'job_task', score: 45 }],
  headline: 'Possibly a task job scam',
});

/** Builds a WhatsApp-like message bubble. */
export function bubble(doc: Document, options: { text: string; sender?: string; out?: boolean; html?: string }): HTMLElement {
  const row = doc.createElement('div');
  row.className = options.out ? 'message-out focusable-list-item' : 'message-in focusable-list-item';
  const copyable = doc.createElement('div');
  copyable.className = 'copyable-text';
  copyable.setAttribute('data-pre-plain-text', `[10:15, 23/10/2026] ${options.sender ?? 'Unknown'}: `);
  const inner = doc.createElement('div');
  const span = doc.createElement('span');
  span.className = 'selectable-text copyable-text';
  const textSpan = doc.createElement('span');
  if (options.html) textSpan.innerHTML = options.html;
  else textSpan.textContent = options.text;
  span.appendChild(textSpan);
  inner.appendChild(span);
  copyable.appendChild(inner);
  row.appendChild(copyable);
  return row;
}
