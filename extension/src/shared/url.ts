/** URL helpers shared by content scripts, background and pages. No engine code here. */

export function safeUrl(href: string, base?: string): URL | null {
  try {
    return new URL(href, base);
  } catch {
    return null;
  }
}

export function hostOf(href: string): string {
  return safeUrl(href)?.hostname.toLowerCase() ?? '';
}

/** "www.example.com" -> "example.com". Used as the key for per-site choices. */
export function siteKey(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, '').replace(/\.$/, '');
}

export function isHttpUrl(href: string): boolean {
  return /^https?:\/\//i.test(href.trim());
}

export function isUpiHref(href: string | null | undefined): boolean {
  return !!href && /^\s*upi:/i.test(href);
}

export function isWhatsAppHost(hostname: string): boolean {
  return siteKey(hostname) === 'web.whatsapp.com';
}

export function isGmailHost(hostname: string): boolean {
  return siteKey(hostname) === 'mail.google.com';
}

/** Hosts that are only ever a redirect wrapper around the real destination. */
const REDIRECT_PARAMS: Array<{ test: (u: URL) => boolean; param: string }> = [
  // Gmail and Google Search wrap outgoing links.
  { test: (u) => /(^|\.)google\.[a-z.]+$/.test(u.hostname) && u.pathname === '/url', param: 'q' },
  { test: (u) => /(^|\.)google\.[a-z.]+$/.test(u.hostname) && u.pathname === '/url', param: 'url' },
  // Facebook / Instagram / Messenger link shims.
  { test: (u) => /^(l|lm)\.facebook\.com$/.test(u.hostname), param: 'u' },
  { test: (u) => u.hostname === 'l.instagram.com', param: 'u' },
  { test: (u) => u.hostname === 'l.messenger.com', param: 'u' },
  // Outlook Safe Links.
  { test: (u) => u.hostname.endsWith('.safelinks.protection.outlook.com'), param: 'url' },
  // LinkedIn and YouTube redirects.
  { test: (u) => u.hostname === 'www.linkedin.com' && u.pathname.startsWith('/redir/redirect'), param: 'url' },
  { test: (u) => /(^|\.)youtube\.com$/.test(u.hostname) && u.pathname === '/redirect', param: 'q' },
];

/**
 * Returns the real destination of well-known redirect wrappers (Gmail's google.com/url?q=,
 * Facebook's l.php?u=, Outlook Safe Links...). Unknown links are returned unchanged.
 */
export function unwrapRedirect(href: string, depth = 0): string {
  const url = safeUrl(href);
  if (!url || depth > 3) return href;
  for (const rule of REDIRECT_PARAMS) {
    if (!rule.test(url)) continue;
    const target = url.searchParams.get(rule.param);
    if (target && (isHttpUrl(target) || isUpiHref(target))) return unwrapRedirect(target, depth + 1);
  }
  return href;
}

/** Shortens long URLs for display without hiding the host. */
export function displayUrl(href: string, max = 60): string {
  const url = safeUrl(href);
  const text = url ? `${url.hostname}${url.pathname === '/' ? '' : url.pathname}` : href;
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
