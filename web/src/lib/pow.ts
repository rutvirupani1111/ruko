import { sha256HexSync } from '@ruko/engine';

/**
 * Proof-of-work for community reports, built on the engine's synchronous
 * SHA-256 (`sha256HexSync`, pure JS: WebCrypto's per-call promise overhead
 * would dominate a loop of ~260k hashes).
 *
 * The server accepts a report when SHA-256(`${hash}:${issuedAt}:${nonce}`)
 * starts with `difficulty` zero bits. Runs inside `pow.worker.ts` so the page
 * stays responsive on low-end phones.
 */

/** Number of leading zero bits of a hex digest. */
export function leadingZeroBitsHex(hex: string): number {
  let bits = 0;
  for (let i = 0; i < hex.length; i++) {
    const nibble = parseInt(hex[i]!, 16);
    if (Number.isNaN(nibble)) break;
    if (nibble === 0) {
      bits += 4;
      continue;
    }
    bits += Math.clz32(nibble) - 28;
    break;
  }
  return bits;
}

/** How many attempts a solve needs on average. */
export function expectedTries(difficulty: number): number {
  return 2 ** difficulty;
}

/**
 * A progress estimate in [0, 1): the chance that a solution would have turned
 * up after `tries` attempts. Honest about the randomness: it slows down near
 * the end instead of claiming a finish line.
 */
export function powProgress(tries: number, difficulty: number): number {
  return 1 - Math.exp(-tries / expectedTries(difficulty));
}

export interface SolveOptions {
  start?: number;
  maxTries?: number;
  /** How often `onProgress` fires, in attempts. */
  progressEvery?: number;
  /** Return false to stop early. */
  onProgress?: (tries: number) => boolean | void;
}

/**
 * Find the smallest nonce >= `start` such that SHA-256(`${prefix}${nonce}`) has
 * at least `difficulty` leading zero bits. Returns null when stopped or out of tries.
 */
export function solvePow(prefix: string, difficulty: number, options: SolveOptions = {}): number | null {
  const { start = 0, maxTries = 2 ** 31, progressEvery = 4096, onProgress } = options;
  // Whole zero hex characters needed, then the bits of the next character.
  const zeroChars = Math.floor(difficulty / 4);
  const restBits = difficulty % 4;
  const zeros = '0'.repeat(zeroChars);
  const limit = 16 >> restBits; // next nibble must be < limit

  for (let tries = 0, nonce = start; tries < maxTries; tries++, nonce++) {
    const hex = sha256HexSync(prefix + nonce);
    if (hex.startsWith(zeros) && (restBits === 0 || parseInt(hex[zeroChars]!, 16) < limit)) return nonce;
    if (onProgress && (tries + 1) % progressEvery === 0 && onProgress(tries + 1) === false) return null;
  }
  return null;
}
