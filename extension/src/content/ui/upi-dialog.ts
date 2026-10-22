/** Confirmation shown before a upi:// link hands control to a payment app. */
import type { Locale, Severity, UpiPaymentRequest } from '@ruko/engine';
import { Info, IndianRupee } from 'lucide';
import { formatRupees } from '../../shared/i18n/format';
import { SEVERITY_LABELS, ti } from '../../shared/i18n/inpage';
import { h, icon, markElement } from './dom';
import { createShadowHost, HOST_STYLE, type Theme } from './shadow';

export interface UpiDialogOptions {
  uri: string;
  request: UpiPaymentRequest | null;
  severity: Severity;
  locale: Locale;
  theme: Theme;
  onCancel: () => void;
  onContinue: () => void;
}

export function showUpiDialog(options: UpiDialogOptions): { remove(): void } {
  const { request, locale } = options;
  const shadow = createShadowHost('upi-dialog', HOST_STYLE.overlay, options.theme, locale);
  const titleId = 'rk-upi-title';

  const cancel = h('button', { type: 'button', class: 'rk-btn rk-btn--primary', 'data-action': 'cancel' }, ti(locale, 'upiCancel'));
  const proceed = h('button', { type: 'button', class: 'rk-btn rk-btn--quiet', 'data-action': 'continue' }, ti(locale, 'upiContinue'));

  const details = request
    ? h(
        'dl',
        { class: 'rk-upi' },
        h('dt', null, ti(locale, 'upiPayee')),
        h('dd', null, request.payeeName ? `${request.payeeName} (${request.payee})` : request.payee),
        h('dt', null, ti(locale, 'upiAmount')),
        h(
          'dd',
          { class: request.amount ? 'rk-upi__amount' : '' },
          request.amount ? formatRupees(request.amount, locale) : ti(locale, 'upiAmountOpen'),
        ),
        request.note ? h('dt', null, ti(locale, 'upiNote')) : null,
        request.note ? h('dd', null, request.note) : null,
      )
    : h('p', null, ti(locale, 'upiUnreadable'));

  const reasons = request?.reasons.filter(Boolean).slice(0, 3) ?? [];
  const modal = h(
    'div',
    { class: 'rk-modal', role: 'alertdialog', 'aria-modal': 'true', 'aria-labelledby': titleId, tabindex: '-1', lang: locale },
    h('div', { class: 'rk-modal__icon' }, icon(IndianRupee)),
    h('h2', { id: titleId }, ti(locale, 'upiTitle')),
    h('p', null, ti(locale, 'upiBody')),
    details,
    reasons.length
      ? h(
          'div',
          null,
          h('h3', { class: 'rk-section-title' }, ti(locale, 'upiRiskTitle'), ' ', h('span', { class: `rk-chip rk-sev-${options.severity}` }, SEVERITY_LABELS[locale][options.severity])),
          h('ul', { class: 'rk-signals' }, reasons.map((r) => h('li', { class: 'rk-signal rk-signal--note' }, icon(Info), h('div', null, r)))),
        )
      : null,
    h('div', { class: 'rk-actions' }, proceed, cancel),
    h('p', { class: 'rk-brandline' }, markElement('brand', 16), ti(locale, 'checkedOnDevice')),
  );
  const backdrop = h('div', { class: 'rk-backdrop' }, modal);
  shadow.root.appendChild(backdrop);
  (document.body ?? document.documentElement).appendChild(shadow.host);

  let done = false;
  const finish = (result: 'cancel' | 'continue') => {
    if (done) return;
    done = true;
    document.removeEventListener('keydown', onKey, true);
    shadow.remove();
    if (result === 'continue') options.onContinue();
    else options.onCancel();
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      finish('cancel');
    } else if (event.key === 'Tab') {
      const active = shadow.root.activeElement;
      if (event.shiftKey && active === proceed) {
        event.preventDefault();
        cancel.focus();
      } else if (!event.shiftKey && active === cancel) {
        event.preventDefault();
        proceed.focus();
      }
    }
  };
  document.addEventListener('keydown', onKey, true);
  cancel.addEventListener('click', () => finish('cancel'));
  proceed.addEventListener('click', (event) => {
    if (!event.isTrusted) return;
    finish('continue');
  });
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) finish('cancel');
  });
  requestAnimationFrame(() => cancel.focus({ preventScroll: true }));
  return { remove: () => finish('cancel') };
}
