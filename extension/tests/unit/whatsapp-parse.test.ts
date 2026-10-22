import { describe, expect, it } from 'vitest';
import { chatRoot, messageDirection, messageText, parsePrePlainText } from '../../src/content/whatsapp/parse';
import { bubble } from './helpers';

describe('parsePrePlainText', () => {
  it('reads time, date and sender from the WhatsApp prefix', () => {
    expect(parsePrePlainText('[10:15, 23/10/2026] Ravi Kumar: ')).toEqual({
      time: '10:15',
      date: '23/10/2026',
      sender: 'Ravi Kumar',
    });
  });

  it('handles 12-hour clocks, phone numbers and US dates', () => {
    expect(parsePrePlainText('[9:05 pm, 10/23/2026] +91 98765 43210: ')).toEqual({
      time: '9:05 pm',
      date: '10/23/2026',
      sender: '+91 98765 43210',
    });
  });

  it('keeps colons inside the sender name and strips direction marks', () => {
    expect(parsePrePlainText('[10:15, 23/10/2026] ‪Dr: Mehta‬: ')?.sender).toBe('Dr: Mehta');
  });

  it('rejects anything that is not the prefix', () => {
    expect(parsePrePlainText('')).toBeNull();
    expect(parsePrePlainText(null)).toBeNull();
    expect(parsePrePlainText('hello')).toBeNull();
  });
});

describe('message DOM helpers', () => {
  it('tells incoming from outgoing bubbles', () => {
    const incoming = bubble(document, { text: 'hi' });
    const outgoing = bubble(document, { text: 'hi', out: true });
    document.body.append(incoming, outgoing);
    expect(messageDirection(incoming.querySelector('[data-pre-plain-text]')!)).toBe('in');
    expect(messageDirection(outgoing.querySelector('[data-pre-plain-text]')!)).toBe('out');
    const bare = document.createElement('div');
    bare.setAttribute('data-pre-plain-text', '[1:00, 1/1/2026] X: ');
    document.body.append(bare);
    expect(messageDirection(bare)).toBe('unknown');
  });

  it('reads text, emoji alt text and line breaks without touching the DOM', () => {
    const row = bubble(document, {
      text: '',
      html: 'Dear customer <img alt="⚠️" src="data:,">your KYC expired<br>Update at <a href="http://sbi-kyc.top">sbi-kyc.top</a>',
    });
    document.body.append(row);
    const el = row.querySelector('[data-pre-plain-text]')!;
    const before = el.innerHTML;
    expect(messageText(el)).toBe('Dear customer ⚠️your KYC expired\nUpdate at sbi-kyc.top (http://sbi-kyc.top)');
    expect(el.innerHTML).toBe(before);
  });

  it('adds the real target of links whose text hides it', () => {
    const row = bubble(document, {
      text: '',
      html: 'Tap to <a href="upi://pay?pa=refund.desk@ybl&amp;am=4999">receive your refund</a>, or see <a href="https://www.irctc.co.in/">https://www.irctc.co.in/</a>',
    });
    document.body.append(row);
    expect(messageText(row.querySelector('[data-pre-plain-text]')!)).toBe(
      'Tap to receive your refund (upi://pay?pa=refund.desk@ybl&am=4999), or see https://www.irctc.co.in/',
    );
  });

  it("ignores Ruko's own injected UI when reading text", () => {
    const row = bubble(document, { text: 'Win ₹25 lakh now' });
    const el = row.querySelector('.selectable-text')!;
    const host = document.createElement('ruko-badge');
    host.setAttribute('data-ruko', 'badge');
    host.textContent = 'Possible lottery scam';
    el.appendChild(host);
    document.body.append(row);
    expect(messageText(row.querySelector('[data-pre-plain-text]')!)).toBe('Win ₹25 lakh now');
  });

  it('prefers #main as the chat root', () => {
    expect(chatRoot(document)).toBe(document.body);
    const main = document.createElement('div');
    main.id = 'main';
    document.body.append(main);
    expect(chatRoot(document)).toBe(main);
    main.remove();
  });
});
