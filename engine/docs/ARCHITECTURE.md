# Architecture

```
input ─► normalize (NFKC, lowercase, zero-width/bidi stripped, homoglyph fold, Indic digits,
         nukta/chandrabindu folded, whitespace collapsed; keeps an index map to the original)
      ─► extract entities (entities/): urls, upi links, emails, VPAs, phones, amounts
         each analysed on its own (analyzeUrl / parseUpiUri / analyzeUpiId / analyzePhone)
      ─► flags (analyze.ts computeFlags): @ulink, @olink, @mobile, @intl_risky, @apk,
         @s_brand (DLT header), @brand_mismatch, source flags ...
      ─► rules (rules/*.ts) over the normalised text with link/email/UPI text masked out
      ─► entity signals (risky links, lookalikes, risky VPAs, upi:// receive tricks, emails)
      ─► score.ts ─► headline / summary / advice (i18n/, advice.ts)
```

## Rules

`rules/types.ts` defines the DSL. A **cue** is a named list of regex sources over normalised text,
matched with word boundaries that also work for Devanagari (no lookbehind, so old Safari parses
it). `neg: true` drops matches negated nearby ("do not share OTP", "share mat karo"). A **rule**
fires when every group in `all` matches (`'a|b|@flag'` = OR), unless a `not` cue/flag matches;
`near` bounds the evidence window; `x` makes rules mutually exclusive. Each rule carries its own
English and Hindi title and detail. `rules/index.ts` merges all modules and throws on unknown cue
or flag names (a unit test compiles every rule).

## Scoring

`raw = 100 * (1 - Π(1 - w/100))` over positive weights; reassurance (negative weights, capped at
60) is subtracted; the floor is the strongest single weight when it is >= 50, so hard evidence
(lookalike domain, OTP request, APK) cannot be argued away by "do not share OTP" boilerplate.
Category scores use the same formula per category; delivery categories (phishing_link,
lookalike_domain, malicious_app, other) also count towards a scam-story category that has its
own evidence, so a KYC SMS with a fake link is headlined as a KYC scam.

## Domains

`domains/psl.ts` bundles every `.in` second level, common multi-part suffixes and free-hosting
platforms. `domains/brands.ts` holds ~120 brands (official domains, name tokens, DLT headers).
`domains/lookalike.ts` checks userinfo, homoglyph skeletons, OSA edit distance, TLD swaps, brand
tokens in other domains and brand names in paths. `domains/punycode.ts` is a small RFC 3492.

## Files

- `analyze.ts` orchestration; `score.ts`; `advice.ts`; `categories.ts` (encyclopedia);
  `hash.ts` + `sha256.ts`; `sender.ts` (DLT header / phone / email sender parsing);
  `lang.ts` (en / hi / hinglish); `i18n/en.ts`, `i18n/hi.ts`.
- Tests: `test/corpus/` (labelled scams and genuine messages), `test/corpus.test.ts`
  (thresholds + confusion summary), `test/units.test.ts`.
