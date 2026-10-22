/**
 * Parse the shown sender: an SMS header such as `VM-HDFCBK`, a phone number,
 * an email address (optionally "Name <email>"), or a display name.
 */
import type { Locale, PhoneFinding } from './types';
import { brandForSmsHeader, officialBrandForHost, type Brand } from './domains/brands';
import { analyzePhone, isHighRiskCountry } from './entities/phones';
import { cleanIdentifier } from './normalize';

export interface SenderInfo {
  raw: string;
  kind: 'none' | 'dlt' | 'phone' | 'email' | 'name';
  /** DLT header without the operator prefix, e.g. `HDFCBK`. */
  header?: string;
  /** Brand that owns the header or the email domain. */
  brand?: Brand;
  phone?: PhoneFinding;
  email?: string;
  emailDomain?: string;
  freeEmail?: boolean;
  displayName?: string;
}

const FREE_MAIL = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.in', 'yahoo.in', 'ymail.com', 'outlook.com', 'hotmail.com',
  'live.com', 'msn.com', 'rediffmail.com', 'rediff.com', 'proton.me', 'protonmail.com', 'icloud.com', 'me.com',
  'aol.com', 'mail.com', 'yandex.com', 'yandex.ru', 'gmx.com', 'gmx.net', 'zoho.com', 'tutanota.com', 'inbox.com',
]);

export function isFreeMailDomain(domain: string): boolean {
  return FREE_MAIL.has(domain.toLowerCase());
}

const DLT = /^(?:([a-z]{2})-)?([a-z0-9]{6})(?:-([spgt]))?$/i;

export function parseSender(raw: string | undefined, locale: Locale): SenderInfo {
  if (!raw || !raw.trim()) return { raw: '', kind: 'none' };
  const s = cleanIdentifier(raw);
  const angle = /<([^<>\s]+@[^<>\s]+)>/.exec(s);
  const emailText = angle ? angle[1] : /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(s) ? s : '';
  if (emailText) {
    const email = emailText.toLowerCase();
    const domain = email.slice(email.lastIndexOf('@') + 1);
    const info: SenderInfo = { raw: s, kind: 'email', email, emailDomain: domain, freeEmail: FREE_MAIL.has(domain) };
    const brand = officialBrandForHost(domain);
    if (brand) info.brand = brand;
    if (angle) {
      const name = s.slice(0, angle.index).replace(/["']/g, '').trim();
      if (name) info.displayName = name;
    }
    return info;
  }
  const m = DLT.exec(s);
  if (m) {
    const header = (m[2] as string).toUpperCase();
    const brand = brandForSmsHeader(header);
    // Without the XX- prefix, only accept headers we know (a 6-letter word is not a header).
    if (m[1] || brand) {
      const info: SenderInfo = { raw: s, kind: 'dlt', header };
      if (brand) info.brand = brand;
      return info;
    }
  }
  const digits = s.replace(/\D/g, '');
  if (/^[+\d][\d\s().-]*$/.test(s) && digits.length >= 3) {
    return { raw: s, kind: 'phone', phone: analyzePhone(s, locale) };
  }
  return { raw: s, kind: 'name', displayName: s };
}

/** Flags derived from the sender, for rule evaluation. */
export function senderFlags(info: SenderInfo): string[] {
  const out: string[] = [];
  if (info.kind === 'dlt') {
    out.push('s_dlt');
    if (info.brand) out.push('s_brand');
  } else if (info.kind === 'phone' && info.phone) {
    const k = info.phone.kind;
    if (k === 'mobile') out.push('s_mobile');
    if (k === 'international') {
      out.push('s_intl');
      if (isHighRiskCountry(info.phone.country)) out.push('s_intl_risky');
    }
    if (k === 'service_1600') out.push('s_1600');
    if (k === 'telemarketing_140') out.push('s_140');
  } else if (info.kind === 'email' && info.freeEmail) {
    out.push('s_freemail');
  }
  return out;
}
