# Ruko Shield: build status

Last updated: 2026-10-23 ~04:05. State: **feature complete, all checks green** against the real
engine (`ENGINE_VERSION` 0.1.0).

## Verified (last `npm run verify`, exit 0)
- Typecheck (`wxt prepare && tsc --noEmit`, includes engine sources and tests): clean.
- Unit tests (Vitest 5, happy-dom, WXT fake browser): 14 files, 99 tests passing.
- Builds: chrome-mv3, edge-mv3, firefox-mv3 (all Manifest V3).
- Zips in `.output/`: `ruko-shield-1.0.0-chrome.zip`, `-edge.zip`, `-firefox.zip`, plus
  `ruko-shield-1.0.0-sources.zip` for AMO (contains `SPEC.md`, `engine/`, `extension/`).
- Playwright e2e (Playwright's own Chromium 1228, headless, extension loaded): 21 passing.
  WhatsApp fixture badges scam messages only (text untouched, outgoing skipped), popover,
  tooltips, popup site toggle + live count, toolbar badge text; lookalike interstitial via
  `--host-resolver-rules` (shows, Continue remembered, Leave -> safe page, benign silent);
  Gmail banner; upi:// dialog; tooltips-everywhere opt-in; popup/side panel/options render,
  Hindi switch, history clear; built-package checks (permissions, no engine/React in
  content scripts, no remote code).
- Store assets: `store/listing-{chrome,edge,firefox}.md`, `PRIVACY.md`, `PERMISSIONS.md`,
  icons, promo tiles, 7 screenshots (1280x800) via `npm run screenshots`.

## Architecture notes
- Engine only in background + extension pages. Content scripts (`guard` on every site,
  `whatsapp`, `gmail`) are framework-free, message the background (analysis off the page
  thread), cache by text hash, render in open Shadow DOM with one constructed stylesheet.
- Host elements carry inline `all: initial !important`; typography is therefore set on the
  top-level `.rk-*` containers via CSS custom properties (see `src/content/ui/styles.css`).
- Uses engine 0.1.0 extras: `impersonationKind` (interstitial ignores 'path' kind),
  `officialDomain` ("Go to sbi.co.in instead"), `knownGood`, `download`.

## Not done / known limitations
- Real WhatsApp Web and Gmail DOMs were not exercised (no network access in tests by design);
  selectors follow `data-pre-plain-text`, `.message-in/.message-out`, `div.a3s`, `span.gD`.
- `sidePanel.open()` from an in-page "See full analysis" click depends on the browser keeping
  the user gesture through messaging; fallback opens `sidepanel.html` in a tab.
- Firefox build is built and zipped but not run in Firefox (Playwright suite is Chromium only).
- WXT 0.21.4 prints harmless "Could not get stats" warnings while zipping sources from
  `sourcesRoot: ..` (path bug in its size logging); the sources zip content is correct.
- Placeholders to fill before publishing: `src/config.ts` (UPI ID, Ko-fi, Buy Me a Coffee,
  web app URL, privacy URL), support email in `store/PRIVACY.md`, store URLs, and review the
  permanent Firefox id `ruko-shield@ruko-extension` in `wxt.config.ts`.

## Next steps (future session)
1. Manual pass on real web.whatsapp.com and mail.google.com (light and dark themes).
2. Load the Firefox build with `web-ext run` and check sidebar, context menu, badge.
3. Optional: split the in-page CSS per script to shrink `guard.js` (about 45 KB today).

## Requests for engine
- None open. (Earlier requests for an official-domain field were answered by
  `UrlFinding.officialDomain` and `officialDomainsFor`.)
