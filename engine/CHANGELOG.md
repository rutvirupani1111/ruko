# Changelog

## 0.1.3 (2026-10-23)

Rule pass that closes the last 6 corpus misses. Verdicts change (`ENGINE_VERSION` is now `0.1.3`),
but only for those 6 messages: the other 182 scams and all 126 genuine messages give identical
scores, categories and signals to 0.1.2.

- `inv.put_get` (investment, 40): "10,000 रुपये लगाइए और 20,000 रुपये पाइए", "5000 lagao aur 10000 pao".
  Hindi and Hinglish only. inv-hi-2 55 -> 73.
- `care_claim` also matches the reversed order "contact ... at <mobile> for an instant refund"
  (refund or cashback only, still needs a mobile or foreign number). sup-en-2 45 -> 67.
- `reg_fee` also matches "form bharne ke liye 50 rs bhejo" and "फॉर्म भरने के लिए 50 रुपये भेजें".
  gov-hl-1 35 -> 71.
- `gov.handout_fee` (govt_scheme, 30): "सभी महिलाओं को ₹5000 मिलेंगे" / "sabko 5000 rs milenge" with a
  scheme and a fee. gov-hi-1 55 -> 69.
- `rom.visit_stuck` (romance, 40): "coming to meet you / milne India aa rahi hu" plus airport or
  customs plus money. rom-hl-1 55 -> 73.
- `sim.share_code` (sim_swap, 40): "share the code you receive with our executive" in a SIM
  context; negation-aware and suppressed for delivery OTPs. sim-en-2 50 -> 70.
- Corpus: recall 100% (188/188, was 182/188), false positives 0/126, correct top category 171/188.
- Size: `analyze()` alone grows 80.4 -> 81.9 KB min+gzip (budget 70 KB, still not met);
  `identifierHash` unchanged (hashing code untouched).

## 0.1.2 (2026-10-23)

Speed release for the web app's 18-bit report proof-of-work. Outputs are unchanged: every digest
matches `node:crypto`, all 314 corpus messages give identical verdicts, and `ENGINE_VERSION`
stays `0.1.1` because rules and scoring did not change (so `Verdict.engineVersion` is identical too).

- `sha256HexSync` is about 4.5x faster: 1.6-1.8 µs per 90-byte input, down from about 7.2 µs in
  the same loop (Node 23, this laptop). An 18-bit proof-of-work now averages about 0.45 s here
  instead of 1.9 s. What changed: one shared `TextEncoder` writes straight into a reused buffer
  that is padded in place (no per-call encoder, copy or `DataView`); the message schedule and
  state are reused `Int32Array`s and the rounds run on int32 locals; the hex digest is built from
  a char-code table in one `String.fromCharCode` call instead of 32 `toString(16)` + `padStart`
  concatenations. Inputs over 1,341 UTF-16 units get a buffer of their own, so a one-off large
  hash is not kept alive. Still no work at import time.
- `sha256Bytes` (internal) returns a fresh 32-byte array as before; `sha256Hex` still prefers
  WebCrypto and reuses the same hex table.
- The no-`TextEncoder` fallback is smaller and gives the same bytes as before (code points, with
  lone surrogates encoded as themselves); checked against `node:crypto` on valid text with the
  global removed.
- Tests: SHA-256 vectors against `node:crypto` (empty, "abc", 56 bytes, 1,000 bytes, Hindi +
  emoji UTF-8, the 90-byte proof-of-work shape), every length 0-200 run long-then-short so stale
  bytes in the reused buffer would show, inputs past the shared buffer, lone surrogates, and
  `sha256Bytes` at the padding boundaries.
- `npm run bench` also reports µs per `sha256HexSync` call on 90-byte inputs and fails above 4 µs.
- `identifierHash` alone stays within its 5 KB budget (5,116 bytes min+gzip).

## 0.1.1 (2026-10-23)

Size and tree-shaking release. Verdicts are unchanged: all 314 corpus messages give identical
verdicts in both locales, and `normalizeIdentifier` gives identical output on 13,725 inputs.

- New subpath export `@ruko/engine/categories` (`CATEGORIES`, `CATEGORY_IDS`, `getCategory`).
  The main entry still exports all three. ESM and CJS builds share one copy in a chunk.
- Tree-shakeable: no work at import time. Rule modules are factory functions, top-level
  initializers are `/* @__PURE__ */` or lazy, and the package stays `sideEffects: false`.
- `identifierHash` / `normalizeIdentifier` depend only on small leaf parsers
  (`entities/parseurl.ts`, `entities/phoneparse.ts`, `entities/upiparse.ts`), not on rules,
  brand data or i18n: 84.8 KB to 4.8 KB min+gzip when imported alone.
- `analyze` alone: 99.0 KB to 80.4 KB min+gzip (the encyclopedia is no longer pulled in).
  `analyzeUrl` alone: 22.8 KB. Full bundle: 101.1 KB to 100.3 KB.
- Category one-liners moved from the i18n tables to `src/shorts.ts`, so the encyclopedia no
  longer imports the analyser's string tables.
- SHA-256 round constants are computed once at runtime instead of shipped as a table
  (verified with the FIPS 180-4 test vectors).
- `npm run size` reports `analyze`, `analyzeUrl`, `identifierHash` and the categories entry, and
  checks the budgets (`analyze` <= 70 KB, `identifierHash` <= 5 KB).
- `ENGINE_VERSION` is `0.1.1`.

## 0.1.0 (2026-10-23)

First release (not published).

- `analyze()` for messages, links, UPI IDs, `upi://` links, phone numbers and emails, with
  English and Hindi verdicts, signals with spans, entity mini-verdicts and advice.
- 24 scam categories with rules in English, Hindi and Hinglish; reassuring signals for genuine
  OTP SMS, DLT sender headers, transaction alerts, official links and safety notices.
- URL analysis: brand registry, lookalike detection, public suffix subset, free hosting,
  shorteners, IPs, risky TLDs, APK downloads.
- UPI handle registry and `upi://` parsing; Indian phone kinds; amount extraction.
- `CATEGORIES` encyclopedia in English and Hindi.
- `normalizeIdentifier`, `identifierHash`, `hashPrefix`, `sha256Hex`, `sha256HexSync`.
- Additive type changes: optional `UrlFinding.impersonationKind`, `officialDomain`,
  `knownGood`, `download`; optional `Verdict.inputKind`.
