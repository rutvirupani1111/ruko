import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv, searchForWorkspaceRoot, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { CATEGORY_ORDER } from './src/data/categories';

const engineSrc = fileURLToPath(new URL('../engine/src', import.meta.url));
const API_TARGET = 'http://localhost:5182';

/** Public origin of the deployed site, used for OG tags, robots.txt and sitemap.xml. */
function resolveSiteUrl(env: Record<string, string>): string {
  const explicit = env.VITE_SITE_URL || process.env.VITE_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, '');
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return 'http://localhost:5181';
}

/** Emits robots.txt and sitemap.xml and fills %SITE_URL% in index.html. */
function rukoSeo(siteUrl: string): Plugin {
  const routes = ['/', '/learn', '/simulator', '/help', '/report', '/privacy', '/about', ...CATEGORY_ORDER.map((c) => `/learn/${c}`)];
  return {
    name: 'ruko-seo',
    transformIndexHtml(html) {
      return html.replaceAll('%SITE_URL%', siteUrl);
    },
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10);
      const urls = routes
        .map((r) => `  <url><loc>${siteUrl}${r}</loc><lastmod>${today}</lastmod><changefreq>${r === '/' ? 'weekly' : 'monthly'}</changefreq></url>`)
        .join('\n');
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const siteUrl = resolveSiteUrl(env);

  return {
    plugins: [
      react(),
      tailwindcss(),
      rukoSeo(siteUrl),
      VitePWA({
        registerType: 'prompt',
        injectRegister: false,
        includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png'],
        manifest: {
          id: '/',
          name: 'Ruko: scam checker for India',
          short_name: 'Ruko',
          description:
            'Pause. Check. Then trust. Check messages, links, UPI IDs and numbers for scams, privately on your own phone.',
          lang: 'en-IN',
          dir: 'ltr',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          background_color: '#FBF8F2',
          theme_color: '#0B1020',
          categories: ['security', 'utilities', 'education'],
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
            { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          ],
          shortcuts: [
            { name: 'Check a message', short_name: 'Check', url: '/', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
            { name: 'I think I have been scammed', short_name: 'Get help', url: '/help', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
            { name: 'Spot the scam game', short_name: 'Play', url: '/simulator', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
          ],
          share_target: {
            action: '/check',
            method: 'GET',
            params: { title: 'title', text: 'text', url: 'url' },
          },
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,webmanifest}'],
          globIgnores: ['ocr/**', 'og.png', '**/node_modules/**'],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//, /^\/ocr\//, /\/[^/?]+\.(?:xml|txt|json|png|svg|ico|js|css|webmanifest)$/],
          cleanupOutdatedCaches: true,
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
          runtimeCaching: [
            {
              // Self-hosted OCR worker and WebAssembly core: cached after first use so OCR also works offline.
              urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/ocr/'),
              handler: 'CacheFirst',
              options: {
                cacheName: 'ruko-ocr',
                expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 120 },
              },
            },
          ],
        },
        devOptions: { enabled: false },
      }),
    ],
    resolve: {
      alias: {
        '@ruko/engine': `${engineSrc}/index.ts`,
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    define: {
      __SITE_URL__: JSON.stringify(siteUrl),
    },
    server: {
      port: 5181,
      strictPort: true,
      proxy: { '/api': { target: API_TARGET, changeOrigin: false } },
      fs: { allow: [searchForWorkspaceRoot(process.cwd()), engineSrc] },
    },
    preview: {
      port: 5181,
      strictPort: true,
      proxy: { '/api': { target: API_TARGET, changeOrigin: false } },
    },
    worker: { format: 'es' },
    build: {
      manifest: true,
      chunkSizeWarningLimit: 900,
    },
  };
});
