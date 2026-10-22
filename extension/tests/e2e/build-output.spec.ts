import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

const OUT = resolve(process.cwd(), '.output/chrome-mv3');

test.describe('built Chrome package', () => {
  test('requests only the documented permissions', async () => {
    const manifest = JSON.parse(await readFile(resolve(OUT, 'manifest.json'), 'utf8'));
    expect(manifest.manifest_version).toBe(3);
    expect([...manifest.permissions].sort()).toEqual(['contextMenus', 'sidePanel', 'storage']);
    expect(manifest.host_permissions).toEqual(['http://*/*', 'https://*/*']);
    expect(manifest.content_security_policy).toBeUndefined();
    expect(manifest.web_accessible_resources).toBeUndefined();
    expect(Object.keys(manifest.icons)).toEqual(['16', '32', '48', '128']);
    const scripts = manifest.content_scripts.map((c: { matches: string[]; js: string[] }) => `${c.js[0]} ${c.matches.join(',')}`);
    expect(scripts).toEqual(
      expect.arrayContaining([
        'content-scripts/guard.js http://*/*,https://*/*',
        'content-scripts/whatsapp.js https://web.whatsapp.com/*',
        'content-scripts/gmail.js https://mail.google.com/*',
      ]),
    );
  });

  test('content scripts never bundle the engine or a UI framework', async () => {
    for (const name of ['guard', 'whatsapp', 'gmail']) {
      const file = resolve(OUT, `content-scripts/${name}.js`);
      const code = await readFile(file, 'utf8');
      expect(code, name).not.toContain('engineVersion');
      expect(code, name).not.toContain('react.production');
      expect(code, name).not.toMatch(/eval\(|new Function\(/);
      // The every-site script must stay small.
      const { size } = await stat(file);
      expect(size, `${name}.js size`).toBeLessThan(name === 'guard' ? 60_000 : 80_000);
    }
  });

  test('no remote code: every script is local', async () => {
    for (const page of ['popup.html', 'sidepanel.html', 'options.html', 'safe.html']) {
      const html = await readFile(resolve(OUT, page), 'utf8');
      expect(html, page).not.toMatch(/<script[^>]+src="https?:/);
      expect(html, page).not.toMatch(/<link[^>]+href="https?:/);
    }
  });
});
