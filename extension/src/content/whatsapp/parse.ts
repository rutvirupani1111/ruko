/**
 * Reading WhatsApp Web's DOM without changing it.
 *
 * Every message bubble has a container with
 *   data-pre-plain-text="[10:15, 23/10/2026] Name: "
 * (the prefix WhatsApp itself uses when you copy a message). Incoming bubbles sit
 * inside `.message-in`, the user's own inside `.message-out`.
 */
import { HOST_ATTR } from '../ui/shadow';

export const MESSAGE_SELECTOR = '[data-pre-plain-text]';

export interface PrePlainText {
  /** "10:15" or "10:15 am". */
  time: string;
  /** "23/10/2026" (format follows the user's WhatsApp locale). */
  date: string;
  /** Contact name or number exactly as WhatsApp shows it. */
  sender: string;
}

/** Parses "[10:15, 23/10/2026] Name: ". Returns null for anything else. */
export function parsePrePlainText(value: string | null | undefined): PrePlainText | null {
  if (!value) return null;
  const match = value.match(/^\s*\[([^\]]*)\]\s*(.*?):\s*$/su);
  if (!match) return null;
  const inside = match[1] ?? '';
  const comma = inside.indexOf(',');
  const time = (comma === -1 ? inside : inside.slice(0, comma)).trim();
  const date = (comma === -1 ? '' : inside.slice(comma + 1)).trim();
  const sender = (match[2] ?? '').replace(/[‎‏‪-‮]/g, '').trim();
  return { time, date, sender };
}

export type Direction = 'in' | 'out' | 'unknown';

export function messageDirection(el: Element): Direction {
  if (el.closest('.message-out')) return 'out';
  if (el.closest('.message-in')) return 'in';
  return 'unknown';
}

const BLOCK_TAGS = new Set(['DIV', 'P', 'LI', 'BR']);

/**
 * Visible text of a message: text nodes, emoji <img alt>, line breaks. Skips Ruko's
 * own UI. Uses textContent-style walking, never innerText, so it causes no layout.
 */
export function messageText(container: Element, maxLength = 6000): string {
  const root = container.querySelector('.selectable-text') ?? container;
  let out = '';
  const walk = (node: Node): void => {
    if (out.length >= maxLength) return;
    if (node.nodeType === Node.TEXT_NODE) {
      out += node.nodeValue ?? '';
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as Element;
    if (el.hasAttribute(HOST_ATTR)) return;
    if (el.tagName === 'IMG') {
      out += el.getAttribute('alt') ?? '';
      return;
    }
    if (el.tagName === 'BR') {
      out += '\n';
      return;
    }
    if (BLOCK_TAGS.has(el.tagName) && out && !out.endsWith('\n')) out += '\n';
    for (let child = el.firstChild; child; child = child.nextSibling) walk(child);
    // A link whose visible text hides its target ("Receive refund" -> upi://pay?...) is
    // analysed with the real target too. Only the analysis input changes, never the DOM.
    if (el.tagName === 'A') {
      const href = el.getAttribute('href') ?? '';
      if (/^(https?:|upi:)/i.test(href) && !out.includes(href)) out += ` (${href})`;
    }
  };
  walk(root);
  return out.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, maxLength);
}

/** The scroll area that holds the open conversation, or the whole page as a fallback. */
export function chatRoot(doc: Document = document): ParentNode {
  return doc.querySelector('#main') ?? doc.body ?? doc;
}
