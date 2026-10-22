# Deploying Ruko web

The app is a static Vite build (`dist/`) plus an optional community API
(`api/index.ts`, a Vercel Function wrapping the Hono app in `server/`).
Without the API everything still works except community reports and lookups.

> Status: the build and the API were verified locally (`npm run build`,
> `npm run preview`, API tests with PGlite). A real Vercel deployment has
> **not** been tried yet.

## Vercel (static app + API)

1. Import the repository and set **Root Directory** to `web`.
   Keep "Include source files outside of the Root Directory" **on**: the app
   imports the engine from `../engine/src`.
2. `vercel.json` already sets the install command (`npm install --legacy-peer-deps`,
   needed because of an npm peer-resolution bug), `npm run build`, `dist/`,
   `/api/*` to the function, and the SPA fallback.
3. Create a Postgres database (for example Neon) and set environment variables:

   | Variable | Where | Value |
   | --- | --- | --- |
   | `VITE_RUKO_API` | Build | `/api` (turns community features on) |
   | `DATABASE_URL` | Runtime | Postgres connection string with `sslmode=require` |
   | `RUKO_SALT_SECRET` | Runtime | Long random string (daily reporter salts are derived from it) |
   | `VITE_SITE_URL` | Build, optional | `https://your-domain` (OG tags, sitemap). Defaults to the Vercel production URL |
   | `RUKO_ALLOWED_ORIGINS` | Runtime, optional | Extra origins allowed to POST reports (e.g. the extension) |

   The schema is created automatically on first request.
4. Check `https://your-domain/api/health` returns `{ "ok": true, "db": "postgres" }`.

## Static hosting only

Run `npm run build` and upload `dist/` to any static host with an SPA fallback
to `index.html`. Leave `VITE_RUKO_API` unset: community features stay off.

## Notes

- `npm run build` copies the Tesseract OCR worker and WebAssembly cores into
  `public/ocr/` (self-hosted, cached by the service worker on first use). OCR
  language data is fetched from jsDelivr the first time a screenshot is read.
- The service worker (`sw.js`) must not be cached long; `vercel.json` handles it.
- Fonts are bundled from `@fontsource`; no runtime font CDN is used.
