# Ruko web

Pause. Check. Then trust. An on-device scam checker for India (English and Hindi),
built with Vite, React 19, Tailwind CSS v4, React Router and vite-plugin-pwa.
The detection engine is imported from `../engine/src` (`@ruko/engine`).

## What works

- **Check** (`/`, share target `/check`): live on-device analysis, verdict card with
  animated risk meter, highlighted red flags linked to explanations, entity
  mini-verdicts, advice with Call 1930 / cybercrime.gov.in / Chakshu, share-as-image,
  read aloud, QR scan (BarcodeDetector or jsQR), screenshot OCR (Tesseract, lazy).
- **Learn** (`/learn`, `/learn/:category`): searchable scam encyclopedia from the engine.
- **Spot the scam** (`/simulator`): 21 bilingual scenarios on WhatsApp, SMS, email,
  call and payment-app mock-ups, three levels, score, streaks, confetti, result card,
  elder mode (big text, high contrast, read aloud).
- **Help** (`/help`): step-by-step emergency checklist and an on-device complaint
  draft generator (copy, print, download).
- **Community API** (`server/`, `api/`): k-anonymity range lookups, proof-of-work
  reports, stats, health. PGlite locally, Postgres in production.
- PWA: installable, offline app shell, icons from the SVG mark.

**Not built yet** (polished "coming soon" pages): Report (`/report`), Privacy
(`/privacy`), About (`/about`). See `docs/STATUS.md`.

## Commands

```bash
npm install --legacy-peer-deps
npm run dev        # Vite on :5181 + API on :5182 (Vite proxies /api)
npm run build      # production build + bundle budget check (initial JS <= 150 KB gzip)
npm run preview    # serve dist/ on :5181
npm run typecheck
npm test           # vitest (UI logic, scenarios, complaint draft, API with PGlite)
npm run icons      # regenerate icons and og.png from the mark (Playwright Chromium)
```

Deployment: see `DEPLOY.md`.
