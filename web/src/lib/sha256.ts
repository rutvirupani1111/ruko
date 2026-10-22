/**
 * Small, fast synchronous SHA-256 (FIPS 180-4) for the proof-of-work solver.
 * WebCrypto's digest() is async per call, far too slow for ~260k attempts,
 * so the worker hashes with this instead. Verified against WebCrypto in tests.
 */

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01,
  0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
  0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08,
  0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

const INIT = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];

const W = new Uint32Array(64);

/** Process one 64-byte block at `offset` of `bytes`, updating `state` in place. */
export function compress(state: Uint32Array, bytes: Uint8Array, offset: number): void {
  for (let i = 0; i < 16; i++) {
    const j = offset + i * 4;
    W[i] = (bytes[j]! << 24) | (bytes[j + 1]! << 16) | (bytes[j + 2]! << 8) | bytes[j + 3]!;
  }
  for (let i = 16; i < 64; i++) {
    const w15 = W[i - 15]!;
    const w2 = W[i - 2]!;
    const s0 = ((w15 >>> 7) | (w15 << 25)) ^ ((w15 >>> 18) | (w15 << 14)) ^ (w15 >>> 3);
    const s1 = ((w2 >>> 17) | (w2 << 15)) ^ ((w2 >>> 19) | (w2 << 13)) ^ (w2 >>> 10);
    W[i] = (W[i - 16]! + s0 + W[i - 7]! + s1) | 0;
  }
  let a = state[0]!;
  let b = state[1]!;
  let c = state[2]!;
  let d = state[3]!;
  let e = state[4]!;
  let f = state[5]!;
  let g = state[6]!;
  let h = state[7]!;
  for (let i = 0; i < 64; i++) {
    const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
    const ch = (e & f) ^ (~e & g);
    const t1 = (h + S1 + ch + K[i]! + W[i]!) | 0;
    const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
    const maj = (a & b) ^ (a & c) ^ (b & c);
    const t2 = (S0 + maj) | 0;
    h = g;
    g = f;
    f = e;
    e = (d + t1) | 0;
    d = c;
    c = b;
    b = a;
    a = (t1 + t2) | 0;
  }
  state[0] = (state[0]! + a) | 0;
  state[1] = (state[1]! + b) | 0;
  state[2] = (state[2]! + c) | 0;
  state[3] = (state[3]! + d) | 0;
  state[4] = (state[4]! + e) | 0;
  state[5] = (state[5]! + f) | 0;
  state[6] = (state[6]! + g) | 0;
  state[7] = (state[7]! + h) | 0;
}

/** Append SHA-256 padding for a message of `totalLength` bytes whose tail is `tail`. */
function padTail(tail: Uint8Array, totalLength: number): Uint8Array {
  const blocks = tail.length + 9 <= 64 ? 1 : 2;
  const out = new Uint8Array(blocks * 64);
  out.set(tail);
  out[tail.length] = 0x80;
  const bits = totalLength * 8;
  const hi = Math.floor(bits / 0x100000000);
  const lo = bits >>> 0;
  const end = out.length;
  out[end - 8] = (hi >>> 24) & 0xff;
  out[end - 7] = (hi >>> 16) & 0xff;
  out[end - 6] = (hi >>> 8) & 0xff;
  out[end - 5] = hi & 0xff;
  out[end - 4] = (lo >>> 24) & 0xff;
  out[end - 3] = (lo >>> 16) & 0xff;
  out[end - 2] = (lo >>> 8) & 0xff;
  out[end - 1] = lo & 0xff;
  return out;
}

export function sha256(bytes: Uint8Array): Uint8Array {
  const state = new Uint32Array(INIT);
  const full = Math.floor(bytes.length / 64);
  for (let i = 0; i < full; i++) compress(state, bytes, i * 64);
  const tail = padTail(bytes.subarray(full * 64), bytes.length);
  for (let off = 0; off < tail.length; off += 64) compress(state, tail, off);
  const out = new Uint8Array(32);
  for (let i = 0; i < 8; i++) {
    out[i * 4] = state[i]! >>> 24;
    out[i * 4 + 1] = (state[i]! >>> 16) & 0xff;
    out[i * 4 + 2] = (state[i]! >>> 8) & 0xff;
    out[i * 4 + 3] = state[i]! & 0xff;
  }
  return out;
}

export function toHex(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += bytes[i]!.toString(16).padStart(2, '0');
  return s;
}

export function asciiBytes(text: string): Uint8Array {
  const out = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c > 0x7f) throw new Error('asciiBytes: non-ASCII input');
    out[i] = c;
  }
  return out;
}

/** Number of leading zero bits in a digest. */
export function leadingZeroBits(digest: Uint8Array): number {
  let bits = 0;
  for (let i = 0; i < digest.length; i++) {
    const byte = digest[i]!;
    if (byte === 0) {
      bits += 8;
      continue;
    }
    bits += Math.clz32(byte) - 24;
    break;
  }
  return bits;
}

/**
 * Find the smallest nonce >= `start` such that SHA-256(`${prefix}${nonce}`) has
 * `difficulty` leading zero bits. The full 64-byte blocks of the prefix are
 * hashed once (midstate) so each attempt costs one or two compressions.
 */
export function solvePow(
  prefix: string,
  difficulty: number,
  options: { start?: number; maxTries?: number; onProgress?: (tries: number) => boolean | void } = {},
): number | null {
  const { start = 0, maxTries = 1 << 30, onProgress } = options;
  const prefixBytes = asciiBytes(prefix);
  const fullBlocks = Math.floor(prefixBytes.length / 64);
  const mid = new Uint32Array(INIT);
  for (let i = 0; i < fullBlocks; i++) compress(mid, prefixBytes, i * 64);
  const rest = prefixBytes.subarray(fullBlocks * 64);

  const state = new Uint32Array(8);
  const tail = new Uint8Array(128);
  tail.set(rest);
  const digits = new Uint8Array(20);

  for (let tries = 0, nonce = start; tries < maxTries; tries++, nonce++) {
    // Write the nonce's decimal digits after the prefix tail.
    let n = nonce;
    let len = 0;
    do {
      digits[len++] = 48 + (n % 10);
      n = Math.floor(n / 10);
    } while (n > 0);
    let pos = rest.length;
    for (let i = len - 1; i >= 0; i--) tail[pos++] = digits[i]!;
    const tailLen = pos;
    const total = prefixBytes.length + len;
    const blocks = tailLen + 9 <= 64 ? 1 : 2;
    const end = blocks * 64;
    tail[tailLen] = 0x80;
    tail.fill(0, tailLen + 1, end);
    const bits = total * 8;
    tail[end - 4] = (bits >>> 24) & 0xff;
    tail[end - 3] = (bits >>> 16) & 0xff;
    tail[end - 2] = (bits >>> 8) & 0xff;
    tail[end - 1] = bits & 0xff;

    state.set(mid);
    compress(state, tail, 0);
    if (blocks === 2) compress(state, tail, 64);

    // Count leading zero bits straight from the state words.
    let zeros = Math.clz32(state[0]!);
    if (zeros === 32) {
      zeros += Math.clz32(state[1]!);
      if (zeros === 64) zeros += Math.clz32(state[2]!);
    }
    if (zeros >= difficulty) return nonce;

    if (onProgress && (tries & 0x3fff) === 0x3fff && onProgress(tries + 1) === false) return null;
  }
  return null;
}
