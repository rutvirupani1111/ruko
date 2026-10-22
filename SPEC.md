# Ruko: India's on-device scam shield

> "Ruko" is Hindi for "stop / wait". Tagline: **Pause. Check. Then trust.**
> Hindi: **रुको। जाँचो। फिर भरोसा करो।**

Indians lose thousands of crores a year to UPI, KYC, "digital arrest", task-job,
investment and courier scams. Existing checkers are cloud chatbots that read your
private messages. Ruko is different:

- **On-device**: every message, link, UPI ID and screenshot is analysed in the
  browser. Nothing private leaves the phone.
- **Built for India**: the scam taxonomy, brands, UPI handles, TRAI number series
  (140 telemarketing, 1600 banking), 1930 helpline, cybercrime.gov.in, Sanchar
  Saathi Chakshu, Hindi and Hinglish.
- **Privacy-preserving community**: optional reports and lookups use k-anonymity
  hash ranges (like HaveIBeenPwned), so even the server never learns what you checked.
- **Teaches, not just warns**: a scam simulator game and an emergency "I got
  scammed" flow.

Three parts, three folders, each its own npm project (no npm workspaces, no shared
lockfile):

```
ruko/
  engine/      @ruko/engine     zero-dependency TypeScript detection engine (npm package)
  web/         Ruko web app     Vite + React PWA, optional Hono API for community reports
  extension/   Ruko Shield      WXT browser extension (Chrome, Edge, Firefox)
```

Consumers import the engine from source: a Vite/WXT `resolve.alias` of
`@ruko/engine` to `../engine/src/index.ts` plus a matching tsconfig `paths` entry.
No build step or `npm link` is needed. The public contract lives in
`engine/src/types.ts` and must stay stable.

---

## Brand and design system (shared by web and extension)

- **Mark**: a rounded shield containing two vertical "pause" bars. Pause equals
  Ruko. Draw it as SVG (no external assets).
- **Palette** (CSS variables, light and dark):
  - ink `#0B1020` (dark background), paper `#FBF8F2` (light background)
  - signal saffron `#FF7A1A` (primary, CTAs), indigo `#4F46E5` (accent)
  - safe `#10B981`, caution `#F59E0B`, danger `#E11D48`, critical `#9F1239`
  - risk meter gradient: safe → caution → danger
- **Type**: display "Bricolage Grotesque", body "Inter", Devanagari "Mukta".
  Self-host through `@fontsource` packages so the PWA works offline. Never load
  fonts from a CDN at runtime.
- **Signature interaction**: red-flag phrases in the user's own text get a
  highlighter-pen sweep (animated `background-size` on a mark), each linked to the
  explanation of that signal.
- **Verdict card**: animated semicircle risk meter with the number counting up,
  severity chip, headline, summary, signals list, entities (links, UPI IDs,
  numbers with their own mini-verdicts), advice with big action buttons
  (Call 1930, Report at cybercrime.gov.in, Report on Chakshu).
- **Motion**: purposeful and fast (≤300 ms), honours `prefers-reduced-motion`.
- **Icons**: lucide. No emoji as UI icons.
- **Copy**: plain, warm, never shaming the victim. No em dashes in UI copy.
- **Accessibility**: WCAG 2.2 AA contrast, keyboard reachable, visible focus,
  labelled controls, `lang` attributes on Hindi text.

---

## 1. engine/ (`@ruko/engine`)

Zero runtime dependencies, pure TypeScript, ESM + CJS + `.d.ts` via tsup, works in
browsers, Node 18+, Web Workers and MV3 service workers. Tree-shakeable, < 60 KB
minified + gzip including rule data.

Implement every export of `src/index.ts` (currently a stub) against
`src/types.ts`. Suggested internal layout: `normalize.ts`, `entities/` (urls, upi,
phones, amounts, emails), `domains/` (public suffix subset, brand registry,
lookalike detection), `rules/` (one file per scam category), `score.ts`,
`i18n/` (en, hi strings), `categories.ts` (CATEGORIES data for the Learn pages),
`advice.ts`, `hash.ts`.

**Detection model**: weighted rules over normalised text (lowercase, Unicode NFKC,
Devanagari and Latin, Hinglish keyword variants, zero-width characters stripped,
digits normalised). Combine with `score = 100 * (1 - Π(1 - w/100))` over positive
weights, then subtract reassuring signals (with a floor), and clamp. Severity from
`severityFor` (safe < 15 ≤ low < 35 ≤ medium < 60 ≤ high < 80 ≤ critical).
Category scores aggregate per category; the top category drives the headline.

