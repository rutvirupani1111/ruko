# @ruko/engine status

Progress log for the engine build. A continuation session should resume from "Next".
Last updated: 2026-10-23, size pass (v0.1.1). All checks green; `npm run size` still exits 1
because `analyze()` alone is over its 70 KB budget.

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

## Test results (last run)

- `npm run typecheck`: pass. `npm run build`: pass. `npm test`: 31/31 pass.
- Corpus: recall 96.8% (182/188) at score >= 60 (threshold 95%); false positives 0.0% (0/126) at
  score >= 35 (threshold 4%); top category correct for 90.7% of caught scams.
  Recall by language: en 105/107, hi 38/40, hinglish 39/41.
- Bench: 1,000 analyses in about 300 ms in Node (budget < 1 s).

## Bundle size (min+gzip, `npm run size`)

| Import | 0.1.0 | 0.1.1 | Budget |
| --- | --- | --- | --- |
| `identifierHash` only | 84.8 KB | 4.8 KB | <= 5 KB, met |
| `analyzeUrl` only | (not measured) | 22.8 KB | |
| `analyze` only | 99.0 KB | 80.4 KB | <= 70 KB, **not met** |
| `CATEGORIES` / categories entry | 70.3 KB | 21.0 KB | |
| full bundle (`export *`) | 101.1 KB | 100.3 KB | (old 60 KB target, not met) |

Where the `analyze` bytes are (measured by blanking each part, gzip KB): rule regex patterns ~20,
rule texts ~14.5 (hi 8.4, en 6.3), i18n tables ~8.8 (hi 5.2, en 3.6), category one-liners ~2.5,
brand registry ~6; the rest is code. Dedupe has little to work with: 0 duplicate rule titles or
details among 129 rules, 9 shared sentences (844 bytes) across rules, i18n and encyclopedia;
dropping the per-rule `cat` field measured 0.4 KB.

## Not done / known issues

- `analyze()` alone is 80.4 KB, 10.4 KB over the 70 KB budget (see breakdown above).
- Remaining misses (6): inv-hi-2 (55), sup-en-2 (45), gov-hi-1 (55), gov-hl-1 (35), rom-hl-1 (55),
  sim-en-2 (50). Ideas: "invest X and get Y" cue, reversed-order "contact ... for refund" in
  care_claim, "free money for everyone" scheme cue, "coming to India" in romance foreign cue,
  a sim.share_code rule.
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
2. Close the remaining misses listed above; add more genuine messages (promos with "win", bank loan
   offers, telecom notices) to keep precision honest.
3. Optional: `tsconfig.test.json` so tests are type-checked too.
