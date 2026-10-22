/** Singleton verdict popover opened from a WhatsApp badge. */
import type { Locale, Verdict } from '@ruko/engine';
import { EyeOff, PanelRight, X } from 'lucide';
import type { CommunityResult } from '../../shared/messages';
import { ti } from '../../shared/i18n/inpage';
import { h, icon, markElement } from './dom';
import { createShadowHost, HOST_STYLE, type ShadowHost, type Theme } from './shadow';
import { adviceBlock, communityBlock, linksBlock, signalsBlock, verdictHead } from './verdict-view';

export interface PopoverOptions {
  verdict: Verdict;
  locale: Locale;
  theme: Theme;
  /** Element the popover points at (the badge button). */
  anchor: HTMLElement;
  onSeeFull: () => void;
  onHide: () => void;
  onClose?: () => void;
  community?: Promise<CommunityResult[]>;
}

const MARGIN = 8;
let uid = 0;

export class VerdictPopover {
  private shadow: ShadowHost | null = null;
  private panel: HTMLElement | null = null;
  private current: PopoverOptions | null = null;
  private frame = 0;
  private readonly cleanups: Array<() => void> = [];

  get anchor(): HTMLElement | null {
    return this.current?.anchor ?? null;
  }

  isOpen(): boolean {
    return !!this.current;
  }

  open(options: PopoverOptions): void {
    this.close(false);
    this.current = options;
    const { verdict, locale, theme } = options;
    const titleId = `rk-pop-title-${++uid}`;

    const shadow = createShadowHost('popover', HOST_STYLE.overlay, theme, locale);
    this.shadow = shadow;

    const closeButton = h('button', { type: 'button', class: 'rk-icon-btn', 'aria-label': ti(locale, 'close') }, icon(X));
    closeButton.addEventListener('click', () => this.close(true));

    const seeFull = h('button', { type: 'button', class: 'rk-btn rk-btn--quiet' }, icon(PanelRight), ti(locale, 'seeFull'));
    seeFull.addEventListener('click', () => {
      options.onSeeFull();
      this.close(false);
    });

    const hide = h('button', { type: 'button', class: 'rk-btn rk-btn--link' }, icon(EyeOff), ti(locale, 'hideWarning'));
    hide.addEventListener('click', () => {
      options.onHide();
      this.close(false);
    });

    const communitySlot = h('div', null);
    const head = verdictHead(verdict, locale, titleId);
    head.appendChild(closeButton);

    const panel = h(
      'div',
      {
        class: `rk-pop rk-sev-${verdict.severity}`,
        role: 'dialog',
        'aria-modal': 'false',
        'aria-labelledby': titleId,
        tabindex: '-1',
        lang: locale,
      },
      head,
      verdict.summary ? h('p', { class: 'rk-summary' }, verdict.summary) : null,
      communitySlot,
      signalsBlock(verdict, locale),
      linksBlock(verdict, locale),
      adviceBlock(verdict, locale, 2),
      h('div', { class: 'rk-pop__foot' }, seeFull, hide),
      h('p', { class: 'rk-brandline' }, markElement('brand', 16), ti(locale, 'checkedOnDevice')),
    );
    panel.style.visibility = 'hidden';
    this.panel = panel;
    shadow.root.appendChild(panel);
    (document.body ?? document.documentElement).appendChild(shadow.host);
    this.position();
    panel.style.visibility = '';
    panel.focus({ preventScroll: true });

    options.community
      ?.then((results) => {
        if (this.current !== options) return;
        const block = communityBlock(results, locale);
        if (block) communitySlot.replaceChildren(block);
      })
      .catch(() => undefined);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        this.close(true);
      }
    };
    panel.addEventListener('keydown', onKey);

    const onPointerDown = (event: Event) => {
      const path = event.composedPath();
      if (path.includes(shadow.host) || path.includes(options.anchor)) return;
      if (options.anchor.getRootNode() instanceof ShadowRoot && path.includes((options.anchor.getRootNode() as ShadowRoot).host)) return;
      this.close(false);
    };
    const onScroll = () => {
      if (this.frame) return;
      this.frame = requestAnimationFrame(() => {
        this.frame = 0;
        if (!options.anchor.isConnected) this.close(false);
        else this.position();
      });
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    this.cleanups.push(
      () => document.removeEventListener('pointerdown', onPointerDown, true),
      () => window.removeEventListener('scroll', onScroll, true),
      () => window.removeEventListener('resize', onScroll),
    );
  }

  /** Places the panel under the anchor, or above when there is no room, inside the viewport. */
  position(): void {
    const panel = this.panel;
    const anchor = this.current?.anchor;
    if (!panel || !anchor) return;
    const rect = anchor.getBoundingClientRect();
    const vw = document.documentElement.clientWidth || window.innerWidth;
    const vh = window.innerHeight;
    const below = vh - rect.bottom - MARGIN * 2;
    const above = rect.top - MARGIN * 2;
    // Never cover the badge: when the panel fits on neither side, it takes the roomier
    // side and scrolls inside (down to a readable minimum).
    const scrolled = panel.scrollTop;
    panel.style.maxHeight = '';
    const natural = panel.offsetHeight;
    let top: number;
    if (natural <= below) top = rect.bottom + MARGIN;
    else if (natural <= above) top = rect.top - MARGIN - natural;
    else if (Math.max(below, above) >= 220) {
      const room = Math.max(below, above);
      panel.style.maxHeight = `${Math.floor(room)}px`;
      top = below >= above ? rect.bottom + MARGIN : rect.top - MARGIN - room;
    } else {
      top = Math.max(MARGIN, Math.min(rect.bottom + MARGIN, vh - natural - MARGIN));
    }
    const width = panel.offsetWidth;
    const left = Math.max(MARGIN, Math.min(rect.left, vw - width - MARGIN));
    panel.style.top = `${Math.round(top)}px`;
    panel.style.left = `${Math.round(left)}px`;
    panel.scrollTop = scrolled;
  }

  close(restoreFocus: boolean): void {
    const current = this.current;
    if (!current) return;
    this.current = null;
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    while (this.cleanups.length) this.cleanups.pop()?.();
    this.shadow?.remove();
    this.shadow = null;
    this.panel = null;
    current.onClose?.();
    if (restoreFocus && current.anchor.isConnected) current.anchor.focus({ preventScroll: true });
  }
}
