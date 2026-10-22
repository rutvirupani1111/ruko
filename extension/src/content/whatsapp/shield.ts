/**
 * WhatsApp Web protection: watches the chat pane, analyses each incoming message
 * once (cached by text hash, off the page thread in the background), and adds a
 * badge under bubbles at or above the user's sensitivity. Never edits message text.
 */
import type { Locale, Verdict } from '@ruko/engine';
import type { HistoryEntry } from '../../shared/history';
import { textKey } from '../../shared/hash';
import { Lru } from '../../shared/lru';
import type { AnalyzeItem, CommunityResult, PendingCheck } from '../../shared/messages';
import { shouldWarn } from '../../shared/severity';
import type { Settings } from '../../shared/settings';
import { createBadge, type BadgeHandle } from '../ui/badge';
import { VerdictPopover } from '../ui/popover';
import { detectTheme, HOST_ATTR, type Theme } from '../ui/shadow';
import { chatRoot, MESSAGE_SELECTOR, messageDirection, messageText, parsePrePlainText } from './parse';

export interface WhatsAppDeps {
  analyze(items: AnalyzeItem[], locale: Locale): Promise<Record<string, Verdict>>;
  record(entry: HistoryEntry): void;
  reportCount(count: number): void;
  openPanel(check: Omit<PendingCheck, 'at'>): void;
  community(verdict: Verdict): Promise<CommunityResult[]>;
  dismiss(id: string): void;
  isDismissed(id: string): boolean;
  /** Defaults to setTimeout; tests pass a synchronous scheduler. */
  schedule?(fn: () => void, delayMs: number): unknown;
}

interface Tracked {
  /** Analysis cache key (includes locale). */
  key: string;
  /** Locale-independent id used for history and dismissals. */
  id: string;
  text: string;
  sender: string;
  badge?: BadgeHandle;
}

const SCAN_DELAY_MS = 120;
const RECHECK_EVERY_MS = 2500;
const BATCH_SIZE = 25;
const MIN_TEXT = 3;

export class WhatsAppShield {
  private observer: MutationObserver | null = null;
  private scanPending = false;
  private lastFullCheck = 0;
  private readonly tracked = new WeakMap<Element, Tracked>();
  private readonly badges = new Set<BadgeHandle>();
  private readonly cache = new Lru<string, Verdict>(800);
  private readonly pending = new Map<string, { item: AnalyzeItem; elements: Set<Element> }>();
  private readonly recorded = new Set<string>();
  private readonly popover = new VerdictPopover();
  private flushing = false;
  private lastCount = -1;
  private theme: Theme = 'light';
  private running = false;

  constructor(
    private settings: Settings,
    private readonly deps: WhatsAppDeps,
    private readonly doc: Document = document,
  ) {}

  get badgeCount(): number {
    return this.badges.size;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.theme = detectTheme(this.doc.querySelector('#main') ?? this.doc.body);
    this.observer = new MutationObserver((records) => {
      if (records.every((r) => isOwnMutation(r))) return;
      this.requestScan();
    });
    this.observer.observe(this.doc.body ?? this.doc.documentElement, { childList: true, subtree: true, characterData: true });
    this.requestScan(0);
  }

  stop(): void {
    this.running = false;
    this.scanPending = false;
    this.observer?.disconnect();
    this.observer = null;
    this.popover.close(false);
    for (const badge of this.badges) badge.remove();
    this.badges.clear();
    this.pending.clear();
    this.reportCount();
  }

  /** Applies new settings: language or sensitivity changes re-render every badge. */
  updateSettings(next: Settings): void {
    const prev = this.settings;
    this.settings = next;
    if (prev.locale !== next.locale || prev.warnAt !== next.warnAt) {
      this.popover.close(false);
      for (const badge of this.badges) badge.remove();
      this.badges.clear();
      this.lastFullCheck = 0;
      // Forget per-element state so every visible message is evaluated again.
      for (const el of this.doc.querySelectorAll(MESSAGE_SELECTOR)) this.tracked.delete(el);
      this.requestScan(0);
    }
  }

  requestScan(delay = SCAN_DELAY_MS): void {
    if (!this.running || this.scanPending) return;
    this.scanPending = true;
    const run = () => {
      this.scanPending = false;
      this.scan();
    };
    if (this.deps.schedule) this.deps.schedule(run, delay);
    else setTimeout(run, delay);
  }