**Categories and example red flags** (cover them all, in English, Hindi and Hinglish):
- digital_arrest: CBI, ED, NCB, customs, Mumbai/Delhi police, cyber crime cell,
  "arrest warrant", "money laundering", "your Aadhaar used in", Skype or video
  call, "do not tell anyone", "stay on camera".
- kyc_update: "KYC expired/pending", "account will be blocked/suspended today",
  update link, PAN/Aadhaar link.
- upi_collect: "enter UPI PIN to receive", "collect request", "accept to get
  refund/cashback".
- qr_receive: "scan this QR to receive money".
- fake_refund: "sent by mistake, please return", refund for cancelled order.
- job_task: work from home, like/subscribe YouTube, Telegram tasks, prepaid task,
  "earn ₹5000/day", hotel reviews.
- investment: stock tips VIP group, IPO allotment, guaranteed or double returns,
  crypto trading platform, "SEBI registered" claims.
- lottery_prize: KBC, lucky draw, "you won ₹25 lakh", processing fee.
- loan_app: instant loan without documents, morphed photos threats, contacts access.
- sextortion: video call recording threats.
- otp_theft: "share the OTP", OTP for verification by "bank officer".
- fake_support: customer care numbers on mobiles, "call this number for refund".
- courier_parcel: FedEx/DHL/BlueDart parcel with drugs/passports, parcel held, address update fee.
- utility_disconnect: electricity bill not updated, power cut tonight at 9:30, call officer.
- reward_points: credit card reward points expiring, redeem link.
- tax_refund: income tax refund approved, verify account.
- govt_scheme: PM Kisan, free laptop, ration, subsidy with registration fee.
- malicious_app: `.apk` links ("wedding invitation.apk", "PM Kisan.apk"),
  "install this app".
- remote_access: AnyDesk, TeamViewer, QuickSupport, RustDesk, screen share.
- impersonation: relative in trouble, boss/HR asking for gift cards, army officer (OLX).
- romance, sim_swap (eSIM upgrade, SIM block), phishing_link, lookalike_domain.

**Reassuring signals** (negative weights): "do not share your OTP/PIN with anyone",
official DLT SMS headers (`XX-HDFCBK`, `XX-SBIBNK`, `XX-ICICIT`...) when sent as
SMS with no link to a non-official domain, links only to official domains, plain
transaction alerts without calls to action.

**URLs**: extract (with and without scheme, `www.`, bare domains like
`sbi-kyc.in`), registrable domain via a bundled public suffix subset (all of
`.in` second levels: co.in, net.in, org.in, gen.in, firm.in, ind.in, gov.in,
nic.in, ac.in, edu.in, res.in; plus common multi-part suffixes). Brand registry
(at least 60 Indian brands with official domains): banks (SBI, HDFC, ICICI, Axis,
Kotak, PNB, BoB, Canara, Union, Yes, IDFC First, IndusInd), payments (Paytm,
PhonePe, Google Pay, BHIM/NPCI, Amazon Pay, MobiKwik, CRED), government (uidai,
incometax, epfo, india post, gst, parivahan, digilocker, sancharsaathi, cybercrime,
npci), commerce and delivery (Amazon, Flipkart, Myntra, Meesho, Swiggy, Zomato,
BlueDart, DTDC, Delhivery, FedEx, DHL), telecom and utilities (Jio, Airtel, Vi,
BSNL, Tata Power, Adani Electricity, BESCOM, MSEDCL, Torrent), travel (IRCTC,
MakeMyTrip). Detect: punycode and homoglyph skeletons, edit distance ≤ 2 to a
brand label, brand token inside a non-official domain (`hdfc-reward.in`,
`sbi.kyc-update.top`), free hosting abuse (web.app, firebaseapp.com, vercel.app,
netlify.app, pages.dev, github.io, ngrok, sites.google.com, forms.gle) carrying a
brand, shorteners, raw IPs, `@` userinfo tricks, `http:` with login wording, risky
TLDs, `.apk` downloads, data: URLs. Official domains get `official: true` and
lower the score.

**UPI**: VPA regex, handle registry (at least 70 real handles mapped to apps/banks:
ybl, ibl, axl, okhdfcbank, okicici, oksbi, okaxis, paytm, ptyes, ptaxis, pthdfc,
ptsbi, apl, yapl, upi, ikwik, fbl, airtel, jio, axisbank, icici, hdfcbank, sbi,
kotak, idfcbank, ...). Unknown handle is a risk; names with refund, support, care,
helpdesk, kyc, cashback, reward, lottery, govt, rbi, npci, police, cbi are high risk.
`parseUpiUri` handles `upi://pay?pa=&pn=&am=&tn=&cu=` and always reminds that a
UPI QR or link is for **paying**, never for receiving; a note mentioning
refund, cashback, prize or "receive" is critical.

