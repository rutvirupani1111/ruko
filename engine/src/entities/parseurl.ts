/**
 * URL parsing only (no risk analysis), kept in its own module so light
 * consumers such as identifierHash() do not pull the brand data or i18n.
 */
import { cleanIdentifier } from '../normalize';

export interface ParsedUrl {
  scheme: string;
  userinfo: string;
  /** Lowercase host without trailing dot (may contain Unicode). */
  host: string;
  port: string;
  /** Path with leading slash, original case. */
  path: string;
  query: string;
  fragment: string;
  isIp: boolean;
}

const IPV4 = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const INT_IP = /^(?:0x[0-9a-f]{6,8}|\d{8,10})$/;

/** Parse a URL or bare domain. Returns null when there is no usable host. */
export function parseUrl(input: string): ParsedUrl | null {
  let s = cleanIdentifier(input);
  if (!s) return null;
  s = s.replace(/^h(?:xx|\*\*)p/i, 'http');
  let scheme = '';
  const m = /^([a-z][a-z0-9+.-]*):/i.exec(s);
  if (m) {
    const sc = (m[1] as string).toLowerCase();
    if (sc === 'data' || sc === 'javascript' || sc === 'vbscript') {
      return { scheme: sc, userinfo: '', host: '', port: '', path: s.slice(sc.length + 1), query: '', fragment: '', isIp: false };
    }
    const after = s.slice(m[0].length);
    if (after.startsWith('//') || after.startsWith('\\\\')) {
      scheme = sc;
      s = after.slice(2);
    }
  } else if (s.startsWith('//')) {
    s = s.slice(2);
  }
  const end = s.search(/[/?#\\]/);
  const authority = end < 0 ? s : s.slice(0, end);
  let rest = end < 0 ? '' : s.slice(end).replace(/\\/g, '/');
  const at = authority.lastIndexOf('@');
  const userinfo = at >= 0 ? authority.slice(0, at) : '';
  const hostport = at >= 0 ? authority.slice(at + 1) : authority;
  let host = hostport;
  let port = '';
  if (hostport.startsWith('[')) {
    const close = hostport.indexOf(']');
    host = close > 0 ? hostport.slice(0, close + 1) : hostport;
    const p = close > 0 ? hostport.slice(close + 1) : '';
    if (p.startsWith(':')) port = p.slice(1);
  } else {
    const colon = hostport.lastIndexOf(':');
    if (colon >= 0 && /^\d*$/.test(hostport.slice(colon + 1))) {
      port = hostport.slice(colon + 1);
      host = hostport.slice(0, colon);
    }
  }
  host = host.toLowerCase().replace(/\.+$/, '');
  if (!host || /[\s<>"'`]/.test(host)) return null;
  let fragment = '';
  const hashI = rest.indexOf('#');
  if (hashI >= 0) {
    fragment = rest.slice(hashI + 1);
    rest = rest.slice(0, hashI);
  }
  let query = '';
  const qI = rest.indexOf('?');
  if (qI >= 0) {
    query = rest.slice(qI + 1);
    rest = rest.slice(0, qI);
  }
  const isIp = IPV4.test(host) || INT_IP.test(host) || host.startsWith('[');
  if (!isIp && host.indexOf('.') < 0 && host !== 'localhost') return null;
  return { scheme, userinfo, host, port, path: rest || '/', query, fragment, isIp };
}
