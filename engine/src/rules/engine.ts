/**
 * Cue matching and rule evaluation over normalised text.
 */
import { isWordCode } from '../normalize';
import type { CueInput, RuleDef } from './types';

export interface Hit {
  s: number;
  e: number;
}

interface CompiledCue {
  re: RegExp;
  neg: boolean;
  bounded: boolean;
}

interface Alt {
  name: string;
  flag: boolean;
}

export interface CompiledRule {
  def: RuleDef;
  groups: Alt[][];
  not: Alt[];
}

export function compileCue(id: string, input: CueInput): CompiledCue {
  const spec = Array.isArray(input) ? { p: input } : input;
  const source = spec.p.map((p) => `(?:${p})`).join('|');
  let re: RegExp;
  try {
    re = new RegExp(source, 'g');
  } catch (err) {
    throw new Error(`@ruko/engine: bad pattern in cue "${id}": ${(err as Error).message}`);
  }
  return { re, neg: spec.neg === true, bounded: spec.free !== true };
}

function parseAlts(group: string): Alt[] {
  return group
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.charAt(0) === '@' ? { name: s.slice(1), flag: true } : { name: s, flag: false }));
}

export function compileRule(def: RuleDef): CompiledRule {
  return { def, groups: def.all.map(parseAlts), not: def.not ? parseAlts(def.not) : [] };
}

const NEG_BEFORE = new Set([
  'not', 'never', "don't", 'dont', 'do not', "didn't", 'cannot', "can't", 'no', 'nobody', 'nahi', 'nahin', 'nhi',
  'mat', 'na', 'kabhi', 'kbhi', 'न', 'ना', 'मत', 'नहीं', 'कभी', 'without', 'avoid', 'refuse', "won't", 'wont',
]);
const NEG_AFTER = new Set(['mat', 'na', 'nahi', 'nahin', 'nhi', 'naa', 'न', 'ना', 'मत', 'नहीं']);

/** A match is negated when one of the 3 words before it (same clause) or 2 words after it is a negation. */
function negated(text: string, s: number, e: number): boolean {
  let before = text.slice(Math.max(0, s - 40), s);
  const cut = Math.max(before.lastIndexOf('.'), before.lastIndexOf(','), before.lastIndexOf(';'), before.lastIndexOf('!'), before.lastIndexOf('?'));
  if (cut >= 0) before = before.slice(cut + 1);
  const bw = before.split(/[^a-z'ऀ-ॿ]+/).filter(Boolean);
  for (let i = Math.max(0, bw.length - 3); i < bw.length; i++) {
    if (NEG_BEFORE.has(bw[i] as string)) return true;
  }
  const after = text.slice(e, e + 16).split(/[^a-z'ऀ-ॿ]+/).filter(Boolean);
  for (let i = 0; i < Math.min(2, after.length); i++) {
    if (NEG_AFTER.has(after[i] as string)) return true;
  }
  return false;
}

/** All boundary-respecting matches of a compiled cue. */
export function matchCue(cue: CompiledCue, text: string): Hit[] {
  const out: Hit[] = [];
  const re = cue.re;
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  let guard = 0;
  while ((m = re.exec(text)) !== null && guard++ < 200) {
    const s = m.index;
    const e = s + m[0].length;
    if (e === s) {
      re.lastIndex = s + 1;
      continue;
    }
    if (cue.bounded) {
      const leftOk = s === 0 || !isWordCode(text.charCodeAt(s)) || !isWordCode(text.charCodeAt(s - 1));
      const rightOk = e >= text.length || !isWordCode(text.charCodeAt(e - 1)) || !isWordCode(text.charCodeAt(e));
      if (!leftOk || !rightOk) {
        re.lastIndex = s + 1;
        continue;
      }
    }
    if (cue.neg && negated(text, s, e)) continue;
    out.push({ s, e });
  }
  return out;
}

/** Is there one hit per group that fits inside a window of `max` characters? */
export function withinWindow(groups: Hit[][], max: number): boolean {
  const gs = groups.filter((g) => g.length > 0);
  if (gs.length < 2) return true;
  let checked = 0;
  const pick = (gi: number, lo: number, hi: number): boolean => {
    if (gi === gs.length) return hi - lo <= max;
    for (const h of gs[gi] as Hit[]) {
      if (++checked > 400) return false;
      const nlo = Math.min(lo, h.s);
      const nhi = Math.max(hi, h.e);
      if (nhi - nlo > max) continue;
      if (pick(gi + 1, nlo, nhi)) return true;
    }
    return false;
  };
  return pick(0, Infinity, -Infinity);
}

export interface EvalContext {
  cue(name: string): Hit[];
  flag(name: string): Hit[] | null;
}

/** Evaluate a rule; returns the evidence hits per group, or null if it does not fire. */
export function evalRule(rule: CompiledRule, ctx: EvalContext): Hit[][] | null {
  const groups: Hit[][] = [];
  for (const g of rule.groups) {
    let ok = false;
    let hits: Hit[] = [];
    for (const alt of g) {
      const h = alt.flag ? ctx.flag(alt.name) : ctx.cue(alt.name);
      if (h && (alt.flag || h.length > 0)) {
        ok = true;
        if (h.length) hits = hits.concat(h);
      }
    }
    if (!ok) return null;
    groups.push(hits);
  }
  for (const alt of rule.not) {
    const h = alt.flag ? ctx.flag(alt.name) : ctx.cue(alt.name);
    if (h && (alt.flag || h.length > 0)) return null;
  }
  if (rule.def.near !== undefined && !withinWindow(groups, rule.def.near)) return null;
  return groups;
}
