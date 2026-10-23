import type { BaseLocale as Locale } from '@/i18n/core';

/**
 * Builds a neatly formatted police / cyber cell complaint from the form.
 * Pure function: runs on the device, nothing is sent anywhere.
 */

export interface Transaction {
  at: string;
  amount: string;
  reference: string;
  from: string;
  to: string;
}

export interface ComplaintData {
  lang: Locale;
  name: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  /** Localized scam type name, e.g. "Fake KYC update". */
  category: string;
  /** Localized channel, e.g. "a phone call". */
  contactMode: string;
  /** datetime-local value, e.g. 2026-10-21T14:30 */
  incidentAt: string;
  amount: string;
  /** Localized payment mode, e.g. "UPI". */
  paymentMode: string;
  transactions: Transaction[];
  /** Phone numbers, UPI IDs, accounts, links: one per line. */
  suspects: string;
  description: string;
  called1930: boolean;
  ack1930: string;
  informedBank: boolean;
  bankRef: string;
  reportedOnline: boolean;
  ackOnline: string;
}

export const emptyComplaint = (lang: Locale): ComplaintData => ({
  lang,
  name: '',
  mobile: '',
  email: '',
  address: '',
  city: '',
  state: '',
  category: '',
  contactMode: '',
  incidentAt: '',
  amount: '',
  paymentMode: '',
  transactions: [],
  suspects: '',
  description: '',
  called1930: false,
  ack1930: '',
  informedBank: false,
  bankRef: '',
  reportedOnline: false,
  ackOnline: '',
});

const BLANK = '__________';

const tag = (lang: Locale) => (lang === 'hi' ? 'hi-IN' : 'en-IN');

export function formatDateTime(value: string, lang: Locale): { date: string; time: string } {
  if (!value) return { date: '', time: '' };
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { date: value, time: '' };
  return {
    date: new Intl.DateTimeFormat(tag(lang), { day: 'numeric', month: 'long', year: 'numeric' }).format(d),
    time: value.includes('T') ? new Intl.DateTimeFormat(tag(lang), { hour: 'numeric', minute: '2-digit' }).format(d) : '',
  };
}

/** "25000" -> "₹25,000" in Indian grouping; keeps whatever the user typed if it is not a number. */
export function formatAmount(value: string, lang: Locale): string {
  const clean = value.replace(/[₹,\s]|rs\.?|inr/gi, '');
  if (!clean) return '';
  const n = Number(clean);
  if (!Number.isFinite(n)) return value.trim();
  return new Intl.NumberFormat(tag(lang), { style: 'currency', currency: 'INR', maximumFractionDigits: n % 1 ? 2 : 0 }).format(n);
}

const lines = (text: string) =>
  text
    .split(/\r?\n|,(?=\s*\S)/)
    .map((l) => l.trim())
    .filter(Boolean);

const or = (value: string, fallback = BLANK) => (value.trim() ? value.trim() : fallback);

