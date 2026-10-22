// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { sha256HexSync } from '@ruko/engine';
import { leadingZeroBitsHex, powProgress, solvePow } from './pow';

/** Independent reference: WebCrypto. */
async function webSha(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

describe('proof-of-work', () => {
  it('uses a SHA-256 that matches WebCrypto', async () => {
    for (const text of ['', 'abc', 'a'.repeat(64) + ':1761190000000:12345', 'upi:fraud.kyc@ybl']) {
      expect(sha256HexSync(text)).toBe(await webSha(text));
    }
  });

  it('counts leading zero bits of a hex digest', () => {
    expect(leadingZeroBitsHex('f0')).toBe(0);
    expect(leadingZeroBitsHex('7f')).toBe(1);
    expect(leadingZeroBitsHex('1f')).toBe(3);
    expect(leadingZeroBitsHex('0f')).toBe(4);
    expect(leadingZeroBitsHex('0003ff')).toBe(14);
    expect(leadingZeroBitsHex('00000000')).toBe(32);
  });

  it('finds the first nonce with enough leading zero bits', async () => {
    const prefix = `${'ab'.repeat(32)}:1761190000000:`;
    for (const difficulty of [6, 9, 11]) {
      const nonce = solvePow(prefix, difficulty);
      expect(nonce).not.toBeNull();
      expect(leadingZeroBitsHex(await webSha(prefix + nonce))).toBeGreaterThanOrEqual(difficulty);
      for (let n = 0; n < nonce!; n++) expect(leadingZeroBitsHex(sha256HexSync(prefix + n))).toBeLessThan(difficulty);
    }
  });

  it('reports progress and can be stopped', () => {
    const seen: number[] = [];
    const result = solvePow('stop-me:', 40, {
      progressEvery: 100,
      onProgress: (tries) => {
        seen.push(tries);
        return tries < 300;
      },
    });
    expect(result).toBeNull();
    expect(seen).toEqual([100, 200, 300]);
  });

  it('estimates progress without ever claiming to be done', () => {
    expect(powProgress(0, 18)).toBe(0);
    expect(powProgress(2 ** 18, 18)).toBeCloseTo(0.632, 2);
    expect(powProgress(2 ** 22, 18)).toBeLessThan(1);
  });
});