**Phones**: normalise Indian and international numbers to E.164 (default +91).
Flag international numbers posing as Indian services (+92, +84, +62, +855, +880,
+977, +254, +234, +44 and +1 on WhatsApp job offers), 140-series (registered
telemarketing, low risk but marketing), 1600-series (TRAI series for banks and
financial services: reassuring for bank calls), toll-free 1800, ten-digit mobiles
posing as customer care (risk).

**Amounts**: ₹ 5,000 / Rs. 5000 / INR 5000 / 5k / 5 lakh / 2 crore / 5,00,000.

**i18n**: every title, detail, headline, summary, advice and category text in
English and Hindi (natural Hindi, not literal translation). `detectedLanguage`
returns hinglish for Latin-script Hindi.

**Advice**: always include the right steps for the category, and when money may be
lost: call 1930 (tel:1930), report at https://cybercrime.gov.in, inform the bank to
freeze, report fraud calls/SMS on Chakshu (https://sancharsaathi.gov.in/sfc/).

**hash**: `normalizeIdentifier` (UPI lowercase; phone to E.164 digits; url to
lowercase host + path without query; domain to registrable domain; email lowercase)
and `identifierHash` = SHA-256 hex of `${kind}:${normalized}` via WebCrypto.

**Tests (vitest)**: a labelled corpus in `test/corpus/` of at least 80 scam
messages across every category (English, Hindi, Hinglish) and at least 50 genuine
messages (bank OTP SMS, transaction alerts, delivery updates, Swiggy/Zomato
promos, IRCTC tickets, friends chatting, a real HDFC KYC reminder that points to the
official site). Assert recall ≥ 95% at score ≥ 60 for scams and false positives
≤ 4% at score ≥ 35 for genuine messages, and print a confusion summary. Unit tests
for every extractor, lookalike detection, UPI parsing, phone kinds, amounts,
hashing, locales. Also a `bench` script (1,000 analyses must take < 1 s in Node).

**Package**: `name: @ruko/engine`, MIT, README with examples, `exports` for ESM/CJS/types,
`sideEffects: false`, `files: ["dist"]`, `prepublishOnly` builds and tests. Do not publish.

---

## 2. web/ (Ruko web app)

Vite + React 19 + TypeScript + Tailwind CSS v4 + React Router + motion (framer-motion)
+ vite-plugin-pwa (Workbox). Lazy-load heavy parts: Tesseract.js (OCR of
screenshots, eng + hin, data from jsDelivr on first use), QR decoding
(BarcodeDetector when available, else `jsqr`). Initial JS ≤ 150 KB gzip.

Routes:
- `/` **Check**: hero, one big input (paste message, link, UPI ID, number or
  upi:// link; Paste button; Scan QR from camera or image; Upload screenshot →
  OCR), sample chips ("Try a KYC scam", "Try a genuine bank SMS"...), live
  analysis as you type (debounced), verdict card per the design system, entity
  mini-verdicts, advice, "Report this" (if API configured), "Share this warning"
  (Web Share API with a generated image card), "Read it aloud" (speechSynthesis,
  en-IN / hi-IN).
- `/check` share-target landing (manifest `share_target` GET with title, text, url)
  that pre-fills and runs the analysis.
- `/learn` and `/learn/:category`: the scam encyclopedia from `CATEGORIES`
  (illustrated cards, how it works, red flags, what to do), searchable.
- `/simulator`: **Spot the scam** game. Realistic phone mock-ups for WhatsApp,
  SMS, email, a phone-call transcript and a payment-app collect request. At least
  18 scenarios (12 scams across categories, 6 genuine), each in English and Hindi,
  with highlighted red flags revealed after the answer. Levels, streaks, score,
  confetti for good runs, and a shareable result card (canvas image + Web Share).
  **Elder mode**: big text, high contrast, read-aloud.
- `/help`: **"I think I've been scammed"**. Calm step-by-step emergency flow:
  stop paying, call 1930 within the golden hour, report at cybercrime.gov.in,
  call the bank to freeze, change passwords/UPI PIN, uninstall remote-access apps,
  Chakshu, CEIR for lost phones. A complaint-draft generator (form → neatly
  formatted complaint text to copy or print) that never leaves the device.
- `/report`: report a UPI ID, number or link to the community (category picker),
  proof-of-work in a Web Worker, success state. Hidden or disabled with an
  explanation when `VITE_RUKO_API` is not set.
- `/privacy`: how Ruko works without seeing your data, with an animated
  k-anonymity diagram.
- `/about`: mission, open source, get the browser extension, support the project
  (donation links read from `src/config.ts`, placeholders clearly marked).
- 404.

Everything in English and Hindi (language switch in the header, remembered,
`<html lang>` updated). Optional "Translate this explanation" into other Indian
languages using Chrome's built-in Translator API when present (feature-detect;
hide otherwise). Optional "Explain simply" using Chrome's built-in Prompt API
(`LanguageModel`) when present. Never required.

