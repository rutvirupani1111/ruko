// Quick manual check: node scripts/try.mjs "message text" [--hi] [--json]
// Uses the built dist bundle (run `npm run build` first).
import { analyze } from '../dist/index.js';

const args = process.argv.slice(2);
const locale = args.includes('--hi') ? 'hi' : 'en';
const json = args.includes('--json');
const text = args.filter((a) => !a.startsWith('--')).join(' ');
const v = analyze(text, { locale });
if (json) {
  console.log(JSON.stringify(v, null, 2));
} else {
  console.log(`${v.score} ${v.severity} [${v.category}] ${v.headline}`);
  console.log(`  ${v.summary}`);
  for (const s of v.signals) console.log(`  ${String(s.weight).padStart(4)} ${s.id} (${s.category}) ${s.title} :: ${s.spans.map((x) => x.text).join(' | ')}`);
  console.log(`  lang=${v.detectedLanguage} kind=${v.inputKind} cats=${v.categories.map((c) => c.id + ':' + c.score).join(',')}`);
  const e = v.entities;
  for (const u of e.urls) console.log(`  url ${u.url} risk=${u.risk} imp=${u.impersonates ?? ''} ${u.reasons.join('; ')}`);
  for (const u of e.upiIds) console.log(`  upi ${u.vpa} risk=${u.risk} ${u.reasons.join('; ')}`);
  for (const p of e.phones) console.log(`  phone ${p.raw} ${p.e164} ${p.kind} risk=${p.risk}`);
  for (const a of e.amounts) console.log(`  amount ${a.text} = ${a.value} ${a.currency}`);
  console.log(`  advice: ${v.advice.map((a) => a.id).join(', ')}`);
}
