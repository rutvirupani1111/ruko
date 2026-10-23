# Ruko web: build status

Last updated: 2026-10-23, end of overnight session 2. Live at https://ruko-nu.vercel.app (deployed by the lead).

## Verified at the end of this session
- `npm run typecheck`: passes (app + node configs, including `e2e/` and `playwright.config.ts`).
- `npm test`: 59 vitest tests pass (34 before session 3) (PoW on the engine's `sha256HexSync` vs WebCrypto, report input
  rules, scenarios, complaint draft, 12 API tests on PGlite including a full-difficulty proof from
  the browser solver).
- `npm run build`: passes. Initial JS **133.2 KB gzip** (budget 150). PoW worker chunk 1.2 KB
  (tree-shaken to `sha256HexSync`). Engine chunk still ~100 KB gzip, lazy.
- `npm run e2e`: 21 Playwright tests pass in Chromium (about 1.5 min).
- 375px, English and Hindi: no horizontal overflow on any route (checked with a script).
- All servers I started are stopped (ports 5181/5182 free).

## Done in session 3 (Gujarati and Marathi)
- `Locale` is now `en | hi | gu | mr` (`src/i18n/core.tsx`). Each `defineStrings(id, en, hi)` names
  a bundle slot; `pick()`/`useT()` read gu/mr from code-split bundles (`src/i18n/locales/gu.ts`,
  `mr.ts`, each split into `-core` and `-pages` halves) and fall back to the base language.
  `main.tsx` loads the bundle before first render; `setLocale` loads before switching (no flash).
- `baseLocale()`: Marathi -> Hindi, Gujarati -> English for everything the engine writes, the
  simulator scenarios, sample messages and Learn category content. The complaint draft has its own
  gu/mr letters (`src/features/help/letters.ts`).
  Notes on the verdict card and simulator say which language that text is in.
- Chrome built-in Translator: translation source is now the verdict's language (it used the UI
  locale), and gu/mr readers get a one-tap "Translate into ગુજરાતી/मराठी" button.
- Latin digits forced in `Intl` (`numberFormat()`): `mr-IN` defaults to Devanagari digits.
- Fonts: `@fontsource/noto-sans-gujarati` 400/600/800 with unicode-range; `html:lang(gu|mr)`
  font rules; `index.html` boot script and manifest description know gu/mr.
- Tests: `src/i18n/locales.test.ts` checks every gu/mr slot against the English shape (keys,
  function arity, array lengths) and its script; fallback and Latin-digit rules.
- Not done: simulator scenarios in gu/mr (they fall back to English/Hindi, with a visible note);
  gu/mr Learn category names (engine data, en/hi only); e2e and 375px overflow sweep not re-run
  for gu/mr. Translations were written by the model, not yet reviewed by native speakers.

## Done in session 2
- **/report**: real form. Kind switch (UPI ID, number, link), hand-off chips from the checker's
  "Report this", category picker (engine names + "Something else") with the category summary,
  live "Will be reported as" preview. Validation via `src/features/report/prepare.ts`: official
  sites and helpline short codes (1930 ...) refused; wrong-box input offers to switch kind.
  Submit: fingerprint, then proof-of-work in a Web Worker with staged progress and cancel, then
  POST. Success (count shown only from 3 reports) and error states (duplicate, rate limited,
  network, server, invalid, PoW). "Community reports, not verified" copy. Disabled card with
  official links when `VITE_RUKO_API` is unset; offline notice.
- **PoW** now uses the engine's `sha256HexSync` (`src/lib/pow.ts`, `src/lib/pow.worker.ts`). The
  web's duplicate SHA-256 (`src/lib/sha256.ts`) is gone. Cost: about 8.6 us per hash in Node vs
  1.2 us for the old midstate solver, so ~2.3 s average on a desktop at difficulty 18 and likely
  10 s+ on low-end phones. See "Requests for engine".
- **Link reporting rule** (`linkReportable` in `src/lib/community.ts`), shared by lookups and
  reports: a page on a big platform (google.com, t.me, github.com, ...), IP-address links,
  shorteners and known-good sites are reported/looked up as the exact link, never the whole
  domain. Before this, a fake Google Form in a checked message would have reported google.com.
- **/privacy**: on-device cards, animated k-anonymity diagram (4 steps, auto-play that respects
  reduced motion, play/pause, step buttons, live caption; vertical on phones, horizontal on
  desktop), "try it" fingerprint box (computed locally), community lookups switch, what the
  server keeps and never gets, open-source call-out. English and Hindi.
- **/about**: mission, principles, what you can do (links), open source (repo + issues),
  Ruko Shield from GitHub releases with install steps, support panel whose unset links render as
  "Not set up yet" (never links to fake URLs), disclaimer. English and Hindi.
- `src/config.ts`: real repo, issues and releases links (`rutvirupani1111/ruko`); store listings
  and donation links remain placeholders. `ComingSoon.tsx` removed (unused).
- **Playwright e2e** (`playwright.config.ts`, `e2e/`): check flow (KYC sample: critical verdict,
  highlights, 1930 action, lookups send 5-char prefixes only), "Report this" hand-off, Hindi
  switch (remembered), full simulator run (score matches answers, best result remembered), help
  checklist persistence and complaint draft + copy, report form through the PoW step with the API
  mocked (checks the POST body is only a hash that matches `upi:<id>` and a valid 18-bit proof),
  cancel, validation, duplicate answer, privacy diagram and lookups switch, about links and
  placeholders, axe (WCAG 2.2 AA, light and dark) on /report /privacy /about, offline reload after
  the service worker installs.
- **Visual review** (375px, dark, every simulator channel, elder mode, summary, help): fixed elder
  mode in dark mode (the phone was a glaring white screen; now inverted high contrast), fixed a
  12px overflow on /about, stronger active state on the report kind switch.
- README (features, screenshots from `npm run screenshots` in `docs/screenshots/`, live URL) and
  DEPLOY.md (lead's `vercel pull` / `vercel build --prod` / `vercel deploy --prebuilt --prod`
  flow from `ruko/web`; `RUKO_SALT_SECRET` optional, rate limits per instance without it).

## Not done (next session, in priority order)
1. Component tests (VerdictCard, LanguageSwitch) and a contrast-check script for the tokens.
2. Axe checks for the older pages (/, /learn, /simulator, /help) in the e2e suite; only the new
   pages are covered so far.
3. Maybe lazy-load the verdict card with the engine to cut initial JS further.
4. Help page polish seen in review (not bugs): native checkboxes in the complaint form look plain
   in dark mode; the decorative "1930" watermark sits under the call card's body text.

## Known issues
- Proof-of-work speed on low-end phones (see above). The UI shows honest progress and can be
  cancelled, but a slow phone may wait 10-20 s.
- Some engine signals carry very short evidence spans ("KYC", "SBI"); they are highlighted but quotes
  under signals show only phrases of 4+ characters.

## Requests for engine
- A faster PoW path: `sha256HexSync` allocates per call (TextEncoder, buffers, hex string). A
  midstate-based `solvePow(prefix, difficulty, onProgress)` or a bytes-in/bytes-out variant would make
  reports about 7x faster on phones.
- Export `isUserContentHost` (or flag platform hosts on `UrlFinding`) so the web's
  `PLATFORM_DOMAINS` list can go.
- Engine chunk is ~100 KB gzip (lazy here, so the web budget holds), above the spec's 60 KB target.
