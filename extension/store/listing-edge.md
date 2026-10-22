# Microsoft Edge Add-ons listing: Ruko Shield

Upload: `.output/ruko-shield-1.0.0-edge.zip` (built by `npm run zip:edge`; Chromium MV3, same
code as Chrome). Submit through Partner Center > Microsoft Edge > Create new extension.

## Properties

- **Category**: Productivity (Edge has no security category; "Productivity" is where safety tools are listed)
- **Privacy policy**: Yes, this extension accesses personal information processed locally. URL: PLACEHOLDER (public copy of `store/PRIVACY.md`)
- **Website / support contact**: PLACEHOLDER
- **Mature content**: No

## Store listing (English, India and all markets)

- **Display name**: Ruko Shield: Scam and Fake Link Checker
- **Short description** (from manifest): Pause. Check. Then trust. On-device warnings for scam messages, fake bank websites, risky links and UPI payment links.
- **Description**: use the English description in `listing-chrome.md` (identical features on Edge). Replace "Chrome's built-in AI" mentions with "your browser's built-in AI" (already worded that way).
- **Search terms** (max 7): scam checker, UPI fraud, phishing, fake website, WhatsApp scam, KYC scam, cyber fraud India
- **Store logo**: `store/icon-128.png` (300x300 also accepted; upscale from the SVG with `npm run icons` if requested)
- **Screenshots** (1280x800): `store/screenshots/*.png` (up to 10)
- **Small promotional tile** (440x280): `store/promo-small-440x280.png`
- **Large promotional tile** (1400x560, optional): `store/promo-marquee-1400x560.png`

## Hindi listing

Add a Hindi (hi) listing with the Hindi description from `listing-chrome.md`. The extension
UI itself switches to Hindi on the options page or from the popup.

## Notes for certification

- Same notes as Chrome: all-site host permission is used by the lookalike-website shield and
  the upi:// confirmation; no data leaves the device unless the user enables optional
  k-anonymity community lookups (5-character hash prefixes only).
- The side panel uses Edge's `sidePanel` API (Edge 116+).
