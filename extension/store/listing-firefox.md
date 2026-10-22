# Firefox Add-ons (AMO) listing: Ruko Shield

Upload: `.output/ruko-shield-1.0.0-firefox.zip`, and when asked for source code,
`.output/ruko-shield-1.0.0-sources.zip` (both built by `npm run zip:firefox`).

## Listing

- **Name**: Ruko Shield: Scam and Fake Link Checker
- **Add-on URL slug**: ruko-shield
- **Summary** (max 250 chars): Pause. Check. Then trust. Ruko Shield warns you about scam messages on WhatsApp Web and Gmail, fake bank and government websites, risky links and UPI payment links. Everything is checked on your device. English and Hindi.
- **Description**: use the English description in `listing-chrome.md`.
- **Categories**: Privacy & Security; Social & Communication
- **Tags**: scam, phishing, upi, india, whatsapp, privacy
- **License**: MIT
- **Icon**: `store/icon-128.png`
- **Screenshots**: `store/screenshots/*.png`
- **Support email / website**: PLACEHOLDER
- **Privacy policy**: paste `store/PRIVACY.md`

## Manifest notes

- Manifest V3, background as an event page (`background.scripts`), side panel as
  `sidebar_action`.
- `browser_specific_settings.gecko.id` is `ruko-shield@ruko-extension`. **The ID is permanent
  after the first upload; change it in `wxt.config.ts` before submitting if you prefer
  another one.**
- `strict_min_version` 140.0 and `data_collection_permissions: { required: ["none"] }`:
  Ruko does not transmit user data. The optional community lookup (off by default, user
  supplies the server) sends only a 5-character SHA-256 prefix, which identifies nothing.
  If a reviewer classifies it as data collection, declare it as optional
  `"browsingActivity"` in `wxt.config.ts`.
- Firefox 127+ grants host permissions at install; on older versions users can grant
  "Access your data for all websites" from the add-on's Permissions tab.

## Notes to reviewer (paste into "Notes to Reviewer")

```
Ruko Shield is built with WXT (Vite) from TypeScript sources. It depends on a sibling
package, @ruko/engine, which is consumed from source (../engine/src/index.ts); the
sources ZIP therefore contains both folders:

  ruko/
    SPEC.md
    engine/     detection engine (no runtime dependencies)
    extension/  this add-on

Build (Node 22 or newer, npm 10):
  cd extension
  npm ci            # .npmrc sets legacy-peer-deps=true
  npm run build:firefox
Output: extension/.output/firefox-mv3 (identical to the uploaded ZIP).

No remote code, no analytics, no obfuscation. Bundles are minified by Vite/Rolldown only.
Host permissions on all http/https pages are needed for the lookalike-website warning and
the upi:// payment-link confirmation; only the page address is passed to the add-on's own
background script.
```
