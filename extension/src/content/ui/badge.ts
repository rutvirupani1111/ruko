/** The compact "Possible KYC scam · Why?" badge shown under a WhatsApp message. */
import type { Locale, Verdict } from '@ruko/engine';
import { ShieldAlert } from 'lucide';
import { badgeLabel, ti } from '../../shared/i18n/inpage';
import { h, icon } from './dom';
import { createShadowHost, HOST_STYLE, type ShadowHost, type Theme } from './shadow';

export interface BadgeHandle extends ShadowHost {
  button: HTMLButtonElement;
  key: string;
  update(verdict: Verdict, locale: Locale): void;
  setExpanded(expanded: boolean): void;
}

export function createBadge(options: {
  key: string;
  verdict: Verdict;
  locale: Locale;
  theme: Theme;
  onOpen: (badge: BadgeHandle) => void;
}): BadgeHandle {
  const shadow = createShadowHost('badge', HOST_STYLE.block, options.theme, options.locale);
  const button = h('button', { type: 'button', class: 'rk-badge', 'aria-haspopup': 'dialog', 'aria-expanded': 'false' });
  shadow.root.appendChild(button);

  const handle: BadgeHandle = {
    ...shadow,
    button,
    key: options.key,
    update(verdict, locale) {
      const label = badgeLabel(locale, verdict.category, verdict.severity);
      button.className = `rk-badge rk-sev-${verdict.severity}`;
      button.setAttribute('aria-label', ti(locale, 'badgeAria', { label, score: verdict.score }));
      button.replaceChildren(
        icon(ShieldAlert),
        h('span', { class: 'rk-badge__label' }, label),
        h('span', { class: 'rk-badge__sep', 'aria-hidden': 'true' }, '·'),
        h('span', { class: 'rk-badge__why', 'aria-hidden': 'true' }, ti(locale, 'badgeWhy')),
      );
      shadow.setLang(locale);
    },
    setExpanded(expanded) {
      button.setAttribute('aria-expanded', String(expanded));
    },
  };
  handle.update(options.verdict, options.locale);
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    options.onOpen(handle);
  });
  // Keep WhatsApp from treating clicks on the badge as clicks on the message.
  for (const type of ['mousedown', 'mouseup', 'pointerdown', 'pointerup', 'dblclick', 'contextmenu'] as const) {
    button.addEventListener(type, (event) => event.stopPropagation());
  }
  return handle;
}
