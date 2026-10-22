// Takes the 1280x800 store screenshots with Playwright's own Chromium and the built
// extension (.output/chrome-mv3). Run: npm run screenshots (builds first).
// Uses the same local fixtures as the e2e suite; nothing touches the real internet.
import { spawn } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
import { createConnection } from 'node:net';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const EXT = resolve(root, '.output/chrome-mv3');
const FIX = resolve(root, 'tests/e2e/fixtures');
const OUT = resolve(root, 'store/screenshots');
const PORT = 5183;
const LOOKALIKE = 'sbi-kyc-update.top';
const W = 1280;
const H = 800;

function portOpen(port) {
  return new Promise((done) => {
    const socket = createConnection({ port, host: '127.0.0.1' });
    socket.once('connect', () => {
      socket.destroy();
      done(true);
    });
    socket.once('error', () => done(false));
  });
}

if (await portOpen(PORT)) {
  console.error(`Port ${PORT} is busy. Stop the process using it and retry.`);
  process.exit(1);
}
const server = spawn(process.execPath, [resolve(root, 'tests/e2e/server.mjs')], { stdio: 'ignore' });
for (let i = 0; i < 50 && !(await portOpen(PORT)); i++) await new Promise((r) => setTimeout(r, 100));

const bricolage = (await readFile(resolve(root, 'node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2'))).toString('base64');
const inter = (await readFile(resolve(root, 'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'))).toString('base64');
const mukta = (await readFile(resolve(root, 'node_modules/@fontsource/mukta/files/mukta-devanagari-700-normal.woff2'))).toString('base64');

