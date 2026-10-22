/**
 * Minimal DOM builder for injected UI. Text is always inserted as text nodes, so
 * page or message content can never become markup (no innerHTML with data).
 */
import { createElement as lucideElement, type IconNode } from 'lucide';
import { BARS, BARS_SMALL, MARK_COLORS, MARK_VIEWBOX, SHIELD_PATH, type MarkTone } from '../../shared/mark';

type Primitive = string | number;
export type Child = Node | Primitive | null | undefined | false | Child[];
type Listener = (event: Event) => void;
export type Attrs = Record<string, Primitive | boolean | null | undefined | Listener>;

function append(parent: Node, child: Child): void {
  if (child == null || child === false) return;
  if (Array.isArray(child)) {
    for (const c of child) append(parent, c);
    return;
  }
  parent.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
}

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Attrs | null,
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [name, value] of Object.entries(attrs)) {
      if (value == null || value === false) continue;
      if (typeof value === 'function') {
        el.addEventListener(name.replace(/^on/, '').toLowerCase(), value as Listener);
      } else if (name === 'class') {
        el.className = String(value);
      } else if (value === true) {
        el.setAttribute(name, '');
      } else {
        el.setAttribute(name, String(value));
      }
    }
  }
  for (const child of children) append(el, child);
  return el;
}

/** Lucide icon as an inline SVG element (ISC licensed icon data). */
export function icon(node: IconNode, extraClass = ''): SVGElement {
  return lucideElement(node, {
    class: `rk-icon ${extraClass}`.trim(),
    'aria-hidden': 'true',
    focusable: 'false',
    width: 16,
    height: 16,
  });
}

const NS = 'http://www.w3.org/2000/svg';

function svgEl(tag: string, attrs: Record<string, string | number>): SVGElement {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

/**
 * The Ruko mark built with DOM APIs (no innerHTML, so it also works on pages that
 * enforce Trusted Types, like Gmail).
 */
export function markElement(tone: MarkTone = 'brand', size = 16, className = 'rk-mark'): SVGElement {
  const colors = MARK_COLORS[tone];
  const gradId = `rk-mark-${tone}-${size}`;
  const svg = svgEl('svg', {
    viewBox: MARK_VIEWBOX,
    width: size,
    height: size,
    class: className,
    'aria-hidden': 'true',
    focusable: 'false',
  });
  const defs = svgEl('defs', {});
  const grad = svgEl('linearGradient', { id: gradId, x1: '0', y1: '0', x2: '0', y2: '1' });
  grad.append(
    svgEl('stop', { offset: '0', 'stop-color': colors.shieldFrom }),
    svgEl('stop', { offset: '1', 'stop-color': colors.shieldTo }),
  );
  defs.append(grad);
  svg.append(defs, svgEl('path', { d: SHIELD_PATH, fill: `url(#${gradId})`, stroke: colors.ring, 'stroke-width': 1.5 }));
  for (const bar of size <= 24 ? BARS_SMALL : BARS) {
    svg.append(svgEl('rect', { ...bar, fill: colors.bars }));
  }
  return svg;
}

/** Compact semicircle risk meter: gradient safe -> caution -> danger, value arc and number. */
export function riskMeter(score: number, label: string): HTMLElement {
  const value = Math.max(0, Math.min(100, Math.round(score)));
  const r = 26;
  const length = Math.PI * r;
  const svg = svgEl('svg', { viewBox: '0 0 64 36', 'aria-hidden': 'true', focusable: 'false' });
  const defs = svgEl('defs', {});
  const grad = svgEl('linearGradient', { id: 'rk-meter-grad', x1: '0', y1: '0', x2: '1', y2: '0' });
  grad.append(
    svgEl('stop', { offset: '0', 'stop-color': '#10B981' }),
    svgEl('stop', { offset: '0.5', 'stop-color': '#F59E0B' }),
    svgEl('stop', { offset: '1', 'stop-color': '#E11D48' }),
  );
  defs.append(grad);
  const d = `M ${32 - r} 32 A ${r} ${r} 0 0 1 ${32 + r} 32`;
  const track = svgEl('path', { d, fill: 'none', 'stroke-width': 7, 'stroke-linecap': 'round', class: 'rk-meter__track' });
  const arc = svgEl('path', {
    d,
    fill: 'none',
    stroke: 'url(#rk-meter-grad)',
    'stroke-width': 7,
    'stroke-linecap': 'round',
    'stroke-dasharray': `${(length * value) / 100} ${length}`,
  });
  svg.append(defs, track, arc);
  return h('div', { class: 'rk-meter', role: 'img', 'aria-label': label }, svg, h('span', { class: 'rk-meter__value' }, value));
}
