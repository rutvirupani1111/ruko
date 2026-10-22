/**
 * Small helpers for consumers (the extension uses these to skip official
 * sites quickly and to offer a "go to the real site" button).
 */
import { brandById, isUserContentHost, officialBrandForHost } from './domains/brands';
import { splitHost } from './domains/psl';
import { hostToAscii } from './domains/punycode';

/** True when `host` is an official brand or government domain (user-content platforms excluded). */
export function isOfficialHost(host: string): boolean {
  const h = hostToAscii(String(host || '').toLowerCase().trim()).replace(/\.+$/, '').replace(/^www\d{0,3}\./, '');
  if (!h || isUserContentHost(h)) return false;
  if (officialBrandForHost(h)) return true;
  const parts = splitHost(h);
  return parts.suffix === 'gov.in' || parts.suffix === 'nic.in' || parts.suffix === 'bank.in' || parts.suffix === 'fin.in' || (parts.tld === 'sbi' && parts.label !== '');
}

/** Official domains of a brand by registry id (e.g. 'sbi', 'hdfc', 'irctc'). Empty when unknown. */
export function officialDomainsFor(brandId: string): string[] {
  const b = brandById(brandId);
  return b ? b.domains.slice() : [];
}
