/** Banner shown above a suspicious Gmail email body. */
import type { Locale, Verdict } from '@ruko/engine';
import { ChevronDown, PanelRight, X } from 'lucide';
import type { CommunityResult } from '../../shared/messages';
import { ti } from '../../shared/i18n/inpage';
import { h, icon, markElement } from './dom';
import { createShadowHost, HOST_STYLE, type ShadowHost, type Theme } from './shadow';
import { adviceBlock, communityBlock, linksBlock, signalsBlock, verdictHead } from './verdict-view';

export interface BannerHandle extends ShadowHost {
  key: string;
}

let uid = 0;

export function createBanner(options: {
  key: string;
  verdict: Verdict;
  locale: Locale;
  theme: Theme;
  sender: string;
  onSeeFull: () => void;
  onDismiss: () => void;
  community?: Promise<CommunityResult[]>;
}): BannerHandle {
  const { verdict, locale } = options;
  const shadow = createShadowHost('banner', HOST_STYLE.block, options.theme, locale);
  const titleId = `rk-banner-title-${++uid}`;
  const detailsId = `rk-banner-details-${uid}`;

  const details = h(
    'div',
    { class: 'rk-banner__details', id: detailsId, hidden: true },
    signalsBlock(verdict, locale, 5),
    linksBlock(verdict, locale, 4),
    adviceBlock(verdict, locale, 3),
  );
  const toggle = h(
    'button',
    { type: 'button', class: 'rk-btn rk-btn--primary', 'aria-expanded': 'false', 'aria-controls': detailsId },
    ti(locale, 'showDetails'),
    icon(ChevronDown),
  );
  toggle.addEventListener('click', () => {
    const open = details.hidden;
    details.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.replaceChildren(ti(locale, open ? 'hideDetails' : 'showDetails'), icon(ChevronDown));
  });
  const seeFull = h('button', { type: 'button', class: 'rk-btn rk-btn--quiet' }, icon(PanelRight), ti(locale, 'seeFull'));
  seeFull.addEventListener('click', options.onSeeFull);
  const dismiss = h('button', { type: 'button', class: 'rk-btn rk-btn--link', 'aria-label': ti(locale, 'dismissAria') }, icon(X), ti(locale, 'dismiss'));
  dismiss.addEventListener('click', options.onDismiss);

  const communitySlot = h('div', null);
  const banner = h(
    'section',
    { class: `rk-banner rk-sev-${verdict.severity}`, role: 'region', 'aria-labelledby': titleId, lang: locale },
    h(
      'p',
      { class: 'rk-banner__eyebrow' },
      markElement('brand', 16),
      ti(locale, 'bannerEyebrow'),
      options.sender ? ` · ${ti(locale, 'bannerFrom', { sender: options.sender })}` : '',
    ),
    h('div', { class: 'rk-banner__row' }, verdictHead(verdict, locale, titleId)),
    verdict.summary ? h('p', { class: 'rk-summary' }, verdict.summary) : null,
    communitySlot,
    h('div', { class: 'rk-banner__actions' }, toggle, seeFull, dismiss),
    details,
  );
  shadow.root.appendChild(banner);

  options.community
    ?.then((results) => {
      const block = communityBlock(results, locale);
      if (block) communitySlot.replaceChildren(block);
    })
    .catch(() => undefined);

  return { ...shadow, key: options.key };
}
