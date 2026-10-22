/**
 * Link safety tooltips: hovering (or keyboard-focusing) a link for 600 ms shows
 * what Ruko knows about its destination. Checks run in the background and are
 * cached per page, so hovering never blocks the page.
 */
import type { Locale } from '@ruko/engine';
import { LINK_HOVER_DELAY_MS } from '../../config';
import { Lru } from '../../shared/lru';
import type { LinkVerdict } from '../../shared/messages';
import { isHttpUrl, isUpiHref } from '../../shared/url';
import { detectTheme, isRukoNode } from '../ui/shadow';
import { LinkTooltip } from '../ui/tooltip';

export interface LinkWatcherDeps {
  checkLink(url: string, locale: Locale): Promise<LinkVerdict>;
  delayMs?: number;
}

/** The innermost <a href> on the event's path, looking through open shadow roots. */
export function linkFromEvent(event: Event): HTMLAnchorElement | null {
  for (const node of event.composedPath()) {
    if (node instanceof HTMLAnchorElement && node.hasAttribute('href')) return node;
    if (node === document.body) break;
  }
  return null;
}

export function checkableHref(anchor: HTMLAnchorElement): string | null {
  const raw = anchor.getAttribute('href') ?? '';
  if (isUpiHref(raw)) return raw.trim();
  const href = anchor.href;
  if (!isHttpUrl(href)) return null;
  // Same-page anchors and links within the current site are not interesting.
  try {
    const url = new URL(href);
    if (url.origin === location.origin) return null;
  } catch {
    return null;
  }
  return href;
}

export class LinkWatcher {
  private tooltip: LinkTooltip;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private current: HTMLAnchorElement | null = null;
  private readonly cache = new Lru<string, LinkVerdict>(300);
  private readonly cleanups: Array<() => void> = [];
  private generation = 0;

  constructor(
    private locale: Locale,
    private readonly deps: LinkWatcherDeps,
  ) {
    this.tooltip = new LinkTooltip(locale, 'light');
  }

  setLocale(locale: Locale): void {
    if (locale === this.locale) return;
    this.locale = locale;
    this.cache.clear();
    this.tooltip.setLocale(locale);
    this.hide();
  }

  start(): void {
    const on = <K extends keyof DocumentEventMap>(type: K, fn: (e: DocumentEventMap[K]) => void, capture = true) => {
      document.addEventListener(type, fn as EventListener, { capture, passive: true });
      this.cleanups.push(() => document.removeEventListener(type, fn as EventListener, { capture }));
    };
    on('mouseover', (e) => this.enter(e));
    on('focusin', (e) => this.enter(e));
    on('mouseout', (e) => this.leave(e));
    on('focusout', (e) => this.leave(e));
    on('pointerdown', () => this.hide());
    on('keydown', (e) => {
      if (e.key === 'Escape') this.hide();
    });
    // Scrolling keeps a pending check alive and moves a visible tooltip with its link,
    // hiding it only once the link has left the screen.
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const anchor = this.current;
        if (!anchor) return;
        const rect = anchor.getBoundingClientRect();
        const visible = anchor.isConnected && rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 0;
        if (!visible) this.hide();
        else this.tooltip.reposition();
      });
    };
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    this.cleanups.push(() => {
      window.removeEventListener('scroll', onScroll, { capture: true });
      if (frame) cancelAnimationFrame(frame);
    });
  }

  stop(): void {
    while (this.cleanups.length) this.cleanups.pop()?.();
    this.hide();
    this.tooltip.destroy();
  }

  private enter(event: Event): void {
    const target = event.composedPath()[0];
    if (target instanceof Element && isRukoNode(target)) return;
    const anchor = linkFromEvent(event);
    if (anchor === this.current) return;
    this.hide();
    if (!anchor) return;
    const href = checkableHref(anchor);
    if (!href) return;
    this.current = anchor;
    const generation = ++this.generation;
    this.timer = setTimeout(() => void this.reveal(anchor, href, generation), this.deps.delayMs ?? LINK_HOVER_DELAY_MS);
  }

  private leave(event: Event): void {
    if (!this.current) return;
    const related = (event as MouseEvent | FocusEvent).relatedTarget;
    if (related instanceof Node && this.current.contains(related)) return;
    this.hide();
  }

  private async reveal(anchor: HTMLAnchorElement, href: string, generation: number): Promise<void> {
    this.timer = null;
    if (generation !== this.generation || !anchor.isConnected) return;
    this.tooltip.setTheme(detectTheme(anchor));
    const cached = this.cache.get(href);
    if (cached) {
      this.tooltip.show(anchor, cached);
      return;
    }
    this.tooltip.showLoading(anchor);
    try {
      const verdict = await this.deps.checkLink(href, this.locale);
      this.cache.set(href, verdict);
      if (generation === this.generation && this.current === anchor) this.tooltip.show(anchor, verdict);
    } catch {
      if (generation === this.generation) this.tooltip.hide();
    }
  }

  hide(): void {
    this.generation++;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.current = null;
    this.tooltip.hide();
  }
}
