# Changelog

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