  /** Finds new or edited incoming messages; renders cached verdicts, queues the rest. */
  scan(): void {
    if (!this.running) return;
    const now = Date.now();
    const full = now - this.lastFullCheck > RECHECK_EVERY_MS;
    if (full) {
      this.lastFullCheck = now;
      // WhatsApp's light/dark switch does not reload the page: follow it.
      const theme = detectTheme(this.doc.querySelector('#main') ?? this.doc.body);
      if (theme !== this.theme) {
        this.theme = theme;
        for (const badge of this.badges) badge.setTheme(theme);
      }
    }
    const locale = this.settings.locale;
    const elements = chatRoot(this.doc).querySelectorAll(MESSAGE_SELECTOR);
    for (const el of elements) {
      const known = this.tracked.get(el);
      if (known && !full) continue;
      if (messageDirection(el) === 'out') continue;
      const text = messageText(el);
      if (text.length < MIN_TEXT) continue;
      const sender = parsePrePlainText(el.getAttribute('data-pre-plain-text'))?.sender ?? '';
      const key = textKey(locale, 'whatsapp', sender, text);
      if (known && known.key === key) continue;
      if (known?.badge) this.removeBadge(known.badge);
      const tracked: Tracked = { key, id: textKey('whatsapp', sender, text), text, sender };
      this.tracked.set(el, tracked);
      const cached = this.cache.get(key);
      if (cached) {
        this.apply(el, tracked, cached);
        continue;
      }
      const entry = this.pending.get(key);
      if (entry) entry.elements.add(el);
      else {
        this.pending.set(key, {
          item: { key, text, source: 'whatsapp', sender: sender || undefined, pageUrl: this.doc.location?.href },
          elements: new Set([el]),
        });
      }
    }
    this.pruneBadges();
    void this.flush();
  }

  private async flush(): Promise<void> {
    if (this.flushing || !this.pending.size) return;
    this.flushing = true;
    try {
      while (this.pending.size && this.running) {
        const batch = [...this.pending.values()].slice(0, BATCH_SIZE);
        const locale = this.settings.locale;
        let results: Record<string, Verdict> = {};
        try {
          results = await this.deps.analyze(
            batch.map((b) => b.item),
            locale,
          );
        } catch {
          // Background unavailable (extension updated or asleep and failing): try again on the next scan.
          for (const b of batch) this.pending.delete(b.item.key);
          for (const b of batch) for (const el of b.elements) this.tracked.delete(el);
          break;
        }
        for (const b of batch) {
          this.pending.delete(b.item.key);
          const verdict = results[b.item.key];
          if (!verdict) continue;
          this.cache.set(b.item.key, verdict);
          for (const el of b.elements) {
            const tracked = this.tracked.get(el);
            if (tracked?.key === b.item.key && el.isConnected) this.apply(el, tracked, verdict);
          }
        }
      }
    } finally {
      this.flushing = false;
      this.reportCount();
    }
  }

  private apply(el: Element, tracked: Tracked, verdict: Verdict): void {
    const warn = shouldWarn(verdict.severity, this.settings.warnAt) && !this.deps.isDismissed(tracked.id);
    if (!warn) {
      if (tracked.badge) this.removeBadge(tracked.badge);
      tracked.badge = undefined;
      return;
    }
    const locale = this.settings.locale;
    if (tracked.badge?.host.isConnected) {
      tracked.badge.update(verdict, locale);
      return;
    }
    const badge = createBadge({
      key: tracked.key,
      verdict,
      locale,
      theme: this.theme,
      onOpen: (handle) => this.openPopover(handle, tracked, verdict),
    });
    el.insertAdjacentElement('afterend', badge.host);
    tracked.badge = badge;
    this.badges.add(badge);
    this.reportCount();
    if (!this.recorded.has(tracked.id)) {
      this.recorded.add(tracked.id);
      this.deps.record({
        id: tracked.id,
        at: Date.now(),
        source: 'whatsapp',
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

  private openPopover(badge: BadgeHandle, tracked: Tracked, verdict: Verdict): void {
    if (this.popover.isOpen() && this.popover.anchor === badge.button) {
      this.popover.close(true);
      return;
    }
    badge.setExpanded(true);
    this.popover.open({
      verdict,
      locale: this.settings.locale,
      theme: this.theme,
      anchor: badge.button,
      community: this.settings.community ? this.deps.community(verdict) : undefined,
      onClose: () => badge.setExpanded(false),
      onSeeFull: () =>
        this.deps.openPanel({
          text: tracked.text,
          source: 'whatsapp',
          kind: 'message',
          sender: tracked.sender || undefined,
          pageUrl: this.doc.location?.href,
        }),
      onHide: () => {
        this.deps.dismiss(tracked.id);
        this.removeBadge(badge);
        tracked.badge = undefined;
      },
    });
  }

  private removeBadge(badge: BadgeHandle): void {
    if (this.popover.anchor === badge.button) this.popover.close(false);
    badge.remove();
    this.badges.delete(badge);
    this.reportCount();
  }

  private pruneBadges(): void {
    for (const badge of this.badges) if (!badge.host.isConnected) this.badges.delete(badge);
    this.reportCount();
  }

  private reportCount(): void {
    const count = this.badges.size;
    if (count === this.lastCount) return;
    this.lastCount = count;
    this.deps.reportCount(count);
  }
}

/** Mutations caused only by Ruko inserting or removing its own hosts. */
function isOwnMutation(record: MutationRecord): boolean {
  if (record.type !== 'childList') return false;
  const nodes = [...record.addedNodes, ...record.removedNodes];
  return nodes.length > 0 && nodes.every((n) => n.nodeType === Node.ELEMENT_NODE && (n as Element).hasAttribute(HOST_ATTR));
}
