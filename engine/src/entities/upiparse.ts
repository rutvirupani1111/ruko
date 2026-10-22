/**
 * `upi://` link parameter parsing only (no risk analysis), kept in its own
 * module so identifierHash() stays small.
 */

function decodePart(s: string): string {
  try {
    return decodeURIComponent(s.replace(/\+/g, ' '));
  } catch {
    return s;
  }
}

/** Split `upi://pay?pa=..&pn=..` (and app variants such as `tez://upi/pay`) into its action and lowercase-keyed params. */
export function parseUpiParams(s: string): { action: string; params: Map<string, string> } | null {
  const m = /^(upi|tez|gpay|phonepe|paytmmp|paytm|bhim|credpay):\/\/([^?#]*)\??([^#]*)/i.exec(s);
  if (!m) return null;
  const action = (m[2] as string).toLowerCase();
  const params = new Map<string, string>();
  for (const pair of (m[3] as string).split('&')) {
    if (!pair) continue;
    const eq = pair.indexOf('=');
    const k = (eq < 0 ? pair : pair.slice(0, eq)).toLowerCase();
    const val = eq < 0 ? '' : decodePart(pair.slice(eq + 1));
    if (!params.has(k)) params.set(k, val.trim());
  }
  return { action, params };
}
