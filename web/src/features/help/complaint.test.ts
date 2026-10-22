import { describe, expect, it } from 'vitest';
import { emptyComplaint, formatAmount, formatComplaint, type ComplaintData } from './complaint';

const filled = (lang: 'en' | 'hi'): ComplaintData => ({
  ...emptyComplaint(lang),
  name: 'Sunita Verma',
  mobile: '98765 43210',
  email: 'sunita@example.com',
  address: '12 MG Road',
  city: 'Pune',
  state: 'Maharashtra',
  category: lang === 'hi' ? 'नकली KYC अपडेट' : 'Fake KYC update',
  contactMode: lang === 'hi' ? 'SMS' : 'an SMS',
  incidentAt: '2026-10-21T14:30',
  amount: '25000',
  paymentMode: 'UPI',
  transactions: [{ at: '2026-10-21T14:42', amount: '25,000', reference: '629874512345', from: 'SBI xx4321', to: 'refund.help@ybl' }],
  suspects: 'refund.help@ybl\n+91 98765 43210\nhttp://sbi-kyc-update.top',
  description: 'I got an SMS saying my KYC had expired and clicked the link.',
  called1930: true,
  ack1930: '31610250012345',
  informedBank: true,
  bankRef: 'SR-778812',
});

describe('complaint draft', () => {
  it('formats rupee amounts in Indian grouping', () => {
    expect(formatAmount('250000', 'en')).toBe('₹2,50,000');
    expect(formatAmount('Rs. 1,499', 'en')).toBe('₹1,499');
    expect(formatAmount('', 'en')).toBe('');
  });

  it('writes a complete English complaint', () => {
    const text = formatComplaint(filled('en'), new Date('2026-10-23T10:00:00'));
    expect(text).toContain('Subject: Complaint about online financial fraud (Fake KYC update) of ₹25,000 on 21 October 2026');
    expect(text).toContain('I, Sunita Verma, resident of 12 MG Road, Pune, Maharashtra');
    expect(text).toContain('Transaction ID/UTR: 629874512345');
    expect(text).toContain('   - refund.help@ybl');
    expect(text).toContain('acknowledgement no. 31610250012345');
    expect(text).toContain('Mobile: 98765 43210');
    expect(text).toContain('Date: 23 October 2026');
    expect(text).not.toContain('—');
  });

  it('writes a complete Hindi complaint', () => {
    const text = formatComplaint(filled('hi'), new Date('2026-10-23T10:00:00'));
    expect(text).toContain('सेवा में,');
    expect(text).toContain('विषय:');
    expect(text).toContain('₹25,000');
    expect(text).toContain('ट्रांज़ैक्शन आईडी/UTR: 629874512345');
    expect(text).toContain('भवदीय/भवदीया,');
    expect(text).toContain('Sunita Verma');
  });

  it('leaves blanks to fill by hand and skips empty sections', () => {
    const text = formatComplaint(emptyComplaint('en'));
    expect(text).toContain('I, __________, resident of __________');
    expect(text).toContain('Total amount: __________');
    expect(text).not.toContain('Transactions:');
    expect(text).not.toContain("Fraudster's details");
    expect(text).not.toContain('Steps I have already taken');
  });
});
