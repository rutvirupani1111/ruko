/** Full-page "This is not the real SBI website" warning. */
import type { Locale } from '@ruko/engine';
import { ArrowLeft, Phone, ShieldCheck, TriangleAlert } from 'lucide';
import { LINKS } from '../../config';
import { ti } from '../../shared/i18n/inpage';
import type { PageCheck } from '../../shared/messages';
import { h, icon, markElement } from './dom';
import { createShadowHost, HOST_STYLE, type ShadowHost, type Theme } from './shadow';

export interface InterstitialOptions {
  check: PageCheck;
  locale: Locale;
  theme: Theme;
  onLeave: () => void;
  onContinue: () => void;
}

export interface InterstitialHandle {
  shadow: ShadowHost;
  remove(): void;
}

/** Elements that make the page behind the warning unreachable while it is shown. */
function lockPage(): () => void {
  const html = document.documentElement;
  const previousOverflow = html.style.getPropertyValue('overflow');
  const previousPriority = html.style.getPropertyPriority('overflow');
  html.style.setProperty('overflow', 'hidden', 'important');
  const inertTargets: HTMLElement[] = [];
  const applyInert = () => {
    const body = document.body;
    if (body && !body.inert) {
      body.inert = true;
      inertTargets.push(body);
    }
  };
  applyInert();
  // At document_start <body> may not exist yet.
  const observer = new MutationObserver(applyInert);
  observer.observe(html, { childList: true });
  return () => {
    observer.disconnect();
    for (const el of inertTargets) el.inert = false;
    if (previousOverflow) html.style.setProperty('overflow', previousOverflow, previousPriority);
    else html.style.removeProperty('overflow');
  };
}

/** "Call {phone} now, or report at {link}." with both placeholders as real links. */
function helpSentence(locale: Locale): Array<string | HTMLElement> {
  return ti(locale, 'gateHelp')
    .split(/(\{phone\}|\{link\})/)
    .filter(Boolean)
    .map((part) => {
      if (part === '{phone}') return h('a', { href: LINKS.helpline }, '1930');
      if (part === '{link}') return h('a', { href: LINKS.cybercrime, target: '_blank', rel: 'noopener noreferrer' }, 'cybercrime.gov.in');
      return part;
    });
}

export function showInterstitial(options: InterstitialOptions): InterstitialHandle {
  const { check, locale } = options;
  const shadow = createShadowHost('interstitial', HOST_STYLE.gate, options.theme, locale);
  const host = check.host || location.hostname;
  const brand = check.brand;

  const titleId = 'rk-gate-title';
  const bodyId = 'rk-gate-body';

  const hostChip = h('span', { class: 'rk-gate__host' }, host);
  const bodyTemplate = ti(locale, brand ? 'gateBodyBrand' : 'gateBodyGeneric', { host: '\u0000', brand: brand ?? '' });
  const [before, after] = bodyTemplate.split('\u0000');

  const leave = h('button', { type: 'button', class: 'rk-btn rk-btn--primary', 'data-action': 'leave' }, icon(ArrowLeft), ti(locale, 'gateLeave'));
  const proceed = h('button', { type: 'button', class: 'rk-btn rk-btn--link', 'data-action': 'continue' }, ti(locale, 'gateContinue'));

  const card = h(
    'div',
    {
      class: 'rk-gate__card',
      role: 'alertdialog',
      'aria-modal': 'true',
      'aria-labelledby': titleId,
      'aria-describedby': bodyId,
      tabindex: '-1',
      lang: locale,
    },
    h('div', { class: 'rk-gate__mark' }, markElement('danger', 72, 'rk-gate__shield')),
    h('p', { class: 'rk-gate__eyebrow' }, ti(locale, 'gateEyebrow')),
    h('h1', { id: titleId }, brand ? ti(locale, 'gateTitleBrand', { brand }) : ti(locale, 'gateTitleGeneric')),
    h('p', { class: 'rk-gate__body', id: bodyId }, before ?? '', hostChip, after ?? ''),
    brand && check.officialDomain
      ? h(
          'p',
          { class: 'rk-gate__real' },
          icon(ShieldCheck),
          h('span', null, ti(locale, 'gateRealSite', { brand, domain: check.officialDomain }), ' '),
          h(
            'a',
            { href: `https://${check.officialDomain}/`, 'data-action': 'real-site', rel: 'noreferrer' },
            ti(locale, 'gateGoReal', { domain: check.officialDomain }),
          ),
        )
      : null,
    check.reasons.length
      ? h(
          'div',
          null,
          h('h2', { class: 'rk-section-title' }, ti(locale, 'gateWhy')),
          h(
            'ul',
            { class: 'rk-gate__reasons' },
            check.reasons.map((reason) => h('li', null, icon(TriangleAlert), h('span', null, reason))),
          ),
        )
      : null,
    h('div', { class: 'rk-gate__actions' }, leave, proceed),
    h('p', { class: 'rk-gate__note' }, ti(locale, 'gateContinueNote', { host })),
    h('p', { class: 'rk-gate__help' }, icon(Phone), h('span', null, helpSentence(locale))),
    h('p', { class: 'rk-gate__brand' }, markElement('brand', 16), ti(locale, 'brandName'), ' · ', ti(locale, 'checkedOnDevice')),
  );

  const gate = h('div', { class: 'rk-gate' }, card);
  shadow.root.appendChild(gate);
  document.documentElement.appendChild(shadow.host);
  const unlock = lockPage();

  // Keep the warning attached if the page tries to remove it.
  const guard = new MutationObserver(() => {
    if (!shadow.host.isConnected) document.documentElement.appendChild(shadow.host);
  });
  guard.observe(document.documentElement, { childList: true });

  // Focus trap in DOM order, so every control stays reachable with Tab and Shift+Tab.
  const focusables = () => [...card.querySelectorAll<HTMLElement>('button, a[href]')];
  card.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const items = focusables();
    const first = items[0];
    const last = items[items.length - 1];
    const active = shadow.root.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first?.focus();
    }
  });

  let removed = false;
  const remove = () => {
    if (removed) return;
    removed = true;
    guard.disconnect();
    unlock();
    shadow.remove();
  };

  leave.addEventListener('click', (event) => {
    if (!event.isTrusted) return;
    options.onLeave();
  });
  proceed.addEventListener('click', (event) => {
    // Pages cannot script their way past the warning.
    if (!event.isTrusted) return;
    remove();
    options.onContinue();
  });

  requestAnimationFrame(() => leave.focus({ preventScroll: true }));
  return { shadow, remove };
}
