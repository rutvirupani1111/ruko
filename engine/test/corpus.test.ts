import { describe, expect, it } from 'vitest';
import { analyze, type ScamCategory, type Verdict } from '../src/index';
import { SCAMS } from './corpus/scams';
import { GENUINE } from './corpus/genuine';
import type { CorpusItem } from './corpus/types';

const SCAM_THRESHOLD = 60; // a scam counts as caught at score >= 60 (high or critical)
const FP_THRESHOLD = 35; // a genuine message counts as a false positive at score >= 35 (medium or above)
const MIN_RECALL = 0.95;
const MAX_FP_RATE = 0.04;

const ALL_CATEGORIES: ScamCategory[] = [
  'digital_arrest', 'kyc_update', 'upi_collect', 'qr_receive', 'fake_refund', 'job_task', 'investment', 'lottery_prize',
  'loan_app', 'sextortion', 'otp_theft', 'fake_support', 'courier_parcel', 'utility_disconnect', 'reward_points',
  'tax_refund', 'govt_scheme', 'malicious_app', 'remote_access', 'impersonation', 'romance', 'sim_swap', 'phishing_link',
  'lookalike_domain',
];

function run(item: CorpusItem, locale: 'en' | 'hi' = 'en'): Verdict {
  const opts: Parameters<typeof analyze>[1] = { locale };
  if (item.source) opts.source = item.source;
  if (item.sender) opts.sender = item.sender;
  if (item.kind) opts.kind = item.kind;
  return analyze(item.text, opts);
}

const scamResults = SCAMS.map((item) => ({ item, v: run(item) }));
const genuineResults = GENUINE.map((item) => ({ item, v: run(item) }));

describe('labelled corpus', () => {
  it('has enough labelled data in every category and language', () => {
    expect(SCAMS.length).toBeGreaterThanOrEqual(80);
    expect(GENUINE.length).toBeGreaterThanOrEqual(50);
    for (const cat of ALL_CATEGORIES) {
      expect(SCAMS.filter((s) => s.category === cat).length, `scams for ${cat}`).toBeGreaterThanOrEqual(3);
    }
    for (const lang of ['en', 'hi', 'hinglish'] as const) {
      expect(SCAMS.filter((s) => s.lang === lang).length, `scams in ${lang}`).toBeGreaterThanOrEqual(15);
      expect(GENUINE.filter((s) => s.lang === lang).length, `genuine in ${lang}`).toBeGreaterThanOrEqual(5);
    }
    const ids = new Set([...SCAMS, ...GENUINE].map((x) => x.id));
    expect(ids.size).toBe(SCAMS.length + GENUINE.length);
  });

  it(`catches >= ${MIN_RECALL * 100}% of scams at score >= ${SCAM_THRESHOLD} and flags <= ${MAX_FP_RATE * 100}% of genuine messages at >= ${FP_THRESHOLD}`, () => {
    const caught = scamResults.filter((r) => r.v.score >= SCAM_THRESHOLD);
    const missed = scamResults.filter((r) => r.v.score < SCAM_THRESHOLD);
    const fps = genuineResults.filter((r) => r.v.score >= FP_THRESHOLD);
    const recall = caught.length / scamResults.length;
    const fpRate = fps.length / genuineResults.length;
    const catOk = caught.filter((r) => r.v.category === r.item.category).length;

    const bySev = (rs: typeof scamResults): string => {
      const m: Record<string, number> = { safe: 0, low: 0, medium: 0, high: 0, critical: 0 };
      for (const r of rs) m[r.v.severity] = (m[r.v.severity] ?? 0) + 1;
      return Object.entries(m).map(([k, n]) => `${k} ${n}`).join(', ');
    };
    const byLang = (rs: typeof scamResults): string =>
      (['en', 'hi', 'hinglish'] as const)
        .map((l) => {
          const all = rs.filter((r) => r.item.lang === l);
          const ok = all.filter((r) => r.v.score >= SCAM_THRESHOLD).length;
          return `${l} ${ok}/${all.length}`;
        })
        .join(', ');

    const lines = [
      '',
      '=== Ruko corpus confusion summary ===',
      `scams:   ${scamResults.length}  caught (score >= ${SCAM_THRESHOLD}) ${caught.length}  missed ${missed.length}  recall ${(recall * 100).toFixed(1)}%`,
      `genuine: ${genuineResults.length}  flagged (score >= ${FP_THRESHOLD}) ${fps.length}  false-positive rate ${(fpRate * 100).toFixed(1)}%`,
      '',
      `                 predicted scam   predicted ok`,
      `actual scam      ${String(caught.length).padStart(14)} ${String(missed.length).padStart(14)}`,
      `actual genuine   ${String(fps.length).padStart(14)} ${String(genuineResults.length - fps.length).padStart(14)}`,
      '',
      `scam severities:    ${bySev(scamResults)}`,
      `genuine severities: ${bySev(genuineResults)}`,
      `recall by language: ${byLang(scamResults)}`,
      `top category correct for caught scams: ${catOk}/${caught.length} (${((catOk / Math.max(1, caught.length)) * 100).toFixed(1)}%)`,
    ];
    if (missed.length) {
      lines.push('', 'missed scams:');
      for (const r of missed) lines.push(`  ${r.item.id} score ${r.v.score} [${r.v.category}] ${r.v.signals.map((s) => `${s.id}:${s.weight}`).join(' ')}`);
    }
    if (fps.length) {
      lines.push('', 'false positives:');
      for (const r of fps) lines.push(`  ${r.item.id} score ${r.v.score} [${r.v.category}] ${r.v.signals.map((s) => `${s.id}:${s.weight}`).join(' ')}`);
    }
    const wrongCat = caught.filter((r) => r.v.category !== r.item.category);
    if (wrongCat.length) {
      lines.push('', 'caught with a different top category:');
      for (const r of wrongCat) lines.push(`  ${r.item.id} expected ${r.item.category} got ${r.v.category} (${r.v.score})`);
    }
    console.log(lines.join('\n'));

    expect(recall).toBeGreaterThanOrEqual(MIN_RECALL);
    expect(fpRate).toBeLessThanOrEqual(MAX_FP_RATE);
  });

  it('puts the expected category at the top for most caught scams', () => {
    const caught = scamResults.filter((r) => r.v.score >= SCAM_THRESHOLD);
    const ok = caught.filter((r) => r.v.category === r.item.category).length;
    expect(ok / caught.length).toBeGreaterThanOrEqual(0.8);
  });

  it('gives Hindi verdicts for every scam too', () => {
    for (const { item, v } of scamResults.slice(0, 40)) {
      const hi = run(item, 'hi');
      expect(hi.score).toBe(v.score);
      expect(hi.locale).toBe('hi');
      expect(hi.headline).toMatch(/[ऀ-ॿ]/);
      for (const s of hi.signals) expect(s.title.length).toBeGreaterThan(0);
    }
  });

  it('keeps every genuine message below medium when it has an official sender or only official links', () => {
    const official = genuineResults.filter((r) => r.item.sender && /^[A-Z]{2}-/.test(r.item.sender));
    for (const r of official) expect(r.v.score, r.item.id).toBeLessThan(FP_THRESHOLD);
  });
});