PWA: installable, offline (engine, app shell, learn content, simulator), icons
generated from the SVG mark, theme colours, `share_target`.

**Community API (optional, `web/server/`)**: Hono app.
- `GET /api/v1/range/:prefix` (5 hex chars) → `{ prefix, entries: [{ suffix, reports, categories, lastReportedAt }] }`,
  cacheable. Clients compute `identifierHash` locally and match the suffix, so the
  server never sees the full hash.
- `POST /api/v1/reports` → `{ hash, kind, category, pow: { nonce, issuedAt, difficulty } }`.
  Valid when SHA-256(`${hash}:${issuedAt}:${nonce}`) has `difficulty` leading zero
  bits (difficulty 18), issuedAt within 10 minutes. Rate-limit by a daily-salted
  hash of the IP. Never store raw identifiers or IPs.
- `GET /api/v1/stats` → counts per category, last 30 days.
- `GET /api/health`.
- Storage: Postgres. PGlite (in-process, file under `.data/`) for local dev and
  tests; `DATABASE_URL` (Neon) in production through the same SQL.
- Show "reported by N people" only when N ≥ 3, always with "community reports,
  not verified".
- Local: `npm run dev` starts Vite on 5181 and the API on 5182 with a Vite proxy
  for `/api`. Production: deploy to Vercel (static build + `api/` function that
  adapts the Hono app). Write `vercel.json` and a DEPLOY.md.

Tests: vitest for components/logic, Playwright e2e (Chromium) covering check flow,
language switch, simulator run, help flow, offline reload. Lighthouse-quality
basics (meta, OG image, manifest, robots, sitemap).

---

## 3. extension/ (Ruko Shield)

WXT (Manifest V3) + React + TypeScript + Tailwind. Builds for chrome, edge, firefox
(`wxt zip` for each). Uses the engine through an alias to `../engine/src/index.ts`.
Everything runs locally; no remote code; no analytics.

- **WhatsApp Web** content script: watch the chat pane with a MutationObserver;
  message containers carry `data-pre-plain-text="[10:15, 23/10/2026] Name: "`.
  Analyse each incoming message once (cache by text hash); for medium and above add
  a compact badge next to the bubble ("Possible KYC scam · Why?") that opens a
  popover with the verdict. Shadow DOM for all injected UI. Never alter the text.
- **Gmail** content script: when an email is open (`div.a3s` body, sender in the
  header), analyse it and show a banner above the body for medium and above.
- **Every site**: analyse `location.href`; when the domain impersonates a brand
  (lookalike, brand on free hosting, punycode), show a full-width interstitial
  ("This is not the real SBI website") with Leave / Continue anyway (remember per
  domain). Hovering a link for 600 ms shows a small safety tooltip on WhatsApp Web
  and Gmail (configurable for all sites). Clicking a `upi://` link shows a
  confirmation that explains it will make a payment.
- **Context menu**: "Check with Ruko" for selected text and links: opens the side panel.
- **Popup**: protection status for the current site with a toggle, quick check
  input, recent detections, links to side panel and options.
- **Side panel**: full verdict view, history (chrome.storage.local, last 200,
  clearable), settings shortcut.
- **Options**: language (en/hi), sensitivity (warn at low/medium/high), site
  toggles (WhatsApp, Gmail, link tooltips everywhere, lookalike shield), optional
  community lookups (off by default; k-anonymity range queries to the configured
  API URL), support panel (UPI ID and Ko-fi/Buy Me a Coffee links from
  `src/config.ts`, placeholders clearly marked).
- Toolbar badge: count of warnings on the current tab.
- Optional on-device AI: if Chrome's `LanguageModel` (Prompt API) is available in
  the extension, offer "Explain in simple words"; Translator API for Hindi. Hidden
  otherwise.
- Icons generated from the SVG mark (16/32/48/128). `store/` folder with listing
  copy (Chrome Web Store, Edge Add-ons, Firefox AMO), privacy policy, and
  1280x800 screenshots taken with Playwright.
- Tests: vitest for logic; Playwright loads the built extension in Chromium and
  checks (a) a local fixture page that imitates WhatsApp's DOM gets badges on scam
  messages only, (b) a lookalike domain mapped to localhost with
  `--host-resolver-rules` shows the interstitial, (c) the popup renders.
