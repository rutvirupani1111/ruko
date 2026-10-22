import { PREF, readJson, readPref, writeJson, writePref } from '@/lib/storage';
import type { Level } from './scenarios';

/** Points: 100 per correct answer plus a growing streak bonus (capped). */
export function pointsFor(correct: boolean, streakBefore: number): number {
  if (!correct) return 0;
  return 100 + Math.min(100, streakBefore * 25);
}

export type RankKey = 'buster' | 'sharp' | 'getting' | 'practise';

export function rankFor(correct: number, total: number): RankKey {
  if (total === 0) return 'practise';
  const ratio = correct / total;
  if (ratio === 1) return 'buster';
  if (ratio >= 0.8) return 'sharp';
  if (ratio >= 0.5) return 'getting';
  return 'practise';
}

/** Confetti for good runs: 80% or better. */
export function celebrate(correct: number, total: number): boolean {
  return total > 0 && correct / total >= 0.8;
}

export interface LevelBest {
  correct: number;
  total: number;
  score: number;
}

export type Progress = Partial<Record<Level, LevelBest>>;

export function readProgress(): Progress {
  return readJson<Progress>(PREF.simulator, {});
}

export function saveResult(level: Level, result: LevelBest): Progress {
  const progress = readProgress();
  const prev = progress[level];
  if (!prev || result.correct > prev.correct || (result.correct === prev.correct && result.score > prev.score)) {
    progress[level] = result;
    writeJson(PREF.simulator, progress);
  }
  return progress;
}

export function readElder(): boolean {
  return readPref(PREF.elder) === '1';
}

export function writeElder(on: boolean) {
  writePref(PREF.elder, on ? '1' : null);
}

/** Fisher-Yates shuffle with an optional seeded random (tests). */
export function shuffled<T>(items: readonly T[], random = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}
