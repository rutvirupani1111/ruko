/**
 * Fast, non-cryptographic 53-bit string hash (cyrb53, public domain). Used only as a
 * cache key for "have we analysed this exact text before". Never used for privacy:
 * community lookups use the engine's SHA-256 `identifierHash` instead.
 */
export function cyrb53(input: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

/** Cache key for a piece of text plus the context that changes its verdict. */
export function textKey(...parts: Array<string | undefined | null>): string {
  return cyrb53(parts.map((p) => p ?? '').join('\u0000')).toString(36);
}
