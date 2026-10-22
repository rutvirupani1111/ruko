# @ruko/engine

On-device scam detection for India. **Pause. Check. Then trust.**

Zero runtime dependencies, pure TypeScript, ESM + CJS + `.d.ts`. Runs in browsers, Node 18+,
Web Workers and MV3 service workers. Everything is analysed locally: nothing leaves the device.

- 24 scam categories (digital arrest, KYC, UPI collect, QR, refunds, task jobs, investment,
  lottery, loan apps, sextortion, OTP theft, fake support, courier, electricity, reward points,
  tax refund, government schemes, APKs, remote access, impersonation, romance, SIM swap,
  phishing links, lookalike domains) in English, Hindi and Hinglish.
- Links: official-domain registry (~120 Indian brands), lookalikes (typos, homoglyphs, punycode,
  TLD swaps, brand names inside other domains, free hosting, `@` userinfo tricks), shorteners,
  raw IPs, risky TLDs, `.apk` downloads, `data:` links. `.bank.in`, `.gov.in` and `.sbi` are trusted.
- UPI: VPA extraction, ~95 handles mapped to apps and banks, risky local parts, `upi://` parsing
  (a UPI link or QR only ever **pays**; a note about receiving money is critical).
- Phones: E.164, 140-series telemarketing, 1600-series banking, toll-free, 1930, foreign numbers.
- Amounts: ₹ 5,000 / Rs. 5000 / INR 5000 / 5k / 5 lakh / 2 crore / 5,00,000 / 25 लाख.
- Verdicts in English or Hindi with headline, summary, signals (with spans into your text),
  entities with mini-verdicts, and advice (1930, cybercrime.gov.in, your bank, Chakshu).
- `CATEGORIES`: an encyclopedia (how it works, red flags, what to do) in English and Hindi,
  also available on its own from `@ruko/engine/categories`.
- Privacy-preserving identifiers: `normalizeIdentifier` + `identifierHash` (SHA-256) for
  k-anonymity range lookups.

## Use

```ts
import { analyze } from '@ruko/engine';

const v = analyze('Dear customer, your SBI YONO account will be blocked today. Update PAN: http://sbi-yono-kyc.in', {
  locale: 'en',          // or 'hi'
  source: 'sms',         // whatsapp | sms | email | web | qr | call | manual
  sender: 'VM-SBIBNK',   // optional: SMS header, phone, email or name
});
v.score;      // 0..100 (90+ here)
v.severity;   // 'critical'
v.category;   // 'kyc_update'
v.headline;   // 'Almost certainly a fake KYC update scam'
v.signals;    // [{ id, category, weight, title, detail, spans: [{ start, end, text }] }]
v.entities;   // urls, upiIds, upiRequests, phones, emails, amounts
v.advice;     // [{ id, title, detail, action?: { label, href }, urgent? }]
```

Single identifiers work too (the kind is auto-detected, or pass `kind`):

```ts
analyze('hdfcbnak.com').headline;              // 'Almost certainly a fake lookalike website'
analyze('refund.support@ybl').severity;         // 'high'
analyze('upi://pay?pa=x@ybl&tn=receive%20cashback').severity; // 'critical'

import { analyzeUrl, analyzeUpiId, parseUpiUri, analyzePhone, extractEntities } from '@ruko/engine';
analyzeUrl('https://paytm-kyc.web.app');  // { impersonates: 'Paytm', impersonationKind: 'free_hosting', risk: 80+, ... }
analyzePhone('1600123456').kind;          // 'service_1600'
```

Hashing for community lookups (send only the 5-character prefix):

```ts
import { identifierHash, hashPrefix } from '@ruko/engine';
const hash = await identifierHash('upi', 'Refund.Support@ybl'); // sha256('upi:refund.support@ybl')
const { prefix, suffix } = hashPrefix(hash);                  // GET /api/v1/range/:prefix
```

`sha256HexSync` (pure JS) is exported for proof-of-work loops where WebCrypto call overhead dominates.

The scam encyclopedia has its own entry, so pages that only analyse do not ship it:

```ts
import { CATEGORIES, CATEGORY_IDS, getCategory } from '@ruko/engine/categories';
```

The same three exports stay on the main entry for compatibility. Apps that alias
`@ruko/engine` to `../engine/src/index.ts` (Vite, WXT) need one more alias, listed before the
main one: `'@ruko/engine/categories': '../engine/src/categories.ts'`.

## Bundle size

The package is `sideEffects: false` and nothing runs at import time, so bundlers keep only what
you import. Measured with `npm run size` (esbuild, minified, gzip level 9):

| Import | min+gzip |
| --- | --- |
| `identifierHash` only | 4.8 KB |
| `analyzeUrl` only | 22.8 KB |
| `analyze` only | 80.4 KB |
| `@ruko/engine/categories` | 21.0 KB |
| everything (`export *`) | 100.3 KB |

Budgets: `identifierHash` <= 5 KB (met), `analyze` <= 70 KB (not met yet: rule patterns,
rule texts in two languages and the i18n tables are about two thirds of it; see docs/STATUS.md).

## Public API

`analyze`, `detectInputKind`, `severityFor`, `extractEntities`, `analyzeUrl`, `parseUrl`,
`analyzeUpiId`, `parseUpiUri`, `upiHandleApp`, `analyzePhone`, `normalizeIdentifier`,
`identifierHash`, `hashPrefix`, `sha256Hex`, `sha256HexSync`, `CATEGORIES`, `CATEGORY_IDS`,
`getCategory`, `registrableDomain`, `isOfficialHost`, `officialDomainsFor`, `detectLanguage`,
`HELPLINE_1930`, `CYBERCRIME_PORTAL`, `CHAKSHU_PORTAL`, `ENGINE_VERSION`, and every type in
`src/types.ts`. Subpath `@ruko/engine/categories`: `CATEGORIES`, `CATEGORY_IDS`, `getCategory`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run build` | tsup: `dist/index.*` and `dist/categories.*` (ESM + CJS + `.d.ts`, shared chunk) |
| `npm test` | vitest: labelled corpus thresholds + unit tests |
| `npm run typecheck` | strict `tsc --noEmit` (consumer-compatible settings) |
| `npm run bench` | 1,000 analyses, must take < 1 s |
| `npm run size` | min+gzip size per import, checks the budgets (`--modules` for per-file bytes) |
| `node scripts/try.mjs "text" [--hi]` | print a verdict from the built bundle |

## Results (v0.1.1)

- Corpus: 188 scams, 126 genuine messages (English, Hindi, Hinglish).
  Recall 96.8% at score >= 60 (required >= 95%); false positives 0.0% at score >= 35 (allowed <= 4%);
  correct top category for 90.7% of caught scams.
- Speed: about 300 µs per analysis in Node (1,000 analyses in about 0.3 s).
- Size: see "Bundle size" above (`analyze` alone 80.4 KB, `identifierHash` alone 4.8 KB).

## License

MIT © Rutvi Rupani
