import { describe, expect, it } from 'vitest';
import { analyzeUrl } from '@ruko/engine';
import { linkReportable } from '@/lib/community';
import { prepareReport, readHandoff } from './prepare';

describe('report input', () => {
  it('normalises UPI IDs and upi:// links', () => {
    expect(prepareReport('upi', ' Fraud.KYC@ybl ')).toMatchObject({ ok: true, kind: 'upi', value: 'fraud.kyc@ybl' });
    expect(prepareReport('upi', 'upi://pay?pa=refund.desk@okaxis&pn=SBI&am=1')).toMatchObject({ ok: true, value: 'refund.desk@okaxis' });
    expect(prepareReport('upi', '9876543210')).toEqual({ ok: false, reason: 'invalid', suggest: 'phone' });
    expect(prepareReport('upi', '')).toEqual({ ok: false, reason: 'empty' });
  });

  it('normalises phone numbers and refuses helpline short codes', () => {
    expect(prepareReport('phone', '98765 43210')).toMatchObject({ ok: true, kind: 'phone', value: '+919876543210', display: '+91 98765 43210' });
    expect(prepareReport('phone', '1930')).toMatchObject({ ok: false, reason: 'official' });
    expect(prepareReport('phone', 'fraud@ybl')).toMatchObject({ ok: false, reason: 'invalid', suggest: 'upi' });
  });

  it('reports a scam website as its domain, and refuses official sites', () => {
    expect(prepareReport('link', 'https://sbi-kyc-update.top/login')).toMatchObject({ ok: true, kind: 'domain', value: 'sbi-kyc-update.top' });
    expect(prepareReport('link', 'https://www.onlinesbi.sbi/')).toMatchObject({ ok: false, reason: 'official' });
    expect(prepareReport('link', 'https://incometax.gov.in/refund')).toMatchObject({ ok: false, reason: 'official' });
    expect(prepareReport('link', 'hello')).toMatchObject({ ok: false, reason: 'invalid' });
  });

  it('never flags a whole platform for one page on it', () => {
    for (const url of ['https://docs.google.com/forms/d/xyz', 'https://t.me/sbi_help', 'http://192.168.1.4/kyc', 'bit.ly/abc123']) {
      const prepared = prepareReport('link', url);
      expect(prepared).toMatchObject({ ok: true, kind: 'url', scope: 'link' });
      // The checker looks links up with the same rule.
      expect(linkReportable(analyzeUrl(url))?.kind).toBe('url');
    }
  });

  it('accepts only well-formed hand-offs from the checker', () => {
    expect(readHandoff(null)).toEqual({ items: [], category: null });
    const handoff = readHandoff({
      items: [
        { kind: 'upi', value: 'a@ybl', display: 'a@ybl' },
        { kind: 'email', value: 'x@y.com', display: 'x@y.com' },
        { kind: 'nope', value: 1 },
      ],
      category: 'kyc_update',
    });
    expect(handoff.items.map((i) => i.value)).toEqual(['a@ybl']);
    expect(handoff.category).toBe('kyc_update');
  });
});