export function formatComplaint(d: ComplaintData, today = new Date()): string {
  const hi = d.lang === 'hi';
  const incident = formatDateTime(d.incidentAt, d.lang);
  const amount = formatAmount(d.amount, d.lang);
  const todayText = new Intl.DateTimeFormat(tag(d.lang), { day: 'numeric', month: 'long', year: 'numeric' }).format(today);
  const place = [d.city.trim(), d.state.trim()].filter(Boolean).join(', ');
  const fullAddress = [d.address.trim(), place].filter(Boolean).join(', ');
  const suspects = lines(d.suspects);
  const txns = d.transactions.filter((t) => t.amount.trim() || t.reference.trim() || t.to.trim() || t.at.trim());
  const out: string[] = [];

  if (hi) {
    out.push('सेवा में,', 'थाना प्रभारी / साइबर क्राइम सेल,', or(place), '');
    out.push(
      `विषय: ${incident.date ? `${incident.date} को हुई ` : ''}${amount ? `${amount} की ` : ''}ऑनलाइन वित्तीय धोखाधड़ी${d.category ? ` (${d.category})` : ''} के संबंध में शिकायत`,
      '',
    );
    out.push('महोदय/महोदया,', '');
    out.push(
      `मैं, ${or(d.name)}, निवासी ${or(fullAddress)}, आपको सूचित करना चाहता/चाहती हूँ कि मेरे साथ ऑनलाइन धोखाधड़ी हुई है। विवरण इस प्रकार है।`,
      '',
    );
    out.push('1. घटना का विवरण');
    if (d.description.trim()) out.push(d.description.trim());
    if (incident.date || d.contactMode) {
      out.push(
        `ठग ने मुझसे${incident.date ? ` ${incident.date} को` : ''}${incident.time ? ` ${incident.time} बजे` : ''}${d.contactMode ? ` ${d.contactMode} के ज़रिए` : ''} संपर्क किया।`,
      );
    }
    out.push('');
    out.push('2. गई हुई रकम');
    out.push(`कुल रकम: ${amount || BLANK}${d.paymentMode ? ` (${d.paymentMode})` : ''}`);
    if (txns.length) {
      out.push('लेन-देन:');
      txns.forEach((t, i) => {
        const when = formatDateTime(t.at, d.lang);
        const parts = [
          when.date ? `${when.date}${when.time ? `, ${when.time}` : ''}` : '',
          t.amount.trim() ? formatAmount(t.amount, d.lang) : '',
          t.reference.trim() ? `ट्रांज़ैक्शन आईडी/UTR: ${t.reference.trim()}` : '',
          t.from.trim() ? `किस खाते से: ${t.from.trim()}` : '',
          t.to.trim() ? `किसे भेजा: ${t.to.trim()}` : '',
        ].filter(Boolean);
        out.push(`   ${i + 1}) ${parts.join(', ')}`);
      });
    }
    out.push('');
    if (suspects.length) {
      out.push('3. ठग की जानकारी (नंबर, UPI आईडी, खाते, लिंक)');
      suspects.forEach((s) => out.push(`   - ${s}`));
      out.push('');
    }
    const steps: string[] = [];
    if (d.called1930) steps.push(`   - राष्ट्रीय साइबर क्राइम हेल्पलाइन 1930 पर कॉल किया${d.ack1930.trim() ? ` (शिकायत संख्या: ${d.ack1930.trim()})` : ''}।`);
    if (d.reportedOnline) steps.push(`   - cybercrime.gov.in पर ऑनलाइन शिकायत दर्ज की${d.ackOnline.trim() ? ` (शिकायत संख्या: ${d.ackOnline.trim()})` : ''}।`);
    if (d.informedBank) steps.push(`   - अपने बैंक को सूचित किया${d.bankRef.trim() ? ` (संदर्भ संख्या: ${d.bankRef.trim()})` : ''} और खाता/कार्ड ब्लॉक करवाने का अनुरोध किया।`);
    if (steps.length) {
      out.push(`${suspects.length ? 4 : 3}. मेरे द्वारा उठाए गए कदम`, ...steps, '');
    }
    out.push(
      'आपसे निवेदन है कि मेरी शिकायत दर्ज करें, पैसे पाने वाले खातों को फ़्रीज़ करवाएँ और मेरी रकम वापस दिलाने में मदद करें। मैं स्क्रीनशॉट, बैंक स्टेटमेंट और अन्य सबूत देने के लिए तैयार हूँ।',
      '',
    );
    out.push('संलग्न: मैसेज और कॉल के स्क्रीनशॉट, लेन-देन की रसीदें, बैंक स्टेटमेंट।', '');
    out.push('भवदीय/भवदीया,', or(d.name), `मोबाइल: ${or(d.mobile)}`);
    if (d.email.trim()) out.push(`ईमेल: ${d.email.trim()}`);
    out.push(`दिनांक: ${todayText}`);
    return out.join('\n');
  }

  out.push('To,', 'The Station House Officer / Cyber Crime Cell,', or(place), '');
  out.push(
    `Subject: Complaint about online financial fraud${d.category ? ` (${d.category})` : ''}${amount ? ` of ${amount}` : ''}${incident.date ? ` on ${incident.date}` : ''}`,
    '',
  );
  out.push('Respected Sir/Madam,', '');
  out.push(`I, ${or(d.name)}, resident of ${or(fullAddress)}, wish to report that I have been cheated in an online fraud. The details are given below.`, '');
  out.push('1. What happened');
  if (d.description.trim()) out.push(d.description.trim());
  if (incident.date || d.contactMode) {
    out.push(
      `The fraudster contacted me${d.contactMode ? ` through ${d.contactMode}` : ''}${incident.date ? ` on ${incident.date}` : ''}${incident.time ? ` at ${incident.time}` : ''}.`,
    );
  }
  out.push('');
  out.push('2. Money lost');
  out.push(`Total amount: ${amount || BLANK}${d.paymentMode ? ` (${d.paymentMode})` : ''}`);
  if (txns.length) {
    out.push('Transactions:');
    txns.forEach((t, i) => {
      const when = formatDateTime(t.at, d.lang);
      const parts = [
        when.date ? `${when.date}${when.time ? `, ${when.time}` : ''}` : '',
        t.amount.trim() ? formatAmount(t.amount, d.lang) : '',
        t.reference.trim() ? `Transaction ID/UTR: ${t.reference.trim()}` : '',
        t.from.trim() ? `From: ${t.from.trim()}` : '',
        t.to.trim() ? `To: ${t.to.trim()}` : '',
      ].filter(Boolean);
      out.push(`   ${i + 1}) ${parts.join(', ')}`);
    });
  }
  out.push('');
  if (suspects.length) {
    out.push("3. Fraudster's details (numbers, UPI IDs, accounts, links)");
    suspects.forEach((s) => out.push(`   - ${s}`));
    out.push('');
  }
  const steps: string[] = [];
  if (d.called1930) steps.push(`   - Called the National Cyber Crime Helpline 1930${d.ack1930.trim() ? ` (acknowledgement no. ${d.ack1930.trim()})` : ''}.`);
  if (d.reportedOnline) steps.push(`   - Filed a complaint on cybercrime.gov.in${d.ackOnline.trim() ? ` (acknowledgement no. ${d.ackOnline.trim()})` : ''}.`);
  if (d.informedBank) steps.push(`   - Informed my bank${d.bankRef.trim() ? ` (reference no. ${d.bankRef.trim()})` : ''} and asked them to block my account and cards.`);
  if (steps.length) out.push(`${suspects.length ? 4 : 3}. Steps I have already taken`, ...steps, '');
  out.push(
    'I request you to register my complaint, get the receiving accounts frozen, and help me recover my money. I am ready to share screenshots, bank statements and any other evidence.',
    '',
  );
  out.push('Enclosures: screenshots of messages and calls, transaction receipts, bank statement.', '');
  out.push('Yours faithfully,', or(d.name), `Mobile: ${or(d.mobile)}`);
  if (d.email.trim()) out.push(`Email: ${d.email.trim()}`);
  out.push(`Date: ${todayText}`);
  return out.join('\n');
}
