/** Noisy-OR combination of 0..100 weights: 100 * (1 - Π(1 - w/100)). Non-positive weights are ignored. */
export function combine(weights: readonly number[]): number {
  let keep = 1;
  for (const w of weights) {
    if (w > 0) keep *= 1 - Math.min(w, 100) / 100;
  }
  return 100 * (1 - keep);
}

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}
