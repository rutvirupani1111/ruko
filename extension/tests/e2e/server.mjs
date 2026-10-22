// Static fixture server for the Playwright suite. Port 5183 only (see docs/STATUS.md).
// Lookalike hosts are pointed here with Chromium's --host-resolver-rules, so the
// same server answers for "sbi-kyc-update.top" and for "localhost".
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.RUKO_FIXTURE_PORT ?? 5183);
const ROOT = fileURLToPath(new URL('./fixtures/', import.meta.url));
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png' };

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const host = (req.headers.host ?? '').split(':')[0];
    let path = decodeURIComponent(url.pathname);
    if (path === '/') path = host === 'localhost' || host === '127.0.0.1' ? '/index.html' : '/lookalike.html';
    const file = normalize(join(ROOT, path));
    if (!file.startsWith(normalize(ROOT))) {
      res.writeHead(403).end('forbidden');
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' }).end('not found');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Ruko fixtures on http://localhost:${PORT}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
