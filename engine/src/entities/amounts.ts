/**
 * Money amounts: ₹ 5,000 / Rs. 5000 / INR 5000 / 5k / 5 lakh / 2 crore /
 * 5,00,000 / 25 लाख / $100 / 100 USDT.
 */
import type { AmountFinding } from '../types';

export interface RawAmount {
  s: number;
  e: number;
  value: number;
  currency: AmountFinding['currency'];
}

const NUM = String.raw`\d{1,3}(?:,\d{2,3})+(?:\.\d{1,2})?|\d+(?:\.\d+)?`;
const MULT = String.raw`k|thousand|hazaa?r|हजार|lakhs?|lacs?|लाख|crores?|cr|करोड|million|mn`;
const CUR_SUF = String.raw`rs\.?|rupees?|rupaye|rupay|rupaiya|rupiya|inr|₹|\/-|रुपये|रुपए|रुपया|रुपयों|रु\.?`;

const RE_PRE = new RegExp(String.raw`(?:₹|rs\.?|inr|रु\.?)\s?(${NUM})(?:\s?(${MULT})(?![a-z]))?(?:\s?\/-)?`, 'g');
const RE_SUF = new RegExp(String.raw`(${NUM})\s?(?:(${MULT})\s?)?(?:${CUR_SUF})(?![a-z])`, 'g');
const RE_MULT = new RegExp(String.raw`(${NUM})\s?(lakhs?|lacs?|लाख|crores?|cr|करोड)(?![a-z])`, 'g');
const RE_INDIAN = /\d{1,2}(?:,\d{2})+,\d{3}(?:\.\d{1,2})?/g;
const RE_K = /(\d+(?:\.\d+)?)k(?![a-z0-9])/g;
const RE_USD = new RegExp(String.raw`(?:\$|usd|us\$)\s?(${NUM})(?:\s?(k|thousand|million))?|(${NUM})\s?(?:usd|dollars?)(?![a-z])`, 'g');
const RE_OTHER = new RegExp(String.raw`(?:€|£)\s?(${NUM})|(${NUM})\s?(?:usdt|eur|euros?|gbp|pounds?|aed|dirhams?|btc|bitcoins?)(?![a-z])`, 'g');

const MONEY_CONTEXT = /(earn|salary|income|per day|daily|\/day|a day|payment|pay|profit|kamao|kamaye|kamai|rozana|roz|कमा|रोज|₹|\brs\b|rupees|inr|invest|loan|bonus|reward)/;

function multiplier(word: string | undefined): number {
  if (!word) return 1;
  const w = word.toLowerCase();
  if (w === 'k' || w === 'thousand' || w.startsWith('hazaa') || w.startsWith('hazar') || w === 'हजार') return 1e3;
  if (w.startsWith('lakh') || w.startsWith('lac') || w === 'लाख') return 1e5;
  if (w.startsWith('crore') || w === 'cr' || w === 'करोड') return 1e7;
  if (w === 'million' || w === 'mn') return 1e6;
  return 1;
}

function num(s: string | undefined): number {
  if (!s) return NaN;
  return parseFloat(s.replace(/,/g, ''));
}

/** Find amounts in normalised text. Spans are in normalised coordinates. */
export function findAmounts(n: string): RawAmount[] {
  const out: RawAmount[] = [];
  const overlaps = (s: number, e: number): boolean => out.some((a) => s < a.e && e > a.s);
  const leftOk = (s: number): boolean => s === 0 || !/[a-z0-9.,]/.test(n.charAt(s - 1));
  const run = (re: RegExp, fn: (m: RegExpExecArray) => { value: number; currency: RawAmount['currency'] } | null): void => {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(n)) !== null) {
      const s = m.index;
      const e = s + m[0].length;
      if (m[0].length === 0) {
        re.lastIndex++;
        continue;
      }
      if (/^[a-z0-9]/.test(m[0]) && !leftOk(s)) continue;
      if (overlaps(s, e)) continue;
      const r = fn(m);
      if (!r || !isFinite(r.value) || r.value <= 0) continue;
      out.push({ s, e, value: r.value, currency: r.currency });
    }
  };
  run(RE_PRE, (m) => ({ value: num(m[1]) * multiplier(m[2]), currency: 'INR' }));
  run(RE_USD, (m) => ({ value: num(m[1] ?? m[3]) * multiplier(m[2]), currency: 'USD' }));
  run(RE_OTHER, (m) => ({ value: num(m[1] ?? m[2]), currency: 'OTHER' }));
  run(RE_SUF, (m) => ({ value: num(m[1]) * multiplier(m[2]), currency: 'INR' }));
  run(RE_MULT, (m) => ({ value: num(m[1]) * multiplier(m[2]), currency: 'INR' }));
  run(RE_INDIAN, (m) => ({ value: num(m[0]), currency: 'INR' }));
  if (MONEY_CONTEXT.test(n)) run(RE_K, (m) => ({ value: num(m[1]) * 1e3, currency: 'INR' }));
  return out.sort((a, b) => a.s - b.s);
}
