/**
 * All rule modules, merged and compiled once (lazily, on first analysis).
 */
import { compileCue, compileRule, type CompiledRule } from './engine';
import type { CueInput, RuleDef, RuleModule } from './types';
import { shared } from './shared';
import { digitalArrest } from './digital_arrest';
import { kycUpdate } from './kyc_update';
import { upiCollect } from './upi_collect';
import { qrReceive } from './qr_receive';
import { fakeRefund } from './fake_refund';
import { jobTask } from './job_task';
import { investment } from './investment';
import { lotteryPrize } from './lottery_prize';
import { loanApp } from './loan_app';
import { sextortion } from './sextortion';
import { otpTheft } from './otp_theft';
import { fakeSupport } from './fake_support';
import { courierParcel } from './courier_parcel';
import { utilityDisconnect } from './utility_disconnect';
import { rewardPoints } from './reward_points';
import { taxRefund } from './tax_refund';
import { govtScheme } from './govt_scheme';
import { maliciousApp } from './malicious_app';
import { remoteAccess } from './remote_access';
import { impersonation } from './impersonation';
import { romance } from './romance';
import { simSwap } from './sim_swap';
import { phishingLink } from './phishing_link';
import { lookalikeDomain } from './lookalike_domain';

export const MODULES: RuleModule[] = [
  shared,
  digitalArrest,
  kycUpdate,
  upiCollect,
  qrReceive,
  fakeRefund,
  jobTask,
  investment,
  lotteryPrize,
  loanApp,
  sextortion,
  otpTheft,
  fakeSupport,
  courierParcel,
  utilityDisconnect,
  rewardPoints,
  taxRefund,
  govtScheme,
  maliciousApp,
  remoteAccess,
  impersonation,
  romance,
  simSwap,
  phishingLink,
  lookalikeDomain,
];

/** Context flags the analyser computes (referenced in rules as `@name`). */
export const FLAGS = [
  'link', 'ulink', 'olink', 'short', 'risky_link', 'mobile', 'intl', 'intl_risky', 'phone', 'amount', 'bigamt', 'smallamt',
  'upi', 'upilink', 'email', 'sms', 'wa', 'mail', 'call', 'qr', 'web', 's_mobile', 's_intl', 's_intl_risky', 's_dlt',
  's_brand', 's_1600', 's_140', 's_freemail', 'mixed', 'bidi', 'brand_mismatch', 'apk', 'tglink',
] as const;

export interface RuleSet {
  rules: CompiledRule[];
  cue(name: string): ReturnType<typeof compileCue>;
  ruleById: Map<string, RuleDef>;
}

let cached: RuleSet | null = null;

/** Merge, validate and compile every rule module. Throws on unknown cue or flag references. */
export function getRuleSet(): RuleSet {
  if (cached) return cached;
  const defs = new Map<string, CueInput>();
  for (const m of MODULES) {
    for (const id of Object.keys(m.cues)) {
      if (defs.has(id)) throw new Error(`@ruko/engine: duplicate cue "${id}"`);
      defs.set(id, m.cues[id] as CueInput);
    }
  }
  const flagSet = new Set<string>(FLAGS);
  const ruleById = new Map<string, RuleDef>();
  const rules: CompiledRule[] = [];
  for (const m of MODULES) {
    for (const def of m.rules) {
      if (ruleById.has(def.id)) throw new Error(`@ruko/engine: duplicate rule "${def.id}"`);
      ruleById.set(def.id, def);
      const compiled = compileRule(def);
      for (const alt of compiled.groups.flat().concat(compiled.not)) {
        if (alt.flag ? !flagSet.has(alt.name) : !defs.has(alt.name)) {
          throw new Error(`@ruko/engine: rule "${def.id}" references unknown ${alt.flag ? 'flag @' : 'cue '}${alt.name}`);
        }
      }
      rules.push(compiled);
    }
  }
  const compiledCues = new Map<string, ReturnType<typeof compileCue>>();
  cached = {
    rules,
    ruleById,
    cue(name: string) {
      let c = compiledCues.get(name);
      if (!c) {
        c = compileCue(name, defs.get(name) as CueInput);
        compiledCues.set(name, c);
      }
      return c;
    },
  };
  return cached;
}

/** Every cue id with its sources (used by tests to lint patterns). */
export function allCueSources(): Array<{ id: string; sources: string[] }> {
  const out: Array<{ id: string; sources: string[] }> = [];
  for (const m of MODULES) {
    for (const id of Object.keys(m.cues)) {
      const c = m.cues[id] as CueInput;
      out.push({ id, sources: Array.isArray(c) ? c : c.p });
    }
  }
  return out;
}
