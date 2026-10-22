# Ruko web: build status

Last updated: 2026-10-23, end of overnight session 1 (stopped early on a budget alert).

## Verified at the end of this session
- `npm run typecheck`: passes (app + node configs, including the real engine source).
- `npm run build`: passes. Initial JS **131.9 KB gzip** (budget 150; enforced by `scripts/check-bundle.mjs`).
  Engine chunk is lazy (~100 KB gzip, larger than the engine's own 60 KB target: engine-side).
- `npx vitest run`: 23 tests pass (scenario integrity in both languages, complaint draft, 11 API tests on PGlite).
- `node scripts/smoke.mjs` against `npm run preview`: every route renders an h1 with no page errors;
  Check flow returns critical verdicts for the KYC sample in English and Hindi; `/check?text=` share
  target pre-fills, analyses and strips the text from the URL.
- All servers I started are stopped (ports 5181/5182 free).

## Done
- Scaffold: Vite 8 (Rolldown), React 19, TS 6, Tailwind v4, React Router 8, motion 14, vite-plugin-pwa 2.
  `npm install --legacy-peer-deps` is required (npm 10.9 arborist crash on vitest peer sets).
  jsdom pinned to 26 (jsdom 30 needs a newer Node than 23.6).
- Design system: tokens (light/dark, AA-tuned text colours), self-hosted fonts, highlighter `.hl` signature,
  paper grain, reduced-motion safety net, pause-shield mark, icons + OG image from the mark (`npm run icons`).
- Shell: header, mobile menu (native dialog), bottom tab bar, footer with helplines, EN/हिं switch
  (remembered, `<html lang>`), theme toggle, route progress, focus management, offline + PWA update toasts.
- `/` and `/check`: full Check page (paste, QR via BarcodeDetector/jsQR, screenshot OCR via self-hosted
  Tesseract worker/core + jsDelivr lang data, samples, source/sender, live analysis, verdict card with risk
  meter, highlighted message, signals, entity mini-verdicts, community "reported by N" (N >= 3), advice with
  official big buttons, share image, read aloud, Report this, Chrome Translator/Prompt API tools when present).
- `/learn`, `/learn/:category`: searchable encyclopedia from engine `CATEGORIES` with illustrated cards.
- `/simulator`: 21 bilingual scenarios (14 scam / 7 genuine) on WhatsApp, SMS, email, call, payment mock-ups;
  3 levels, score, streak, confetti, shareable result card, elder mode (big text, high contrast, read aloud).
- `/help`: 9-step emergency checklist (saved locally) + on-device complaint draft (en/hi, copy, print, .txt).
- 404 page.
- Community API: `server/app.ts` (Hono), `server/db.ts` (PGlite or Postgres), `server/node.ts` (:5182),
  `api/index.ts` (Vercel function, Web handler exports). `vercel.json`, `DEPLOY.md`, `README.md`.

## Not done (next session, in priority order)
1. **Report page** (`/report`, currently a polished "coming soon"): form (kind, value, category picker using
   engine names), validate with `analyzeUpiId/analyzePhone/analyzeUrl`, refuse official domains, call
   `submitReport()` in `src/lib/community.ts` (PoW worker + POST already implemented and tested server-side),
   success state, disabled explanation when `config.apiBase` is null. Check page already navigates here with
   `state: { items, category }`.
2. **Privacy page** (`/privacy`, coming soon): on-device explanation + animated k-anonymity diagram
   (hash on device with `identifierHash`, send 5-char prefix, match suffix locally) + community lookups toggle
   (`setCommunityLookups` in `src/lib/community.ts`).
3. **About page** (`/about`, coming soon): mission, open source, extension links, support links from
   `src/config.ts` (placeholders render as "Not set up yet").
4. **Playwright e2e suite** (`playwright.config.ts` + `e2e/`): not written yet. Plan: webServer =
   `npm run build:e2e && npm run preview` (5181) + `RUKO_DB=memory RUKO_TRUST_PROXY=1 npm run api` (5182);
   specs for check flow, language switch, simulator run, help flow, offline reload (SW), axe checks.
   Playwright 1.61.1 matches the cached Chromium 1228. `scripts/smoke.mjs` is a stopgap.
5. Component tests (VerdictCard, LanguageSwitch) and a contrast-check script for the tokens.
6. Polish: visual QA of the simulator mock-ups and help form at 375px and in dark mode (not screenshot-reviewed
   yet); maybe lazy-load the verdict card with the engine to cut initial JS further.

## Known issues
- Vercel deployment not tested (Web-handler function exports and `../engine` access per DEPLOY.md).
- Some engine signals carry very short evidence spans ("KYC", "SBI"); they are highlighted but quotes under
  signals show only phrases of 4+ characters.

## Requests for engine
- Engine chunk is ~100 KB gzip (lazy here, so the web budget holds), above the spec's 60 KB engine target.
