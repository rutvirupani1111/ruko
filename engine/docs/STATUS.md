# @ruko/engine status

Progress log for the engine build. A continuation session should resume from "Next".
Last updated: 2026-10-23, rule pass for the 6 corpus misses (v0.1.3). All checks green;
`npm run size` still exits 1 because `analyze()` alone is over its 70 KB budget.

## Done

- Package: package.json (ESM + CJS + d.ts via tsup with UTF-8 output, `sideEffects: false`,
  `files: ["dist"]`, `prepublishOnly`), strict consumer-compatible tsconfig (noUncheckedIndexedAccess,
  exactOptionalPropertyTypes, verbatimModuleSyntax, erasableSyntaxOnly, ES2020 lib), vitest.
- Every export of the original stub implemented, plus additive exports (detectInputKind, parseUrl,
  upiHandleApp, hashPrefix, sha256Hex, sha256HexSync, CATEGORY_IDS, getCategory, registrableDomain,
  isOfficialHost, officialDomainsFor, detectLanguage, HELPLINE_1930, CYBERCRIME_PORTAL, CHAKSHU_PORTAL).
- types.ts changes are additive only: optional `UrlFinding.impersonationKind | officialDomain |
  knownGood | download` and optional `Verdict.inputKind`. Unchanged in 0.1.1.
- Normalisation with index map, language detection, entity extraction (URLs with/without scheme,
  emails, VPAs, upi:// links, phones, amounts), public suffix subset, ~120-brand registry, lookalike
  detection, ~95 UPI handles, phone kinds, rule engine + 24 category rule files + shared/reassuring
  rules, scoring, en/hi headlines/summaries/advice, CATEGORIES (en + hi), hashing.
- Link/email/UPI text is masked out of the rule text; links feed `@ulink`, `@apk`, `@tglink` flags.
- Tests: test/corpus (188 scams, 126 genuine; en/hi/hinglish), test/corpus.test.ts, test/units.test.ts.
- Docs: README.md, docs/ARCHITECTURE.md (now with "Tree-shaking rules"), CHANGELOG.md, LICENSE.
- Scripts: scripts/bench.mjs (`npm run bench`), scripts/size.mjs (`npm run size`), scripts/try.mjs.

### 0.1.1 size pass (this session)

- Subpath export `@ruko/engine/categories` (src/categories.ts); main entry keeps CATEGORIES,
  CATEGORY_IDS, getCategory. tsup builds both entries with splitting, so ESM and CJS share one chunk.
  Consumers aliasing `@ruko/engine` to source need an extra alias for the subpath (README).
- No import-time work anywhere: rule modules are factories, `r` is a function, top-level sets are
  `/* @__PURE__ */`, amount regexes and BARE_TLDS are built lazily, SHA-256 K table computed once.
- hash.ts imports only leaf parsers: entities/parseurl.ts, entities/phoneparse.ts,
  entities/upiparse.ts (+ normalize, punycode, psl, sha256).
- Category one-liners moved to src/shorts.ts (used by summaries and by the encyclopedia).
- Verified identical behaviour against the 0.1.0 source: 628 verdicts (314 corpus items x 2 locales),
  CATEGORIES deep-equal, normalizeIdentifier on 13,725 inputs x kinds, 0 differences.

### 0.1.2 SHA-256 speed pass (this session)

- `sha256HexSync` rewritten for the web app's 18-bit proof-of-work loop (src/sha256.ts): shared
  TextEncoder `encodeInto` a reused 4 KB buffer padded in place, reused Int32Array schedule and
  state, int32 rounds, hex from a char-code table via one `String.fromCharCode`. Inputs over 1,341
  UTF-16 units use their own buffer. Same loop, same machine: 0.1.1 ~7.2 µs per 90-byte hash,
  0.1.2 ~1.57 µs in isolation and 1.7-1.9 µs inside `npm run bench` (4.0-4.6x).
- Output identical: new tests compare against `node:crypto` (vectors, lengths 0-200 long-then-short,
  inputs past the shared buffer, multi-byte UTF-8, lone surrogates, `sha256Bytes` boundaries).
  Corpus verdicts unchanged (182/188, 0/126). `ENGINE_VERSION` left at 0.1.1 (rules and scoring
  unchanged); package.json is 0.1.2.
- `identifierHash` alone is 5,116 bytes min+gzip, 4 bytes under its 5 KB budget: any growth in
  sha256.ts, hash.ts or the leaf parsers will trip `npm run size`.
- Not done this pass: the 6 missed scams (time budget went to the hash).

### 0.1.3 rule pass (this session)

- Closed all 6 misses with narrow rules (details in CHANGELOG): `inv.put_get`, reversed-order
  `care_claim`, reversed-order `reg_fee` (Hinglish + Hindi), `gov.handout_fee`, `rom.visit_stuck`,
  `sim.share_code`. `ENGINE_VERSION` and package.json are 0.1.3.
- Verified against the 0.1.2 build: only those 6 verdicts change; the other 308 corpus items have
  identical score, category and signals. Hindi locale scores equal English for all 314.
- Kept narrow on purpose: no English "invest X get Y" (promo FP risk), no English "everyone gets
  ₹X", and the reversed support pattern covers refund/cashback but not "complaint" ("call our care
  on <mobile> for your complaint status" stays at 45). Probed genuine look-alikes (SIP ads, PM-Kisan
  news, delivery-OTP and "do not share the code" notices, college form fees, a relative flying in):
  all score 0.
