/**
 * Lookalike detection: homoglyph skeletons, typo distance and brand names
 * planted inside unrelated domains.
 */
import {
  brandLabels,
  brandTokenInHost,
  brandTokenInPath,
  officialBrandForHost,
  officialSuffixesForLabel,
  type Brand,
} from './brands';
import type { DomainParts } from './psl';

/** Characters that render like ASCII letters in common fonts. */
const SKELETON: Record<string, string> = {
  '0': 'o', '1': 'l', 'i': 'l', '!': 'l', '|': 'l', 'ı': 'l', 'ɩ': 'l', 'ӏ': 'l', 'ι': 'l', 'і': 'l', 'ї': 'l',
  '5': 's', '$': 's', 'ѕ': 's', '3': 'e', 'е': 'e', 'ё': 'e', 'ε': 'e', '4': 'a', '@': 'a', 'а': 'a', 'α': 'a',
  'ɑ': 'a', 'о': 'o', 'ο': 'o', 'σ': 'o', 'р': 'p', 'ρ': 'p', 'с': 'c', 'ϲ': 'c', 'х': 'x', 'χ': 'x', 'у': 'y',
  'ү': 'y', 'γ': 'y', 'к': 'k', 'κ': 'k', 'м': 'm', 'т': 't', 'τ': 't', 'н': 'h', 'һ': 'h', 'в': 'b', 'ԁ': 'd',
  'ј': 'j', 'ԛ': 'q', 'ԝ': 'w', 'ω': 'w', 'ν': 'v', 'ѵ': 'v', 'υ': 'u', 'μ': 'u', 'η': 'n', 'ɡ': 'g',
};

/** Confusable skeleton of a label: homoglyphs and digit swaps folded, `rn`→`m`, `vv`→`w`, hyphens dropped. */
export function skeleton(label: string): string {
  const x = label.normalize('NFKC').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  let out = '';
  for (const ch of Array.from(x)) out += SKELETON[ch] ?? ch;
  return out.replace(/rn/g, 'm').replace(/vv/g, 'w').replace(/cl/g, 'd').replace(/-/g, '');
}

/** Optimal string alignment distance (Damerau-Levenshtein without substring edits), capped at max+1. */
export function editDistance(a: string, b: string, max = 3): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const n = a.length;
  const m = b.length;
  let prev2: number[] = new Array<number>(m + 1).fill(0);
  let prev: number[] = new Array<number>(m + 1);
  let cur: number[] = new Array<number>(m + 1).fill(0);
  for (let j = 0; j <= m; j++) prev[j] = j;
  for (let i = 1; i <= n; i++) {
    cur[0] = i;
    let rowMin = i;
    for (let j = 1; j <= m; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      let v = Math.min((prev[j] as number) + 1, (cur[j - 1] as number) + 1, (prev[j - 1] as number) + cost);
      if (i > 1 && j > 1 && a.charCodeAt(i - 1) === b.charCodeAt(j - 2) && a.charCodeAt(i - 2) === b.charCodeAt(j - 1)) {
        v = Math.min(v, (prev2[j - 2] as number) + 1);
      }
      cur[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    const t = prev2;
    prev2 = prev;
    prev = cur;
    cur = t;
  }
  return prev[m] as number;
}

export type ImpersonationKind = 'homoglyph' | 'typo' | 'tld_swap' | 'token' | 'subdomain' | 'hosting' | 'path' | 'userinfo';

export interface Impersonation {
  brand: Brand;
  kind: ImpersonationKind;
  /** The official domain being imitated, when known. */
  target: string;
}

/** Real, unrelated domains that sit close to a brand label. */
const NEAR_MISS_ALLOW = new Set(['kodak', 'tomato', 'canary', 'mantra', 'apply', 'appie', 'potato', 'kotaku', 'swiggly']);

function isAscii(s: string): boolean {
  // eslint-disable-next-line no-control-regex
  return /^[\x00-\x7f]*$/.test(s);
}

/**
 * Decide whether a (non-official) host imitates a brand.
 * `uhost` is the lowercase Unicode host, `parts` its public-suffix split.
 */
export function findImpersonation(uhost: string, parts: DomainParts, path: string, userinfo: string): Impersonation | null {
  // 1. Userinfo trick: https://www.sbi.co.in@evil.example/
  if (userinfo) {
    const ui = userinfo.toLowerCase();
    const off = officialBrandForHost(ui.replace(/^www\./, ''));
    if (off) return { brand: off, kind: 'userinfo', target: off.domains[0] ?? '' };
    const tok = brandTokenInHost(ui);
    if (tok) return { brand: tok.brand, kind: 'userinfo', target: tok.brand.domains[0] ?? '' };
  }

  const suffixLabels = parts.suffix.split('.').length;
  const allLabels = uhost.split('.');
  const bodyLabels = allLabels.slice(0, Math.max(0, allLabels.length - suffixLabels));
  const regLabel = parts.label;

  // 2. Homoglyphs, typos and TLD swaps against official labels.
  const labels = brandLabels(skeleton);
  for (let li = bodyLabels.length - 1; li >= 0; li--) {
    const label = bodyLabels[li] as string;
    if (label.length < 3) continue;
    const isReg = label === regLabel && li === bodyLabels.length - 1;
    const sk = skeleton(label);
    const ascii = isAscii(label);
    for (const bl of labels) {
      if (label === bl.label) {
        if (isReg && !parts.hosting) {
          const sufs = officialSuffixesForLabel(label);
          if (sufs.indexOf(parts.suffix) < 0) return { brand: bl.brand, kind: 'tld_swap', target: bl.domain };
        } else {
          return { brand: bl.brand, kind: parts.hosting ? 'hosting' : 'subdomain', target: bl.domain };
        }
        continue;
      }
      if (sk === bl.skeleton) {
        const kind: ImpersonationKind = parts.hosting ? 'hosting' : ascii ? 'typo' : 'homoglyph';
        return { brand: bl.brand, kind, target: bl.domain };
      }
      if (!ascii) continue;
      const len = bl.label.length;
      if (len < 5 || NEAR_MISS_ALLOW.has(label)) continue;
      const thr = len >= 8 ? 2 : 1;
      if (Math.abs(label.length - len) > thr) continue;
      if (editDistance(label, bl.label, thr) <= thr) {
        return { brand: bl.brand, kind: parts.hosting ? 'hosting' : 'typo', target: bl.domain };
      }
    }
  }

  // 3. Brand name planted inside the domain: hdfc-reward.in, sbi.kyc-update.top, paytm-kyc.web.app
  const body = bodyLabels.join('.');
  if (body) {
    const tok = brandTokenInHost(body);
    if (tok) {
      const inSub = parts.subdomain !== '' && brandTokenInHost(regLabel) === null;
      return {
        brand: tok.brand,
        kind: parts.hosting ? 'hosting' : inSub ? 'subdomain' : 'token',
        target: tok.brand.domains[0] ?? '',
      };
    }
  }

  // 4. Brand name in the path of an unrelated site: example.top/sbi/kyc
  const pt = brandTokenInPath(path);
  if (pt) return { brand: pt.brand, kind: 'path', target: pt.brand.domains[0] ?? '' };
  return null;
}
