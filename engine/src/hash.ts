/**
 * Identifier normalisation and hashing for privacy-preserving community
 * lookups (k-anonymity: clients send only the first 5 hex characters).
 *
 * Depends only on the small parsers (no rules, brand data or i18n), so
 * importing identifierHash alone stays a few KB.
 */
import type { IdentifierKind } from './types';
import { cleanIdentifier } from './normalize';
import { parseUrl } from './entities/parseurl';
import { parseUpiParams } from './entities/upiparse';
import { classify } from './entities/phoneparse';
import { hostToAscii } from './domains/punycode';
import { splitHost } from './domains/psl';
import { sha256Hex } from './sha256';

function normalizeHost(host: string): string {
  return hostToAscii(host.toLowerCase()).replace(/\.+$/, '').replace(/^www\d{0,3}\./, '');
}

/**
 * Canonical form of an identifier:
 * - upi: lowercase VPA (a `upi://` link is reduced to its payee)
 * - phone: E.164 digits without the plus, Indian numbers default to 91 (`919876543210`)
 * - url: lowercase host (punycode, no `www.`) + path, without scheme, query or fragment
 * - domain: registrable domain (`sbi-kyc.web.app`, `kyc-update.top`)
 * - email: lowercase address
 */
export function normalizeIdentifier(kind: IdentifierKind, value: string): string {
  const v = cleanIdentifier(typeof value === 'string' ? value : '');
  switch (kind) {
    case 'upi': {
      if (/^[a-z]+:\/\//i.test(v)) {
        const payee = (parseUpiParams(v)?.params.get('pa') ?? '').toLowerCase();
        if (payee) return payee;
      }
      return v.toLowerCase().replace(/\s+/g, '');
    }
    case 'phone': {
      const c = classify(v);
      return (c && c.kind !== 'unknown' ? c.e164 : v).replace(/\D/g, '');
    }
    case 'url': {
      const p = parseUrl(v);
      if (!p || !p.host) return v.toLowerCase();
      let path = p.path || '/';
      try {
        path = decodeURI(path);
      } catch {
        // keep the raw path
      }
      path = path.replace(/\/+$/, '');
      const port = p.port && p.port !== '80' && p.port !== '443' ? ':' + p.port : '';
      return normalizeHost(p.host) + port + path;
    }
    case 'domain': {
      const p = parseUrl(v);
      const host = p && p.host ? p.host : v.toLowerCase();
      return splitHost(normalizeHost(host)).registrable;
    }
    case 'email':
      return v.toLowerCase();
    default:
      return v.toLowerCase();
  }
}

/** SHA-256 hex of `${kind}:${normalized}` (WebCrypto, with a pure-JS fallback). */
export async function identifierHash(kind: IdentifierKind, value: string): Promise<string> {
  return sha256Hex(`${kind}:${normalizeIdentifier(kind, value)}`);
}

/** Split a hash for a k-anonymity range query: send `prefix`, match `suffix` locally. */
export function hashPrefix(hash: string, length = 5): { prefix: string; suffix: string } {
  const h = hash.toLowerCase();
  return { prefix: h.slice(0, length), suffix: h.slice(length) };
}
