/**
 * Gmail protection: when an email is open, analyse it (in the background, cached by
 * text hash) and show a banner above the body for verdicts at or above the user's
 * sensitivity. Never edits the email.
 */
import type { Locale, Verdict } from '@ruko/engine';
import type { HistoryEntry } from '../../shared/history';
import { textKey } from '../../shared/hash';
import { Lru } from '../../shared/lru';
import type { AnalyzeItem, CommunityResult, PendingCheck } from '../../shared/messages';
import { shouldWarn } from '../../shared/severity';
import type { Settings } from '../../shared/settings';
import { createBanner, type BannerHandle } from '../ui/banner';
import { detectTheme, HOST_ATTR } from '../ui/shadow';
import { BODY_SELECTOR, readEmail, senderLabel } from './parse';

export interface GmailDeps {
  analyze(items: AnalyzeItem[], locale: Locale): Promise<Record<string, Verdict>>;
  record(entry: HistoryEntry): void;
  reportCount(count: number): void;
  openPanel(check: Omit<PendingCheck, 'at'>): void;
  community(verdict: Verdict): Promise<CommunityResult[]>;
  dismiss(id: string): void;
  isDismissed(id: string): boolean;
  schedule?(fn: () => void, delayMs: number): unknown;
}

interface Tracked {
  key: string;
  id: string;
  text: string;
  sender: string;
  banner?: BannerHandle;
}

const SCAN_DELAY_MS = 250;
const MIN_TEXT = 12;

export class GmailShield {
  private observer: MutationObserver | null = null;
  private scanPending = false;
  private running = false;
  private readonly tracked = new WeakMap<Element, Tracked>();
  private readonly banners = new Set<BannerHandle>();
  private readonly cache = new Lru<string, Verdict>(200);
  private readonly recorded = new Set<string>();
  private lastCount = -1;

  constructor(
    private settings: Settings,
    private readonly deps: GmailDeps,
    private readonly doc: Document = document,
  ) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.observer = new MutationObserver((records) => {
      const ours = records.every(
        (r) =>
          r.type === 'childList' &&
          [...r.addedNodes, ...r.removedNodes].every((n) => n.nodeType === Node.ELEMENT_NODE && (n as Element).hasAttribute(HOST_ATTR)),
      );
      if (!ours) this.requestScan();
    });
    this.observer.observe(this.doc.body ?? this.doc.documentElement, { childList: true, subtree: true });
    this.requestScan(0);
  }

  stop(): void {
    this.running = false;
    this.scanPending = false;
    this.observer?.disconnect();
    this.observer = null;
    for (const banner of this.banners) banner.remove();
    this.banners.clear();
    this.reportCount();
  }

  updateSettings(next: Settings): void {
    const prev = this.settings;
    this.settings = next;
    if (prev.locale !== next.locale || prev.warnAt !== next.warnAt) {
      for (const banner of this.banners) banner.remove();
      this.banners.clear();
      for (const body of this.doc.querySelectorAll(BODY_SELECTOR)) this.tracked.delete(body);
      this.requestScan(0);
    }
  }

  requestScan(delay = SCAN_DELAY_MS): void {
    if (!this.running || this.scanPending) return;
    this.scanPending = true;
    const run = () => {
      this.scanPending = false;
      void this.scan();
    };
    if (this.deps.schedule) this.deps.schedule(run, delay);
    else setTimeout(run, delay);
  }

  async scan(): Promise<void> {
    if (!this.running) return;
    const locale = this.settings.locale;
    const fresh: Array<{ body: Element; tracked: Tracked; item: AnalyzeItem }> = [];
    for (const body of this.doc.querySelectorAll(BODY_SELECTOR)) {
      const email = readEmail(body, this.doc);
      const text = [email.subject, email.text].filter(Boolean).join('\n\n');
      if (text.length < MIN_TEXT) continue;
      const sender = senderLabel(email);
      const key = textKey(locale, 'email', sender, text);
      const known = this.tracked.get(body);
      if (known?.key === key) continue;
      if (known?.banner) this.removeBanner(known.banner);
      const tracked: Tracked = { key, id: textKey('email', sender, text), text, sender };
      this.tracked.set(body, tracked);
      const cached = this.cache.get(key);
      if (cached) this.apply(body, tracked, cached);
      else fresh.push({ body, tracked, item: { key, text, source: 'email', sender: sender || undefined, kind: 'message', pageUrl: this.doc.location?.href } });
    }
    for (const banner of this.banners) if (!banner.host.isConnected) this.banners.delete(banner);
    if (fresh.length) {
      try {
        const results = await this.deps.analyze(
          fresh.map((f) => f.item),
          locale,
        );
        for (const f of fresh) {
          const verdict = results[f.item.key];
          if (!verdict) continue;
          this.cache.set(f.item.key, verdict);
          if (this.tracked.get(f.body)?.key === f.item.key && f.body.isConnected) this.apply(f.body, f.tracked, verdict);
        }
      } catch {
        for (const f of fresh) this.tracked.delete(f.body);
      }
    }
    this.reportCount();
  }

  private apply(body: Element, tracked: Tracked, verdict: Verdict): void {
    if (!shouldWarn(verdict.severity, this.settings.warnAt) || this.deps.isDismissed(tracked.id)) return;
    if (tracked.banner?.host.isConnected) return;
    const banner = createBanner({
      key: tracked.key,
      verdict,
      locale: this.settings.locale,
      theme: detectTheme(body),
      sender: tracked.sender,
      community: this.settings.community ? this.deps.community(verdict) : undefined,
      onSeeFull: () =>
        this.deps.openPanel({ text: tracked.text, source: 'email', kind: 'message', sender: tracked.sender || undefined, pageUrl: this.doc.location?.href }),
      onDismiss: () => {
        this.deps.dismiss(tracked.id);
        this.removeBanner(banner);
        tracked.banner = undefined;
      },
    });
    body.insertAdjacentElement('beforebegin', banner.host);
    tracked.banner = banner;
    this.banners.add(banner);
    this.reportCount();
    if (!this.recorded.has(tracked.id)) {
      this.recorded.add(tracked.id);
      this.deps.record({
        id: tracked.id,
        at: Date.now(),
        source: 'email',
        host: this.doc.location?.hostname,
        sender: tracked.sender || undefined,
        kind: 'message',
        text: tracked.text,
        score: verdict.score,
        severity: verdict.severity,
        category: verdict.category,
        headline: verdict.headline,
        warned: true,
      });
    }
  }

  private removeBanner(banner: BannerHandle): void {
    banner.remove();
    this.banners.delete(banner);
    this.reportCount();
  }

  private reportCount(): void {
    for (const banner of this.banners) if (!banner.host.isConnected) this.banners.delete(banner);
    const count = this.banners.size;
    if (count === this.lastCount) return;
    this.lastCount = count;
    this.deps.reportCount(count);
  }
}
