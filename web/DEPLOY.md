# Deploying Ruko web

Production: **https://ruko-nu.vercel.app** (Vercel project `ruko`), with the community
API as a Vercel Function and its data on Neon Postgres.

The app is a static Vite build (`dist/`) plus the community API (`api/index.ts`, a Vercel
Function wrapping the Hono app in `server/`). Without the API everything still works
except community reports and lookups.

## How production is deployed

The app imports the detection engine from `../engine/src`, which is outside `web/`, so a
Git-connected build that only sees `web/` cannot build it. Deploy from `ruko/web` with the
Vercel CLI and a prebuilt output instead; the build then runs locally with the engine next
to it:

```bash
cd ruko/web
npm install --legacy-peer-deps
vercel pull --yes --environment=production   # project settings + env vars into .vercel/
vercel build --prod                          # runs npm run build, bundles api/ into .vercel/output
vercel deploy --prebuilt --prod              # uploads .vercel/output only
```

`vercel.json` sets the install command (`npm install --legacy-peer-deps`, needed because of
an npm peer-resolution bug), `npm run build`, `dist/`, the `/api/*` rewrite to the function,
the SPA fallback, cache headers (`sw.js` never cached long, hashed assets immutable) and
security headers.

After a deploy, check `https://ruko-nu.vercel.app/api/health` returns
`{ "ok": true, "db": "postgres" }`.

## Environment variables

| Variable | Where | Value |
| --- | --- | --- |
| `VITE_RUKO_API` | Build | `/api` turns community features on. Already set in the committed `.env.production`. |
| `DATABASE_URL` | Runtime | Neon Postgres connection string with `sslmode=require`. The schema is created on first request. |
| `RUKO_SALT_SECRET` | Runtime, optional | Long random string. Daily reporter salts are derived from it. **Without it** each function instance makes its own random secret at start-up, so rate limits and "one report per person per day" apply per instance and reset on a cold start. Everything else works. |
| `RUKO_ALLOWED_ORIGINS` | Runtime, optional | Extra origins allowed to POST reports cross-origin (for example the extension). Same-origin always works. |
| `VITE_SITE_URL` | Build, optional | Public origin for OG tags, robots.txt and sitemap.xml. Defaults to the Vercel production URL. |

Reporter identities are only a keyed, daily-rotating HMAC of the IP address; raw IPs and
raw identifiers are never stored or logged.

## Static hosting only

Run `npm run build` with `VITE_RUKO_API` unset and upload `dist/` to any static host with
an SPA fallback to `index.html`. Community features stay off and `/report` explains why.

## Notes

- `npm run build` copies the Tesseract OCR worker and WebAssembly cores into
  `public/ocr/` (self-hosted, cached by the service worker on first use). OCR language
  data is fetched from jsDelivr the first time a screenshot is read.
- Fonts are bundled from `@fontsource`; no runtime font CDN is used.
- Before deploying, run `npm run typecheck && npm test && npm run build`, and `npm run e2e`
  for the browser suite.