let context;
try {
  await mkdir(OUT, { recursive: true });
  context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
    locale: 'en-IN',
    args: [
      `--disable-extensions-except=${EXT}`,
      `--load-extension=${EXT}`,
      `--host-resolver-rules=MAP ${LOOKALIKE} 127.0.0.1`,
      '--no-first-run',
      '--hide-scrollbars',
    ],
  });
  await context.route(/^https?:\/\//, (route) => {
    const host = new URL(route.request().url()).hostname;
    return host === 'localhost' || host === '127.0.0.1' || host === LOOKALIKE ? route.continue() : route.abort('blockedbyclient');
  });
  await context.route('https://web.whatsapp.com/**', async (route) =>
    route.fulfill({ contentType: 'text/html; charset=utf-8', body: await readFile(resolve(FIX, 'whatsapp.html'), 'utf8') }),
  );
  await context.route('https://mail.google.com/**', async (route) =>
    route.fulfill({ contentType: 'text/html; charset=utf-8', body: await readFile(resolve(FIX, 'gmail.html'), 'utf8') }),
  );
  // For the store image only, serve the fake bank page on the default port so the address
  // looks real (the e2e suite reaches it through --host-resolver-rules on port 5183).
  await context.route(`http://${LOOKALIKE}/**`, async (route) =>
    route.fulfill({ contentType: 'text/html; charset=utf-8', body: await readFile(resolve(FIX, 'lookalike.html'), 'utf8') }),
  );
  let [worker] = context.serviceWorkers();
  if (!worker) worker = await context.waitForEvent('serviceworker');
  const extId = new URL(worker.url()).host;

  const setSettings = (patch) =>
    worker.evaluate(async (p) => {
      const stored = await chrome.storage.local.get('settings');
      await chrome.storage.local.set({ settings: { ...(stored.settings ?? {}), ...p } });
    }, patch);
  const shot = async (page, name) => {
    await page.waitForTimeout(450);
    await page.screenshot({ path: resolve(OUT, name), clip: { x: 0, y: 0, width: W, height: H } });
    console.log('wrote', `store/screenshots/${name}`);
  };

  // 1. WhatsApp Web: badges under the scam messages only (chat scrolled to the latest).
  {
    const page = await context.newPage();
    await page.goto('https://web.whatsapp.com/');
    await page.locator('[data-testid="msg-upi"] ruko-badge button').waitFor();
    await page.evaluate(() => {
      const list = document.querySelector('.messages');
      if (list) list.scrollTop = list.scrollHeight;
    });
    await shot(page, '01-whatsapp-badges.png');
    await page.close();
  }

  // 2. WhatsApp Web: "Why?" opens the verdict popover.
  {
    const page = await context.newPage();
    await page.goto('https://web.whatsapp.com/');
    await page.locator('[data-testid="msg-kyc"] ruko-badge button').click();
    await page.locator('ruko-popover [role="dialog"]').waitFor();
    await shot(page, '02-whatsapp-why.png');
    await page.close();
  }

  // 3. Lookalike website interstitial.
  {
    const page = await context.newPage();
    await page.goto(`http://${LOOKALIKE}/login`);
    await page.locator('ruko-interstitial [role="alertdialog"]').waitFor();
    await shot(page, '03-fake-website-warning.png');
    await page.close();
  }

  // 4. Gmail banner with details open.
  {
    const page = await context.newPage();
    await page.goto('https://mail.google.com/mail/u/0/#inbox/FMfcgzQ');
    const toggle = page.locator('ruko-banner button[aria-expanded]');
    await toggle.waitFor();
    await toggle.click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot(page, '04-gmail-banner.png');
    await page.close();
  }

  // 5. UPI payment-link confirmation.
  {
    const page = await context.newPage();
    await page.goto(`http://localhost:${PORT}/links.html`);
    await page.locator('#upi').click();
    await page.locator('ruko-upi-dialog [role="alertdialog"]').waitFor();
    await shot(page, '05-upi-link-check.png');
    await page.close();
  }

  // Captures an extension page at a narrow size, returned as a PNG data URL.
  const capturePage = async (path, width, height, prepare, colorScheme = 'light') => {
    const page = await context.newPage();
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ colorScheme });
    await page.goto(`chrome-extension://${extId}/${path}`);
    await prepare(page);
    await page.waitForTimeout(700);
    const png = await page.screenshot({ clip: { x: 0, y: 0, width, height } });
    await page.close();
    return `data:image/png;base64,${png.toString('base64')}`;
  };

  const compose = async (name, { eyebrow, title, body, image, imageWidth, imageHeight, dark = false, lang = 'en' }) => {
    const page = await context.newPage();
    await page.setViewportSize({ width: W, height: H });
    await page.setContent(`<!doctype html><html lang="${lang}"><head><style>
      @font-face{font-family:B;src:url(data:font/woff2;base64,${bricolage}) format('woff2');font-weight:200 800}
      @font-face{font-family:I;src:url(data:font/woff2;base64,${inter}) format('woff2');font-weight:100 900}
      @font-face{font-family:M;src:url(data:font/woff2;base64,${mukta}) format('woff2');font-weight:700}
      html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden}
      body{display:grid;grid-template-columns:1fr auto;align-items:center;gap:56px;padding:0 72px;box-sizing:border-box;
        font-family:I,M,system-ui,sans-serif;color:${dark ? '#F4F1EA' : '#0B1020'};
        background:radial-gradient(900px 600px at 100% 100%,rgba(255,122,26,${dark ? 0.28 : 0.22}),transparent 60%),
          radial-gradient(800px 600px at 0% 0%,rgba(79,70,229,${dark ? 0.3 : 0.14}),transparent 60%),${dark ? '#0B1020' : '#FBF8F2'}}
      .eyebrow{font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-size:15px;color:#E8650A}
      h1{font-family:B,M,sans-serif;font-size:56px;line-height:1.04;letter-spacing:-.02em;margin:14px 0 18px;font-weight:800}
      p{font-size:21px;line-height:1.5;margin:0;color:${dark ? '#C9CCD8' : '#3A4058'};max-width:520px}
      .frame{border-radius:22px;overflow:hidden;box-shadow:0 30px 80px rgba(11,16,32,.35),0 0 0 1px rgba(11,16,32,.1)}
      .frame img{display:block;width:${imageWidth}px;height:${imageHeight}px}
    </style></head><body>
      <div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${body}</p></div>
      <div class="frame"><img src="${image}"></div>
    </body></html>`);
    await page.evaluate(() => document.fonts.ready);
    await shot(page, name);
    await page.close();
  };

  // 6. Side panel: full verdict with highlighted red flags.
  const panel = await capturePage('sidepanel.html', 430, 720, async (page) => {
    await page.locator('[data-testid="panel-input"]').fill(
      'Dear customer, your SBI YONO account will be blocked today. Your KYC is pending. Update KYC and PAN now at http://sbi-kyc-update.top/login or call +91 98111 22233.',
    );
    await page.locator('[data-testid="panel-check"]').click();
    await page.locator('[data-testid="verdict-card"]').waitFor();
  });
  await compose('06-side-panel-verdict.png', {
    eyebrow: 'Side panel',
    title: 'A full verdict, on your device',
    body: 'Red-flag phrases highlighted in your own text, every link, UPI ID and number checked, and big buttons to call 1930 or report.',
    image: panel,
    imageWidth: 430,
    imageHeight: 720,
  });

  // 7. Hindi and dark mode: popup about a WhatsApp Web tab, after a quick check.
  await setSettings({ locale: 'hi' });
  const chat = await context.newPage();
  await chat.emulateMedia({ colorScheme: 'dark' });
  await chat.goto('https://web.whatsapp.com/?theme=dark');
  await chat.locator('[data-testid="msg-upi"] ruko-badge').waitFor();
  const chatTab = await worker.evaluate(async () => (await chrome.tabs.query({ url: 'https://web.whatsapp.com/*' }))[0]?.id ?? 0);
  const popup = await capturePage(
    `popup.html?tab=${chatTab}`,
    380,
    700,
    async (page) => {
      await page.locator('[data-testid="quick-check-input"]').fill('आपका बिजली कनेक्शन आज रात 9:30 बजे काट दिया जाएगा क्योंकि पिछला बिल अपडेट नहीं हुआ। तुरंत बिजली अधिकारी को 98765 43210 पर कॉल करें।');
      await page.locator('[data-testid="quick-check-submit"]').click();
      await page.locator('[data-testid="verdict-card"]').waitFor();
    },
    'dark',
  );
  await compose('07-hindi-dark-popup.png', {
    eyebrow: 'English और हिंदी',
    title: 'रुको। जाँचो। फिर भरोसा करो।',
    body: 'Quick check in the popup, in Hindi or English, in light or dark mode. Nothing you paste leaves your browser.',
    image: popup,
    imageWidth: 380,
    imageHeight: 700,
    dark: true,
    lang: 'hi',
  });
  await chat.close();
  await setSettings({ locale: 'en' });
} finally {
  await context?.close();
  server.kill();
}
