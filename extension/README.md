# Ruko Shield (browser extension)

On-device scam warnings for India, built with WXT (Manifest V3), React, TypeScript and
Tailwind. Uses `@ruko/engine` from source (`../engine/src/index.ts`). Chrome, Edge and
Firefox. English and Hindi.

## What works (verified by tests)

- **WhatsApp Web**: badge under suspicious incoming messages ("Likely KYC scam · Why?"),
  verdict popover, "Not a scam? Hide", outgoing messages ignored, message text never edited.
- **Gmail**: banner above suspicious emails with expandable reasons.
- **Lookalike websites**: full-page interstitial on every http(s) site ("This is not the real
  SBI website"), link to the real site, Leave (safe page) / Continue anyway (remembered).
- **Link tooltips** after a 600 ms hover (WhatsApp Web and Gmail; optional everywhere).
- **upi:// confirmation** explaining that a UPI link only ever pays.
- **Context menu** "Check with Ruko" -> side panel. **Popup** (site toggle, live warning count,
  quick check, recent detections). **Side panel** (full verdict with highlighter sweep,
  entities, advice, history of last 200, clear). **Options** (language, sensitivity, site
  toggles, site lists, history, community lookups off by default, AI status, support panel
  with placeholder tags). **Toolbar badge** count per tab.
- **Optional on-device AI**: "Explain in simple words" (Prompt API) and Hindi translation
  (Translator API), feature-detected and hidden when absent.

## Commands

```bash
npm ci                 # .npmrc sets legacy-peer-deps=true (npm 10 peer resolver crash)
npm run build          # chrome, edge and firefox into .output/*-mv3
npm run zip            # .output/ruko-shield-1.0.0-{chrome,edge,firefox}.zip (+ sources zip)
npm run typecheck
npm test               # vitest unit tests
npm run test:e2e       # builds chrome, then Playwright (fixture server on port 5183)
npm run icons          # regenerate icons from the SVG mark
npm run screenshots    # 1280x800 store screenshots into store/screenshots
npm run verify         # all of the above checks in one go
```

## Load unpacked

- Chrome / Edge: `chrome://extensions` (or `edge://extensions`) -> Developer mode -> Load
  unpacked -> `.output/chrome-mv3` (or `.output/edge-mv3`).
- Firefox: `about:debugging#/runtime/this-firefox` -> Load Temporary Add-on ->
  `.output/firefox-mv3/manifest.json`.

Store copy, privacy policy, permission justifications and screenshots: `store/`.
Build log and open items: `docs/STATUS.md`.
