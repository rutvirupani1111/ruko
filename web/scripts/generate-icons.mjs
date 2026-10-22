// Generates every icon and the Open Graph image from the SVG mark, using the
// Playwright Chromium that the e2e suite already needs. Run: npm run icons
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');
const require = createRequire(join(root, 'package.json'));
mkdirSync(join(pub, 'icons'), { recursive: true });

const INK = '#0B1020';
const PAPER = '#FBF8F2';
const SAFFRON = '#FF7A1A';
const SHIELD =
  'M32 4.5c-7 4.1-14.8 6.4-22.9 6.9A2.6 2.6 0 0 0 6.7 14v15.9c0 15.4 10.1 27.7 24.6 32a2.4 2.4 0 0 0 1.4 0c14.5-4.3 24.6-16.6 24.6-32V14a2.6 2.6 0 0 0-2.4-2.6C46.8 10.9 39 8.6 32 4.5Z';
const BARS = `<rect x="22.5" y="21" width="7" height="23" rx="3.5"/><rect x="34.5" y="21" width="7" height="23" rx="3.5"/>`;

/** The bare mark: saffron shield, ink pause bars, transparent background. */
const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="${SAFFRON}" d="${SHIELD}"/><g fill="${INK}">${BARS}</g></svg>\n`;

/** App icon: the mark on an ink tile. `scale` is the mark size relative to the tile. */
function tileSvg({ scale, radius }) {
  const size = 64 * scale;
  const offset = (64 - size) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="${radius}" fill="${INK}"/><g transform="translate(${offset} ${offset + 0.6}) scale(${scale})"><path fill="${SAFFRON}" d="${SHIELD}"/><g fill="${INK}">${BARS}</g></g></svg>\n`;
}

writeFileSync(join(pub, 'favicon.svg'), markSvg);
writeFileSync(join(pub, 'icons', 'icon.svg'), tileSvg({ scale: 0.74, radius: 14 }));

const fontData = (pkgFile) => readFileSync(require.resolve(pkgFile)).toString('base64');
const fonts = `
@font-face{font-family:'Bricolage';font-weight:200 800;src:url(data:font/woff2;base64,${fontData('@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2')}) format('woff2');}
@font-face{font-family:'Inter';font-weight:100 900;src:url(data:font/woff2;base64,${fontData('@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')}) format('woff2');}
@font-face{font-family:'Mukta';font-weight:800;src:url(data:font/woff2;base64,${fontData('@fontsource/mukta/files/mukta-devanagari-800-normal.woff2')}) format('woff2');}
@font-face{font-family:'Mukta';font-weight:600;src:url(data:font/woff2;base64,${fontData('@fontsource/mukta/files/mukta-devanagari-600-normal.woff2')}) format('woff2');}
`;

const ogHtml = `<!doctype html><html><head><meta charset="utf-8"><style>
${fonts}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:${INK};color:${PAPER};font-family:Inter,sans-serif;overflow:hidden;position:relative}
.glow{position:absolute;right:-180px;top:-220px;width:760px;height:760px;border-radius:50%;background:radial-gradient(circle, rgba(255,122,26,.42), rgba(255,122,26,0) 65%)}
.wrap{position:absolute;inset:0;display:flex;align-items:center;gap:64px;padding:0 84px}
.mark{width:300px;height:300px;flex:none;filter:drop-shadow(0 30px 60px rgba(255,122,26,.25))}
.eyebrow{font:700 26px Inter;letter-spacing:.14em;text-transform:uppercase;color:rgba(251,248,242,.7)}
h1{font:800 98px/0.98 Bricolage,Mukta,sans-serif;letter-spacing:-.03em;margin-top:18px}
.hl{background:linear-gradient(102deg,rgba(255,122,26,0) .6%,rgba(255,122,26,.75) 2.4%,rgba(255,122,26,.55) 6%,rgba(255,122,26,.5) 90%,rgba(255,122,26,.75) 96%,rgba(255,122,26,0) 99%);border-radius:.6em .2em;padding:0 .12em;margin:0 -.06em}
.trust{color:${SAFFRON}}
.hi{font:800 40px Mukta,sans-serif;margin-top:22px;color:rgba(251,248,242,.88)}
.foot{position:absolute;left:0;right:0;bottom:0;height:16px;background:${SAFFRON}}
</style></head><body><div class="glow"></div><div class="wrap">
<svg class="mark" viewBox="0 0 64 64"><path fill="${SAFFRON}" d="${SHIELD}"/><g fill="${INK}">${BARS}</g></svg>
<div><p class="eyebrow">India's on-device scam shield</p><h1>Pause. <span class="hl">Check.</span><br><span class="trust">Then trust.</span></h1>
<p class="hi" lang="hi">रुको। जाँचो। फिर भरोसा करो।</p></div></div><div class="foot"></div></body></html>`;

const svgPage = (svg, size) =>
  `<!doctype html><html><head><style>*{margin:0}html,body{width:${size}px;height:${size}px;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style></head><body>${svg}</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });

async function renderSvg(svg, size, file, transparent = true) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(svgPage(svg, size));
  return page.screenshot({ path: file, omitBackground: transparent, type: 'png' });
}

const anyIcon = tileSvg({ scale: 0.74, radius: 14 });
// Maskable icons must keep the mark inside the central 80% safe circle.
const maskable = tileSvg({ scale: 0.58, radius: 0 });
const apple = tileSvg({ scale: 0.7, radius: 0 });

await renderSvg(anyIcon, 192, join(pub, 'icons', 'icon-192.png'));
await renderSvg(anyIcon, 512, join(pub, 'icons', 'icon-512.png'));
await renderSvg(maskable, 512, join(pub, 'icons', 'maskable-512.png'), false);
await renderSvg(apple, 180, join(pub, 'apple-touch-icon.png'), false);
const png32 = await renderSvg(markSvg, 32, join(pub, 'icons', 'favicon-32.png'));

// favicon.ico holding one 32x32 PNG image.
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
const entry = Buffer.alloc(16);
entry.writeUInt8(32, 0);
entry.writeUInt8(32, 1);
entry.writeUInt8(0, 2);
entry.writeUInt8(0, 3);
entry.writeUInt16LE(1, 4);
entry.writeUInt16LE(32, 6);
entry.writeUInt32LE(png32.length, 8);
entry.writeUInt32LE(6 + 16, 12);
writeFileSync(join(pub, 'favicon.ico'), Buffer.concat([header, entry, png32]));

await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(ogHtml);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: join(pub, 'og.png'), type: 'png' });

await browser.close();
console.log('[icons] wrote favicon.svg, favicon.ico, apple-touch-icon.png, icons/*, og.png');
