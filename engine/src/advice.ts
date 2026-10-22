/**
 * Advice: the right next steps for the category and severity, plus the
 * national helplines when money may be lost (1930, cybercrime.gov.in, the
 * bank, and Chakshu on Sanchar Saathi for fraud calls and messages).
 */
import type { Advice, Locale, ScamCategory, Severity } from './types';
import { t, type MessageKey } from './i18n';

export const HELPLINE_1930 = 'tel:1930';
export const CYBERCRIME_PORTAL = 'https://cybercrime.gov.in';
export const CHAKSHU_PORTAL = 'https://sancharsaathi.gov.in/sfc/';

/** Categories where the scam directly targets bank, card or UPI money. */
const MONEY = new Set<ScamCategory>([
  'digital_arrest', 'kyc_update', 'upi_collect', 'qr_receive', 'fake_refund', 'job_task', 'investment', 'lottery_prize',
  'loan_app', 'sextortion', 'otp_theft', 'fake_support', 'courier_parcel', 'utility_disconnect', 'reward_points',
  'tax_refund', 'govt_scheme', 'malicious_app', 'remote_access', 'impersonation', 'romance', 'sim_swap', 'phishing_link',
  'lookalike_domain',
]);

/** Categories where a code, PIN, password or device may already be compromised. */
const COMPROMISE = new Set<ScamCategory>(['otp_theft', 'malicious_app', 'remote_access', 'sim_swap', 'phishing_link', 'lookalike_domain', 'kyc_update', 'reward_points']);

export interface AdviceContext {
  /** The message arrived by SMS, call or WhatsApp, or contains phone numbers. */
  telecom: boolean;
}

function item(locale: Locale, id: string, base: string, extra: Partial<Advice> = {}): Advice {
  const a: Advice = {
    id,
    title: t(locale, (base + '.t') as MessageKey),
    detail: t(locale, (base + '.d') as MessageKey),
  };
  if (extra.action) a.action = extra.action;
  if (extra.urgent) a.urgent = true;
  return a;
}

function categoryAdvice(locale: Locale, cat: ScamCategory | null): Advice | null {
  if (!cat || cat === 'other') return null;
  return item(locale, `category.${cat}`, `adv.${cat}`);
}

function call1930(locale: Locale, urgent: boolean): Advice {
  return item(locale, 'call_1930', 'adv.1930', { action: { label: t(locale, 'adv.1930.a'), href: HELPLINE_1930 }, urgent });
}

function report(locale: Locale): Advice {
  return item(locale, 'report_cybercrime', 'adv.report', { action: { label: t(locale, 'adv.report.a'), href: CYBERCRIME_PORTAL } });
}

function chakshu(locale: Locale): Advice {
  return item(locale, 'report_chakshu', 'adv.chakshu', { action: { label: t(locale, 'adv.chakshu.a'), href: CHAKSHU_PORTAL } });
}

/** Build the advice list for a verdict. */
export function buildAdvice(category: ScamCategory | null, severity: Severity, locale: Locale, ctx: AdviceContext): Advice[] {
  const out: Advice[] = [];
  if (severity === 'safe') {
    out.push(item(locale, 'stay_alert', 'adv.tip'));
    return out;
  }
  if (severity === 'low') {
    out.push(item(locale, 'verify_official', 'adv.verify'));
    out.push(item(locale, 'stay_alert', 'adv.tip'));
    return out;
  }
  const cat = categoryAdvice(locale, category);
  const money = category === null || MONEY.has(category);
  if (severity === 'medium') {
    if (cat) out.push(cat);
    out.push(item(locale, 'verify_official', 'adv.verify'));
    out.push(item(locale, 'stop', 'adv.stop'));
    if (money) out.push(call1930(locale, false));
    out.push(report(locale));
    if (ctx.telecom) out.push(chakshu(locale));
    return out;
  }
  // high and critical
  out.push(item(locale, 'stop', 'adv.stop', { urgent: true }));
  if (cat) out.push(cat);
  out.push(call1930(locale, true));
  out.push(report(locale));
  if (money) out.push(item(locale, 'inform_bank', 'adv.bank'));
  out.push(chakshu(locale));
  if (category && COMPROMISE.has(category)) out.push(item(locale, 'change_pins', 'adv.pins'));
  return out;
}
