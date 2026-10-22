/**
 * Minimal RFC 3492 Punycode for IDN labels (no dependencies, works in every
 * runtime). Used to turn `xn--` hosts into Unicode for homoglyph checks and
 * Unicode hosts into ASCII for stable identifiers.
 */

const BASE = 36;
const TMIN = 1;
const TMAX = 26;
const SKEW = 38;
const DAMP = 700;
const INITIAL_BIAS = 72;
const INITIAL_N = 128;
const MAXINT = 0x7fffffff;

function adapt(delta: number, numPoints: number, firstTime: boolean): number {
  let d = firstTime ? Math.floor(delta / DAMP) : delta >> 1;
  d += Math.floor(d / numPoints);
  let k = 0;
  while (d > ((BASE - TMIN) * TMAX) >> 1) {
    d = Math.floor(d / (BASE - TMIN));
    k += BASE;
  }
  return k + Math.floor(((BASE - TMIN + 1) * d) / (d + SKEW));
}

function basicToDigit(c: number): number {
  if (c >= 48 && c <= 57) return c - 22;
  if (c >= 65 && c <= 90) return c - 65;
  if (c >= 97 && c <= 122) return c - 97;
  return BASE;
}

function digitToBasic(d: number): string {
  return String.fromCharCode(d < 26 ? d + 97 : d + 22);
}

/** Decode one Punycode label (without the `xn--` prefix). Returns null when invalid. */
export function decodeLabel(input: string): string | null {
  const output: number[] = [];
  let i = 0;
  let n = INITIAL_N;
  let bias = INITIAL_BIAS;
  let basic = input.lastIndexOf('-');
  if (basic < 0) basic = 0;
  for (let j = 0; j < basic; j++) {
    const c = input.charCodeAt(j);
    if (c >= 0x80) return null;
    output.push(c);
  }
  for (let index = basic > 0 ? basic + 1 : 0; index < input.length; ) {
    const oldi = i;
    let w = 1;
    for (let k = BASE; ; k += BASE) {
      if (index >= input.length) return null;
      const digit = basicToDigit(input.charCodeAt(index++));
      if (digit >= BASE) return null;
      if (digit > Math.floor((MAXINT - i) / w)) return null;
      i += digit * w;
      const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias;
      if (digit < t) break;
      const baseMinusT = BASE - t;
      if (w > Math.floor(MAXINT / baseMinusT)) return null;
      w *= baseMinusT;
    }
    const out = output.length + 1;
    bias = adapt(i - oldi, out, oldi === 0);
    if (Math.floor(i / out) > MAXINT - n) return null;
    n += Math.floor(i / out);
    i %= out;
    output.splice(i++, 0, n);
  }
  try {
    return String.fromCodePoint(...output);
  } catch {
    return null;
  }
}

/** Encode one Unicode label to Punycode (without the `xn--` prefix). */
export function encodeLabel(input: string): string {
  const cps: number[] = [];
  for (const ch of Array.from(input)) cps.push(ch.codePointAt(0) as number);
  let n = INITIAL_N;
  let delta = 0;
  let bias = INITIAL_BIAS;
  let output = '';
  for (const c of cps) if (c < 0x80) output += String.fromCharCode(c);
  const basicLength = output.length;
  let handled = basicLength;
  if (basicLength > 0) output += '-';
  while (handled < cps.length) {
    let m = MAXINT;
    for (const c of cps) if (c >= n && c < m) m = c;
    delta += (m - n) * (handled + 1);
    n = m;
    for (const c of cps) {
      if (c < n) delta++;
      if (c === n) {
        let q = delta;
        for (let k = BASE; ; k += BASE) {
          const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias;
          if (q < t) break;
          output += digitToBasic(t + ((q - t) % (BASE - t)));
          q = Math.floor((q - t) / (BASE - t));
        }
        output += digitToBasic(q);
        bias = adapt(delta, handled + 1, handled === basicLength);
        delta = 0;
        handled++;
      }
    }
    delta++;
    n++;
  }
  return output;
}

/** Convert every `xn--` label of a host to Unicode (invalid labels are kept as-is). */
export function hostToUnicode(host: string): string {
  if (host.indexOf('xn--') < 0) return host;
  return host
    .split('.')
    .map((label) => {
      if (!label.startsWith('xn--')) return label;
      const decoded = decodeLabel(label.slice(4));
      return decoded === null ? label : decoded;
    })
    .join('.');
}

/** Convert every non-ASCII label of a host to `xn--` Punycode. */
export function hostToAscii(host: string): string {
  // eslint-disable-next-line no-control-regex
  if (/^[\x00-\x7f]*$/.test(host)) return host;
  return host
    .split('.')
    // eslint-disable-next-line no-control-regex
    .map((label) => (/^[\x00-\x7f]*$/.test(label) ? label : 'xn--' + encodeLabel(label)))
    .join('.');
}
