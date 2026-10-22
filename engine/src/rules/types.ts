import type { ScamCategory } from '../types';

/**
 * A cue is a named set of regex sources (joined with `|`) matched over the
 * normalised text. By default a match must start and end on a word boundary
 * (works for Devanagari too). `neg: true` drops matches preceded by a
 * negation ("do not share OTP") or followed by a Hindi negation
 * ("share mat karo"). `free: true` disables the boundary check.
 */
export interface CueSpec {
  p: string[];
  neg?: boolean;
  free?: boolean;
}

export type CueInput = string[] | CueSpec;

/**
 * A rule fires when every group in `all` matches. A group is a `|`-separated
 * list of cue ids and context flags (flags start with `@`).
 */
export interface RuleDef {
  id: string;
  cat: ScamCategory;
  /** Weight 1..100 (or negative for reassuring signals). */
  w: number;
  all: string[];
  /** Suppress the rule when any cue or flag in this `|` list matches. */
  not?: string;
  /** Every group's evidence must fit inside this many characters. */
  near?: number;
  /** Exclusive group: only the strongest fired rule of the group counts. */
  x?: string;
  /** [title, detail] in English. */
  en: [string, string];
  /** [title, detail] in Hindi. */
  hi: [string, string];
}

export interface RuleModule {
  cues: Record<string, CueInput>;
  rules: RuleDef[];
}

/** Gap helpers for patterns over normalised text (single spaces between words). */
export const G1 = String.raw`(?: \S+)? `;
export const G2 = String.raw`(?: \S+){0,2} `;
export const G3 = String.raw`(?: \S+){0,3} `;
export const G4 = String.raw`(?: \S+){0,4} `;
export const G6 = String.raw`(?: \S+){0,6} `;
export const r = String.raw;
