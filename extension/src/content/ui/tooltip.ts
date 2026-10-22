/** Small link safety tooltip shown after hovering a link for LINK_HOVER_DELAY_MS. */
import type { Locale } from '@ruko/engine';
import { CircleCheck, IndianRupee, Link2, LoaderCircle, ShieldAlert, ShieldCheck } from 'lucide';
import { ti } from '../../shared/i18n/inpage';
import { tooltipTone, type TooltipTone } from '../../shared/lookalike';
import type { LinkVerdict } from '../../shared/messages';
import { displayUrl } from '../../shared/url';
import { h, icon, markElement } from './dom';
import { createShadowHost, HOST_STYLE, type ShadowHost, type Theme } from './shadow';

const ICONS: Record<TooltipTone, Parameters<typeof icon>[0]> = {
  official: ShieldCheck,
  safe: CircleCheck,
  caution: Link2,
  danger: ShieldAlert,
  upi: IndianRupee,
};

export function tooltipTitle(link: LinkVerdict, locale: Locale): string {
  const tone = tooltipTone(link);
  switch (tone) {
    case 'upi':
      return ti(locale, 'tipUpi');
    case 'official':
      return link.brand ? ti(locale, 'tipOfficialBrand', { brand: link.brand }) : ti(locale, 'tipOfficial');
    case 'danger':
      if (link.download) return ti(locale, 'tipDownload');
      return link.brand ? ti(locale, 'tipDangerBrand', { brand: link.brand }) : ti(locale, 'tipDanger');
    case 'caution':
      return link.shortener ? ti(locale, 'tipShortener') : ti(locale, 'tipCaution');
    case 'safe':
      return ti(locale, 'tipSafe');
  }
}

export class LinkTooltip {
  private shadow: ShadowHost | null = null;
  private box: HTMLElement | null = null;
  anchor: Element | null = null;

  constructor(
    private locale: Locale,
    private theme: Theme,
  ) {}

  setLocale(locale: Locale): void {
    this.locale = locale;
  }

  setTheme(theme: Theme): void {
    this.theme = theme;
    this.shadow?.setTheme(theme);
  }

  private ensure(): { shadow: ShadowHost; box: HTMLElement } {
    if (!this.shadow || !this.box) {
      this.shadow = createShadowHost('tooltip', HOST_STYLE.overlay, this.theme, this.locale);
      this.box = h('div', { class: 'rk-tip', role: 'tooltip', id: 'rk-tip' });
      this.shadow.root.appendChild(this.box);
    }
    if (!this.shadow.host.isConnected) (document.body ?? document.documentElement).appendChild(this.shadow.host);
    this.shadow.setLang(this.locale);
    return { shadow: this.shadow, box: this.box };
  }

  showLoading(anchor: Element): void {
    const { box } = this.ensure();
    this.anchor = anchor;
    box.className = 'rk-tip rk-tip--safe';
    box.replaceChildren(
      h('div', { class: 'rk-tip__label' }, markElement('brand', 14), ti(this.locale, 'tipLabel')),
      h('div', { class: 'rk-tip__title' }, icon(LoaderCircle), ti(this.locale, 'tipChecking')),
    );
    this.place(anchor);
  }

  show(anchor: Element, link: LinkVerdict): void {
    const { box } = this.ensure();
    this.anchor = anchor;
    const tone = tooltipTone(link);
    box.className = `rk-tip rk-tip--${tone}`;
    box.setAttribute('data-tone', tone);
    // The engine's first reason explains the verdict ("Official website of SBI", "Looks like
    // sbi.co.in but is a different address"); skip it when it only repeats the title.
    const title = tooltipTitle(link, this.locale);
    const reason = link.reasons[0] && link.reasons[0] !== title ? link.reasons[0] : undefined;
    const target = link.kind === 'upi' ? (link.upi?.payee ?? link.url.replace(/^upi:\/*/i, '').slice(0, 60)) : displayUrl(link.url, 70);
    box.replaceChildren(
      h('div', { class: 'rk-tip__label' }, markElement('brand', 14), ti(this.locale, 'tipLabel')),
      h('div', { class: 'rk-tip__title' }, icon(ICONS[tone]), title),
      h('div', { class: 'rk-tip__host' }, target),
      ...(reason ? [h('div', { class: 'rk-tip__reason' }, reason)] : []),
    );
    this.place(anchor);
  }

  /** Moves a visible tooltip back next to its link (after scrolling). */
  reposition(): void {
    if (this.anchor && this.shadow?.host.isConnected) this.place(this.anchor);
  }

  /** Below the link when there is room, otherwise above; always inside the viewport. */
  private place(anchor: Element): void {
    const box = this.box;
    if (!box) return;
    const rect = anchor.getBoundingClientRect();
    const vw = document.documentElement.clientWidth || window.innerWidth;
    const vh = window.innerHeight;
    const width = box.offsetWidth;
    const height = box.offsetHeight;
    let top = rect.bottom + 8;
    if (top + height > vh - 8) top = Math.max(8, rect.top - height - 8);
    const left = Math.max(8, Math.min(rect.left, vw - width - 8));
    box.style.top = `${Math.round(top)}px`;
    box.style.left = `${Math.round(left)}px`;
  }

  hide(): void {
    this.anchor = null;
    this.shadow?.remove();
  }

  destroy(): void {
    this.hide();
    this.shadow = null;
    this.box = null;
  }
}
