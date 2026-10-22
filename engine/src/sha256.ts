/**
 * SHA-256. `sha256Hex` uses WebCrypto when available (browsers, Node 19+,
 * workers, MV3 service workers) and falls back to a small pure-JS
 * implementation (Node 18 without the global, or insecure contexts).
 * `sha256HexSync` is always pure JS: handy for proof-of-work loops where
 * per-call WebCrypto overhead dominates.
 *
 * The pure-JS path is tuned for that loop (the web app hashes a ~90-byte string
 * about 2^18 times per report): one shared TextEncoder writes straight into a
 * reused block buffer that is padded in place, the message schedule and the
 * state are reused Int32Arrays, the rounds run on int32 locals, and the hex
 * digest comes from a char-code table in a single String.fromCharCode call.
 * Nothing is allocated per call but the result. Inputs too big for the shared
 * buffer get a buffer of their own, so a one-off large hash is not kept alive.
 */

/** Shared message buffer size in bytes (inputs up to 1,341 UTF-16 units fit). */
const KEEP = 4096;
const HEX = '0123456789abcdef';

// All built on first use (no work at import time, see docs/ARCHITECTURE.md).
let K: Int32Array | null = null; // round constants
let W: Int32Array; // message schedule, 64 words
let S: Int32Array; // hash state, 8 words
let M: Uint8Array; // shared message buffer, KEEP bytes
let CODES: number[]; // char codes of one hex digest
let ENC: TextEncoder | null;

/**
 * Round constants: the first 32 bits of the fractional parts of the cube roots
 * of the first 64 primes. Computed once instead of shipping the 64-entry table
 * (checked against the FIPS 180-4 values in the tests via known digests).
 */
function setup(): Int32Array {
  if (!K) {
    const k = new Int32Array(64);
    for (let n = 2, i = 0; i < 64; n++) {
      let prime = true;
      for (let d = 2; d * d <= n; d++) {
        if (n % d === 0) {
          prime = false;
          break;
        }
      }
      if (prime) k[i++] = ((Math.cbrt(n) % 1) * 0x100000000) | 0;
    }
    W = new Int32Array(64);
    S = new Int32Array(8);
    M = new Uint8Array(KEEP);
    CODES = [];
    ENC = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
    K = k;
  }
  return K;
}

/** UTF-8 without TextEncoder, into `out` (needs 3 bytes per UTF-16 unit). Returns the byte count. */
function utf8Into(text: string, out: Uint8Array): number {
  let n = 0;
  for (const ch of text) {
    const c = ch.codePointAt(0)!;
    // Continuation bytes; the lead byte is 110xxxxx, 1110xxxx or 11110xxx (stores keep the low 8 bits).
    const extra = c < 0x80 ? 0 : c < 0x800 ? 1 : c < 0x10000 ? 2 : 3;
    out[n++] = extra ? (0xf0 << (3 - extra)) | (c >> (6 * extra)) : c;
    for (let sh = 6 * extra - 6; sh >= 0; sh -= 6) out[n++] = 0x80 | ((c >> sh) & 63);
  }
  return n;
}

function utf8(text: string) {
  setup();
  if (ENC) return new Uint8Array(ENC.encode(text));
  const out = new Uint8Array(text.length * 3);
  return out.slice(0, utf8Into(text, out));
}

/** Pads the `n` message bytes at the start of `m` in place and hashes them into S. */
function digest(m: Uint8Array, n: number): void {
  const k = setup();
  const w = W;
  // Whole 64-byte blocks: message, 0x80, zeros, 64-bit big-endian bit length.
  const total = Math.ceil((n + 9) / 64) * 64;
  m[n] = 0x80;
  for (let i = n + 1; i < total - 8; i++) m[i] = 0;
  const hi = Math.floor(n / 0x20000000);
  const lo = n << 3;
  for (let i = 0; i < 4; i++) {
    m[total - 8 + i] = hi >>> (24 - 8 * i);
    m[total - 4 + i] = lo >>> (24 - 8 * i);
  }

  // Int32Array stores wrap modulo 2^32, so `s[i] += x` is the SHA-256 addition.
  const s = S;
  s[0] = 0x6a09e667;
  s[1] = 0xbb67ae85;
  s[2] = 0x3c6ef372;
  s[3] = 0xa54ff53a;
  s[4] = 0x510e527f;
  s[5] = 0x9b05688c;
  s[6] = 0x1f83d9ab;
  s[7] = 0x5be0cd19;
  for (let p = 0; p < total; p += 64) {
    for (let i = 0, j = p; i < 16; i++, j += 4) w[i] = (m[j]! << 24) | (m[j + 1]! << 16) | (m[j + 2]! << 8) | m[j + 3]!;
    for (let i = 16; i < 64; i++) {
      const x = w[i - 15]!;
      const y = w[i - 2]!;
      const s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
      const s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
      w[i] = (w[i - 16]! + s0 + w[i - 7]! + s1) | 0;
    }
    let a = s[0]!;
    let b = s[1]!;
    let c = s[2]!;
    let d = s[3]!;
    let e = s[4]!;
    let f = s[5]!;
    let g = s[6]!;
    let h = s[7]!;
    for (let i = 0; i < 64; i++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const t1 = (h + S1 + (g ^ (e & (f ^ g))) + k[i]! + w[i]!) | 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const t2 = (S0 + ((a & b) | (c & (a | b)))) | 0;
      h = g;
      g = f;
      f = e;
      e = (d + t1) | 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) | 0;
    }
    s[0] += a;
    s[1] += b;
    s[2] += c;
    s[3] += d;
    s[4] += e;
    s[5] += f;
    s[6] += g;
    s[7] += h;
  }
}

/** Hex of the state words in S, from a char-code table, as one flat string. */
function toHex(): string {
  const c = CODES;
  for (let i = 0, j = 0; i < 8; i++) {
    const v = S[i]!;
    for (let sh = 28; sh >= 0; sh -= 4) c[j++] = HEX.charCodeAt((v >>> sh) & 15);
  }
  return String.fromCharCode.apply(null, c);
}

/** Pure-JS SHA-256 of raw bytes. */
export function sha256Bytes(data: Uint8Array): Uint8Array {
  setup();
  const n = data.length;
  const m = n + 72 <= KEEP ? M : new Uint8Array(Math.ceil((n + 9) / 64) * 64);
  m.set(data);
  digest(m, n);
  const out = new Uint8Array(32);
  const view = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) view.setInt32(i * 4, S[i]!);
  return out;
}

/** SHA-256 hex digest of a UTF-8 string, synchronously, in pure JS. */
export function sha256HexSync(text: string): string {
  setup();
  // TextEncoder semantics for callers that pass a non-string from plain JS.
  const str = typeof text === 'string' ? text : (text as unknown) === undefined ? '' : String(text);
  if (str.length * 3 + 72 <= KEEP) {
    // UTF-8 never takes more than 3 bytes per UTF-16 unit, so this always fits.
    const m = M;
    digest(m, ENC ? ENC.encodeInto(str, m).written : utf8Into(str, m));
  } else {
    sha256Bytes(utf8(str));
  }
  return toHex();
}

/** SHA-256 hex digest of a UTF-8 string (WebCrypto when available). */
export async function sha256Hex(text: string): Promise<string> {
  const subtle = typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle ? globalThis.crypto.subtle : null;
  if (subtle) {
    try {
      const view = new DataView(await subtle.digest('SHA-256', utf8(text)));
      for (let i = 0; i < 8; i++) S[i] = view.getInt32(i * 4);
      return toHex();
    } catch {
      // fall through to the JS implementation
    }
  }
  return sha256HexSync(text);
}
