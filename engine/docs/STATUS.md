# @ruko/engine status

Progress log for the engine build. A continuation session should resume from "Next".
Last updated: 2026-10-23 (session stopped on a budget limit, all checks green).

## Done

- Package: package.json (ESM + CJS + d.ts via tsup with UTF-8 output, `sideEffects: false`,
  `files: ["dist"]`, `prepublishOnly`), strict consumer-compatible tsconfig (noUncheckedIndexedAccess,
  exactOptionalPropertyTypes, verbatimModuleSyntax, erasableSyntaxOnly, ES2020 lib), vitest.
- Every export of the original stub implemented, plus additive exports (detectInputKind, parseUrl,
  upiHandleApp, hashPrefix, sha256Hex, sha256HexSync, CATEGORY_IDS, getCategory, registrableDomain,
  isOfficialHost, officialDomainsFor, detectLanguage, HELPLINE_1930, CYBERCRIME_PORTAL, CHAKSHU_PORTAL).
- types.ts changes are additive only: optional `UrlFinding.impersonationKind | officialDomain |
  knownGood | download` and optional `Verdict.inputKind`.
- Normalisation with index map, language detection, entity extraction (URLs with/without scheme,
  emails, VPAs, upi:// links, phones, amounts), public suffix subset, ~120-brand registry, lookalike
  detection, ~95 UPI handles, phone kinds, rule engine + 24 category rule files + shared/reassuring
  rules, scoring, en/hi headlines/summaries/advice, CATEGORIES (en + hi), hashing.
- Link/email/UPI text is masked out of the rule text; links feed `@ulink`, `@apk`, `@tglink` flags.
- Tests: test/corpus (188 scams, 126 genuine; en/hi/hinglish), test/corpus.test.ts, test/units.test.ts.
- Docs: README.md, docs/ARCHITECTURE.md, CHANGELOG.md, LICENSE (MIT, Rutvi Rupani).
- Scripts: scripts/bench.mjs (`npm run bench`), scripts/size.mjs (`npm run size`), scripts/try.mjs.

## Test results (last run)

- `npm run typecheck`: pass. `npm run build`: pass. `npm test`: 28/28 pass.
- Corpus: recall 96.8% (182/188) at score >= 60 (threshold 95%); false positives 0.0% (0/126) at
  score >= 35 (threshold 4%); top category correct for 90.7% of caught scams.
  Recall by language: en 105/107, hi 38/40, hinglish 39/41.
- Bench: 1,000 analyses in about 300 ms in Node (budget < 1 s).

## Not done / known issues

- **Bundle size is over budget**: full bundle about 101 KB min+gzip (target < 60 KB). Biggest parts:
  categories.ts (~20 KB gz, Hindi-heavy encyclopedia), rule strings in en+hi, i18n tables, brand data.
  Also tree-shaking is weak: rule modules and some top-level `new Set/RegExp` are not marked pure, so
  importing `identifierHash` alone still pulls most of the engine.
- Remaining misses (6): inv-en-4, inv-hi-2, sup-en-2, gov-hi-1, gov-hl-1 / rom-hl-1 / sim-en-2 area
  (see the corpus test output). Ideas: "invest X and get Y" cue, reversed-order "contact ... for refund"
  in care_claim, "free money for everyone" scheme cue, "coming to India" in romance foreign cue,
  a sim.share_code rule.
- Category mix-ups in some ambiguous items (phishing_link vs lookalike_domain, TRAI+police calls
  headlined as sim_swap, refund + AnyDesk headlined as remote_access).

## Next

1. Size pass: wrap each rule module in a function (lazy), mark top-level constructors `/* @__PURE__ */`,
   shorten rule details, consider shipping CATEGORIES Hindi text more compactly; re-measure with
   `npm run size -- --modules` (scripts/size.mjs supports `--modules`).
2. Close the remaining misses listed above; add more genuine messages (promos with "win", bank loan
   offers, telecom notices) to keep precision honest.
3. Optional: `tsconfig.test.json` so tests are type-checked too.
