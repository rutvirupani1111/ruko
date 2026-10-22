// Generates the toolbar/store icons from the SVG pause-shield mark (src/shared/mark.ts)
// by rasterising it in Playwright's own Chromium. Run: npm run icons
// Outputs: src/public/icon/{16,32,48,128}.png, src/assets/mark.svg, store/icon-128.png,
// store/promo-small-440x280.png and store/promo-marquee-1400x560.png.
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { markSvgString } from '../src/shared/mark.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = (p) => resolve(root, p);

async function ensureDir(file) {
  await mkdir(dirname(file), { recursive: true });
}

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });

async function renderPng(html, width, height, file) {
  await page.setViewportSize({ width, height });
  await page.setContent(`<!doctype html><html><head><style>html,body{margin:0;background:transparent;}</style></head><body>${html}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await ensureDir(file);
  await page.screenshot({ path: file, omitBackground: true, clip: { x: 0, y: 0, width, height } });
  console.log('wrote', file.replace(root, '.'));
}

// Toolbar and manifest icons. 16 and 32 use the bolder small-size bars.
for (const size of [16, 32, 48]) {
  await renderPng(markSvgString({ size, small: size <= 32 }), size, size, out(`src/public/icon/${size}.png`));
}
// 128: Chrome Web Store guidance is 96x96 artwork inside 16px transparent padding.
await renderPng(
  `<div style="width:128px;height:128px;display:grid;place-items:center">${markSvgString({ size: 104 })}</div>`,
  128,
  128,
  out('src/public/icon/128.png'),
);
await renderPng(
  `<div style="width:128px;height:128px;display:grid;place-items:center">${markSvgString({ size: 104 })}</div>`,
  128,
  128,
  out('store/icon-128.png'),
);

// Plain SVG copy of the mark for docs and listings.
await ensureDir(out('src/assets/mark.svg'));
await writeFile(out('src/assets/mark.svg'), `${markSvgString({ size: 64 })}\n`);

// Promotional tiles (brand colours, no screenshots, no third-party marks).
const promo = (w, h, titleSize, subSize, markSize) => `
  <div style="width:${w}px;height:${h}px;display:flex;align-items:center;gap:${Math.round(w * 0.04)}px;padding:0 ${Math.round(w * 0.07)}px;box-sizing:border-box;
    background:radial-gradient(${w}px ${h}px at 85% 120%, rgba(255,122,26,.35), transparent 60%),radial-gradient(${w * 0.8}px ${h}px at 0% -20%, rgba(79,70,229,.35), transparent 60%),#0B1020;
    font-family:'Segoe UI',system-ui,sans-serif;color:#FBF8F2">
    ${markSvgString({ size: markSize })}
    <div>
      <div style="font-size:${titleSize}px;font-weight:800;letter-spacing:-0.02em;line-height:1">Ruko Shield</div>
      <div style="margin-top:${Math.round(subSize * 0.6)}px;font-size:${subSize}px;font-weight:600;color:#FF9445">Pause. Check. Then trust.</div>
      <div style="margin-top:${Math.round(subSize * 0.4)}px;font-size:${Math.round(subSize * 0.78)}px;color:#C9CCD8">Scam warnings for WhatsApp Web, Gmail, fake bank sites and UPI links. On your device.</div>
    </div>
  </div>`;
await renderPng(promo(440, 280, 40, 17, 96), 440, 280, out('store/promo-small-440x280.png'));
await renderPng(promo(1400, 560, 96, 38, 240), 1400, 560, out('store/promo-marquee-1400x560.png'));

await browser.close();