- Found, not fixed (broad): in shared `money_req`, alternations like `bhej|bhejo` match the prefix
  first and the word-boundary check then rejects it, so "50 rs bhejo" and "paise bhejo" never match
  `money_req`. Fixing the order touches every category that uses `money_req`; needs its own pass
  with a full corpus diff.

## Test results (last run)

- `npm run typecheck`: pass. `npm run build`: pass. `npm test`: 33/33 pass.
- Corpus: recall 100% (188/188) at score >= 60 (threshold 95%); false positives 0.0% (0/126) at
  score >= 35 (threshold 4%); top category correct for 91.0% (171/188) of caught scams.
  Recall by language: en 107/107, hi 40/40, hinglish 41/41.
- Bench: 1,000 analyses in about 290 ms in Node (budget < 1 s); `sha256HexSync` on 90-byte inputs
  1.7-1.9 µs per hash (budget 4 µs), so an 18-bit proof-of-work averages about 0.5 s on this laptop.

## Bundle size (min+gzip, `npm run size`)

| Import | 0.1.0 | 0.1.1 | 0.1.2 | 0.1.3 | Budget |
| --- | --- | --- | --- | --- | --- |
| `identifierHash` only | 84.8 KB | 4.8 KB | 5.0 KB (5,116 B) | 5.0 KB (hash code untouched) | <= 5 KB, met |
| `analyzeUrl` only | (not measured) | 22.8 KB | 22.8 KB | 22.8 KB | |
| `analyze` only | 99.0 KB | 80.4 KB | 80.4 KB | 81.9 KB | <= 70 KB, **not met** |
| `CATEGORIES` / categories entry | 70.3 KB | 21.0 KB | 21.0 KB | 21.0 KB | |
| full bundle (`export *`) | 101.1 KB | 100.3 KB | 100.6 KB | 101.9 KB | (old 60 KB target, not met) |

Where the `analyze` bytes are (measured by blanking each part, gzip KB): rule regex patterns ~20,
rule texts ~14.5 (hi 8.4, en 6.3), i18n tables ~8.8 (hi 5.2, en 3.6), category one-liners ~2.5,
brand registry ~6; the rest is code. Dedupe has little to work with: 0 duplicate rule titles or
details among 129 rules, 9 shared sentences (844 bytes) across rules, i18n and encyclopedia;
dropping the per-rule `cat` field measured 0.4 KB.

## Not done / known issues

- `analyze()` alone is 81.9 KB, 11.9 KB over the 70 KB budget (see breakdown above; the 0.1.3
  rules added 1.5 KB, mostly Hindi rule texts).
- No corpus misses left, so recall is no longer a useful signal on this corpus: grow it with
  fresh scams and more genuine look-alikes before trusting further rule changes.
- `money_req` prefix-alternation bug (see 0.1.3 notes above): "50 rs bhejo", "paise bhejo" do not match.
- Category mix-ups in some ambiguous items (phishing_link vs lookalike_domain, TRAI+police calls
  headlined as sim_swap, refund + AnyDesk headlined as remote_access).
- The web app and extension still import CATEGORIES from the main entry (fine; switching to the
  subpath only matters for code-split routes).

## Next

1. Get `analyze()` under 70 KB. Most promising, in order: factor the repeated Hinglish/Hindi
   alternations in rule patterns into shared fragments (like G1..G6) and drop alternatives that
   normalisation makes unreachable (patterns are ~20 KB gz); move signal texts for rare rules into
   shorter titles where the detail repeats the title; keep the brand registry as compact strings.
   Re-measure with `npm run size -- --modules` (prints analyze() bytes per source file).
2. Add new scams and more genuine messages (promos with "win", bank loan offers, telecom notices,
   eSIM help pages, government scheme news) to keep recall and precision honest; then fix the
   `money_req` alternation order with a full corpus diff.
3. Optional: `tsconfig.test.json` so tests are type-checked too.
