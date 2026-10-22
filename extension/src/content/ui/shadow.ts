/**
 * Shadow DOM hosts for every piece of injected UI. One constructed stylesheet is
 * shared by all hosts in a content script, so 50 badges cost one stylesheet.
 */
import css from './styles.css?inline';

export type Theme = 'light' | 'dark';

export const HOST_ATTR = 'data-ruko';

let sharedSheet: CSSStyleSheet | null | undefined;

function getSheet(): CSSStyleSheet | null {
  if (sharedSheet !== undefined) return sharedSheet;
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    sharedSheet = sheet;
  } catch {
    sharedSheet = null;
  }
  return sharedSheet;
}

function adoptStyles(root: ShadowRoot): void {
  const sheet = getSheet();
  if (sheet) {
    try {
      root.adoptedStyleSheets = [sheet];
      return;
    } catch {
      // Some engines refuse sheets constructed in another realm; fall back to <style>.
    }
  }
  const style = document.createElement('style');
  style.textContent = css;
  root.appendChild(style);
}

export interface ShadowHost {
  host: HTMLElement;
  root: ShadowRoot;
  setTheme(theme: Theme): void;
  setLang(lang: string): void;
  remove(): void;
}

/**
 * Creates `<ruko-*>` host element with an open shadow root (open so assistive tech
 * and automated tests can reach it; actions that matter check `event.isTrusted`).
 */
export function createShadowHost(kind: string, hostStyle: string, theme: Theme, lang: string): ShadowHost {
  const host = document.createElement(`ruko-${kind}`);
  host.setAttribute(HOST_ATTR, kind);
  host.setAttribute('style', hostStyle);
  host.setAttribute('data-theme', theme);
  const root = host.attachShadow({ mode: 'open' });
  adoptStyles(root);
  const api: ShadowHost = {
    host,
    root,
    setTheme(next) {
      host.setAttribute('data-theme', next);
    },
    setLang(next) {
      host.setAttribute('lang', next);
    },
    remove() {
      host.remove();
    },
  };
  api.setLang(lang);
  return api;
}

/** Inline host styles: `!important` so page CSS cannot hide or restyle Ruko's UI. */
export const HOST_STYLE = {
  block: 'all: initial !important; display: block !important; contain: layout style !important;',
  inline: 'all: initial !important; display: inline-block !important; max-width: 100% !important;',
  overlay:
    'all: initial !important; position: fixed !important; inset: 0 !important; width: 0 !important; height: 0 !important; z-index: 2147483646 !important; display: block !important;',
  gate: 'all: initial !important; position: fixed !important; inset: 0 !important; z-index: 2147483647 !important; display: block !important;',
} as const;

function parseRgb(color: string): [number, number, number, number] | null {
  const m = color.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)/i);
  if (!m) return null;
  let alpha = 1;
  if (m[4] !== undefined) alpha = m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
  return [Number(m[1]), Number(m[2]), Number(m[3]), alpha];
}

export function relativeLuminance(r: number, g: number, b: number): number {
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/**
 * Theme of the page around `context` (or of the page itself when no context is given):
 * explicit dark classes first (WhatsApp Web's `body.dark`), then the first painted
 * background found walking up from the context's parent (the element itself is skipped
 * because a link may be a coloured button), then the page's colour scheme.
 */
export function detectTheme(context?: Element | null): Theme {
  const root = document.documentElement;
  const body = document.body;
  if (body?.classList.contains('dark') || root.classList.contains('dark')) return 'dark';
  const scheme = root.getAttribute('data-theme') ?? body?.getAttribute('data-theme');
  if (scheme === 'dark' || scheme === 'light') return scheme;
  let node: Element | null = context ? context.parentElement : body;
  let depth = 0;
  while (node && depth < 30) {
    const rgb = parseRgb(getComputedStyle(node).backgroundColor);
    if (rgb && rgb[3] > 0.5) return relativeLuminance(rgb[0], rgb[1], rgb[2]) < 0.4 ? 'dark' : 'light';
    node = node.parentElement;
    depth++;
  }
  // Nothing painted: the canvas is white unless the page opted into a dark colour scheme.
  const pageScheme = getComputedStyle(root).colorScheme || '';
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  return prefersDark && /\bdark\b/.test(pageScheme) ? 'dark' : 'light';
}

/** True if `el` is (inside) one of Ruko's own hosts, so scanners and listeners ignore our UI. */
export function isRukoNode(el: Element | null): boolean {
  return !!el?.closest?.(`[${HOST_ATTR}]`);
}
