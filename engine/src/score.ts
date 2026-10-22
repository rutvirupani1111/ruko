/**
 * Score combination.
 *
 *   raw   = 100 * (1 - Π(1 - w/100))         over positive weights (noisy-OR)
 *   score = max(raw - Σ|reassuring|, floor)   reassurance capped at 60
 *   floor = strongest single weight when it is >= 50 (hard evidence such as a
 *           lookalike domain or an OTP request cannot be argued away)
 *
 * Category scores use the same combination per category. Delivery signals
 * (links, generic pressure) also count towards a scam story category that has
 * evidence of its own, so "fake KYC SMS with a lookalike link" is headlined
 * as a KYC scam rather than just "a link".
 */
import type { ScamCategory, Severity, Signal } from './types';
import { clamp, combine } from './util';

/** safe < 15 <= low < 35 <= medium < 60 <= high < 80 <= critical */
export function severityFor(score: number): Severity {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 35) return 'medium';
  if (score >= 15) return 'low';
  return 'safe';
}

const DELIVERY = new Set<ScamCategory>(['phishing_link', 'lookalike_domain', 'malicious_app', 'other']);

export interface Scored {
  score: number;
  raw: number;
  category: ScamCategory | null;
  categories: Array<{ id: ScamCategory; score: number }>;
}

export function scoreSignals(signals: readonly Signal[]): Scored {
  const pos = signals.filter((s) => s.weight > 0);
  const raw = combine(pos.map((s) => s.weight));
  let reassure = 0;
  for (const s of signals) if (s.weight < 0) reassure -= s.weight;
  reassure = Math.min(reassure, 60);
  let maxW = 0;
  for (const s of pos) if (s.weight > maxW) maxW = s.weight;
  const floor = maxW >= 50 ? maxW : 0;
  const score = clamp(Math.round(Math.max(raw - reassure, floor, 0)), 0, 100);

  const own = new Map<ScamCategory, number[]>();
  for (const s of pos) {
    const list = own.get(s.category);
    if (list) list.push(s.weight);
    else own.set(s.category, [s.weight]);
  }
  const delivery: number[] = [];
  for (const s of pos) if (DELIVERY.has(s.category)) delivery.push(s.weight);
  const ratio = raw > 0 ? score / raw : 0;
  const categories: Array<{ id: ScamCategory; score: number }> = [];
  own.forEach((weights, id) => {
    let c = combine(weights);
    if (!DELIVERY.has(id) && c >= 25) c = combine(weights.concat(delivery));
    const v = Math.min(score, Math.round(c * ratio));
    if (v > 0) categories.push({ id, score: v });
  });
  categories.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const ad = DELIVERY.has(a.id) ? 1 : 0;
    const bd = DELIVERY.has(b.id) ? 1 : 0;
    return ad - bd;
  });
  let category: ScamCategory | null = null;
  if (score >= 15 && categories.length > 0) {
    const first = categories[0] as { id: ScamCategory; score: number };
    category = first.id;
    if (first.id === 'other') {
      const specific = categories.find((c) => c.id !== 'other');
      if (specific && specific.score >= first.score - 10) category = specific.id;
    }
  }
  return { score, raw: Math.round(raw), category, categories };
}
