/** Building blocks shared by the WhatsApp popover and the Gmail banner. */
import type { Locale, Verdict } from '@ruko/engine';
import { TriangleAlert, ArrowRight, CircleCheck, ExternalLink, Link2, Phone, ShieldCheck, Users } from 'lucide';
import { verdictActions } from '../../shared/actions';
import type { CommunityResult } from '../../shared/messages';
import { SEVERITY_LABELS, ti } from '../../shared/i18n/inpage';
import { formatNumber } from '../../shared/i18n/format';
import { displayUrl } from '../../shared/url';
import { h, icon, riskMeter } from './dom';

export function severityChip(verdict: Pick<Verdict, 'severity'>, locale: Locale): HTMLElement {
  return h('span', { class: `rk-chip rk-sev-${verdict.severity}` }, SEVERITY_LABELS[locale][verdict.severity]);
}

export function verdictHead(verdict: Verdict, locale: Locale, titleId: string): HTMLElement {
  return h(
    'div',
    { class: 'rk-head' },
    riskMeter(verdict.score, ti(locale, 'riskOutOf', { score: verdict.score })),
    h(
      'div',
      { class: 'rk-head__text' },
      severityChip(verdict, locale),
      h('h2', { id: titleId }, verdict.headline),
    ),
  );
}

export function signalsBlock(verdict: Verdict, locale: Locale, max = 4): HTMLElement | null {
  const warning = verdict.signals.filter((s) => s.weight > 0).slice(0, max);
  const reassuring = verdict.signals.filter((s) => s.weight < 0).slice(0, 2);
  if (!warning.length && !reassuring.length) return null;
  const item = (title: string, detail: string, good: boolean) =>
    h(
      'li',
      { class: `rk-signal${good ? ' rk-signal--good' : ''}` },
      icon(good ? CircleCheck : TriangleAlert),
      h('div', null, h('div', { class: 'rk-signal__title' }, title), detail ? h('div', { class: 'rk-signal__detail' }, detail) : null),
    );
  return h(
    'div',
    null,
    warning.length ? h('h3', { class: 'rk-section-title' }, ti(locale, 'warningSigns')) : null,
    warning.length ? h('ul', { class: 'rk-signals' }, warning.map((s) => item(s.title, s.detail, false))) : null,
    reassuring.length ? h('h3', { class: 'rk-section-title' }, ti(locale, 'reassuringSigns')) : null,
    reassuring.length ? h('ul', { class: 'rk-signals' }, reassuring.map((s) => item(s.title, s.detail, true))) : null,
  );
}

export function linksBlock(verdict: Verdict, locale: Locale, max = 3): HTMLElement | null {
  const urls = verdict.entities.urls.slice(0, max);
  if (!urls.length) return null;
  return h(
    'div',
    null,
    h('h3', { class: 'rk-section-title' }, ti(locale, 'linksInMessage')),
    h(
      'ul',
      { class: 'rk-links' },
      urls.map((u) => {
        const severity = u.official ? 'safe' : u.risk >= 60 ? 'high' : u.risk >= 35 ? 'medium' : u.risk >= 15 ? 'low' : 'safe';
        return h(
          'li',
          { class: 'rk-link' },
          icon(u.official ? ShieldCheck : Link2),
          h('span', { class: 'rk-link__host', title: u.url }, displayUrl(u.url, 48)),
          h('span', { class: `rk-chip rk-sev-${severity}` }, u.official ? SEVERITY_LABELS[locale].safe : formatNumber(u.risk, locale)),
        );
      }),
    ),
  );
}

export function adviceBlock(verdict: Verdict, locale: Locale, maxItems = 3): HTMLElement {
  const items = verdict.advice.slice(0, maxItems);
  const actions = verdictActions(verdict.advice, verdict.severity, locale);
  return h(
    'div',
    null,
    items.length ? h('h3', { class: 'rk-section-title' }, ti(locale, 'whatToDo')) : null,
    items.length
      ? h(
          'ul',
          { class: 'rk-advice' },
          items.map((a) =>
            h(
              'li',
              null,
              icon(ArrowRight),
              h('div', null, h('div', { class: 'rk-advice__title' }, a.title), a.detail ? h('div', { class: 'rk-advice__detail' }, a.detail) : null),
            ),
          ),
        )
      : null,
    actions.length
      ? h(
          'div',
          { class: 'rk-actions' },
          actions.slice(0, 3).map((a, i) =>
            h(
              'a',
              {
                class: `rk-btn ${i === 0 ? 'rk-btn--primary' : 'rk-btn--quiet'}`,
                href: a.href,
                target: a.href.startsWith('tel:') ? null : '_blank',
                rel: 'noopener noreferrer',
              },
              icon(a.href.startsWith('tel:') ? Phone : ExternalLink),
              a.label,
            ),
          ),
        )
      : null,
  );
}

export function communityBlock(results: CommunityResult[], locale: Locale): HTMLElement | null {
  const top = results.reduce<CommunityResult | null>((best, r) => (!best || r.reports > best.reports ? r : best), null);
  if (!top) return null;
  return h(
    'div',
    { class: 'rk-community', role: 'note' },
    icon(Users),
    h('span', null, ti(locale, 'communityReports', { count: formatNumber(top.reports, locale) })),
    h('small', null, ti(locale, 'communityNote')),
  );
}
