/**
 * Reading an open Gmail email without changing it: the body is `div.a3s`, the
 * sender is `span.gD[email]` in the message header and the subject is `h2.hP`.
 */
import { HOST_ATTR } from '../ui/shadow';

export const BODY_SELECTOR = 'div.a3s';

export interface OpenEmail {
  body: Element;
  text: string;
  subject: string;
  senderEmail: string;
  senderName: string;
}

const BLOCK = new Set(['DIV', 'P', 'LI', 'TR', 'BR', 'H1', 'H2', 'H3', 'H4', 'TABLE', 'BLOCKQUOTE']);
const SKIP = new Set(['STYLE', 'SCRIPT', 'NOSCRIPT', 'TEMPLATE', 'HEAD']);

/** Readable text of an email body (no layout, skips styles and Ruko's own UI). */
export function emailText(body: Element, maxLength = 8000): string {
  let out = '';
  const walk = (node: Node) => {
    if (out.length >= maxLength) return;
    if (node.nodeType === Node.TEXT_NODE) {
      out += node.nodeValue ?? '';
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as Element;
    if (SKIP.has(el.tagName) || el.hasAttribute(HOST_ATTR)) return;
    if (el.tagName === 'IMG') {
      const alt = el.getAttribute('alt');
      if (alt) out += ` ${alt} `;
      return;
    }
    const block = BLOCK.has(el.tagName);
    if (block && out && !out.endsWith('\n')) out += '\n';
    for (let child = el.firstChild; child; child = child.nextSibling) walk(child);
    // Keep link targets visible to the engine even when the link text hides them.
    if (el.tagName === 'A') {
      const href = el.getAttribute('href') ?? '';
      if (/^(https?:|upi:)/i.test(href) && !out.includes(href)) out += ` (${href}) `;
    }
    if (block && !out.endsWith('\n')) out += '\n';
  };
  walk(body);
  return out
    .replace(/[ \t ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, maxLength);
}

/** The message container that holds both the header and this body. */
function messageContainer(body: Element): Element | null {
  return body.closest('[data-message-id]') ?? body.closest('.adn') ?? body.closest('[role="listitem"]');
}

export function readEmail(body: Element, doc: Document = document): OpenEmail {
  const container = messageContainer(body);
  const sender = container?.querySelector('span.gD[email], span[email].gD, .gD') ?? null;
  const senderEmail = sender?.getAttribute('email') ?? '';
  const senderName = sender?.getAttribute('name') ?? sender?.textContent?.trim() ?? '';
  const subject = doc.querySelector('h2.hP')?.textContent?.trim() ?? '';
  return { body, text: emailText(body), subject, senderEmail, senderName };
}

/** "Name <email>" as Ruko passes it to the engine. */
export function senderLabel(email: OpenEmail): string {
  if (email.senderName && email.senderEmail && email.senderName !== email.senderEmail) return `${email.senderName} <${email.senderEmail}>`;
  return email.senderEmail || email.senderName;
}
