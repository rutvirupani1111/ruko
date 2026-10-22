import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { sha256Bytes } from '../src/sha256';
import {
  analyze,
  analyzePhone,
  analyzeUpiId,
  analyzeUrl,
  CATEGORIES,
  CATEGORY_IDS,
  detectLanguage,
  extractEntities,
  identifierHash,
  isOfficialHost,
  normalizeIdentifier,
  parseUpiUri,
  registrableDomain,
  severityFor,
  sha256Hex,
  sha256HexSync,
} from '../src/index';
import { upiHandleCount } from '../src/entities/upi';
import * as categoriesEntry from '../src/categories';
import { getBrands } from '../src/domains/brands';
import { allCueSources, getRuleSet } from '../src/rules';

describe('urls and lookalikes', () => {
  it('recognises official domains', () => {
    const u = analyzeUrl('https://www.hdfcbank.com/personal');
    expect(u.official).toBe(true);
    expect(u.risk).toBe(0);
    expect(analyzeUrl('https://retail.onlinesbi.sbi/login').official).toBe(true);
    expect(analyzeUrl('https://www.incometax.gov.in').official).toBe(true);
    expect(isOfficialHost('www.irctc.co.in')).toBe(true);
    expect(isOfficialHost('irctc-co.in')).toBe(false);
  });
  it('flags typos, brand tokens, free hosting, homoglyphs and userinfo tricks', () => {
    const typo = analyzeUrl('https://hdfcbnak.com/netbanking');
    expect(typo.impersonates).toBe('HDFC Bank');
    expect(typo.risk).toBeGreaterThanOrEqual(60);
    const sub = analyzeUrl('sbi.kyc-update.top');
    expect(sub.impersonates).toBe('SBI');
    expect(sub.risk).toBeGreaterThanOrEqual(60);
    const hosted = analyzeUrl('https://paytm-kyc.web.app');
    expect(hosted.impersonationKind).toBe('free_hosting');
    expect(hosted.registrableDomain).toBe('paytm-kyc.web.app');
    const homo = analyzeUrl('https://www.аmazon.in/offer');
    expect(homo.impersonates).toBe('Amazon');
    expect(homo.impersonationKind).toBe('homoglyph');
    const ui = analyzeUrl('https://www.sbi.co.in@evil.tk/login');
    expect(ui.host).toBe('evil.tk');
    expect(ui.risk).toBeGreaterThanOrEqual(60);
    expect(analyzeUrl('https://icicibank.co/verify').impersonationKind).toBe('tld_swap');
  });
  it('flags IPs, shorteners and app downloads', () => {
    expect(analyzeUrl('http://103.24.56.12/secure/login').risk).toBeGreaterThanOrEqual(50);
    expect(analyzeUrl('https://bit.ly/3xYz').shortener).toBe(true);
    const apk = analyzeUrl('https://files.example.top/SBI_Rewards.apk');
    expect(apk.download).toBe(true);
    expect(apk.risk).toBeGreaterThanOrEqual(80);
  });
  it('computes registrable domains with the bundled suffix list', () => {
    expect(registrableDomain('a.b.sbi.co.in')).toBe('sbi.co.in');
    expect(registrableDomain('x.y.gov.in')).toBe('y.gov.in');
    expect(registrableDomain('sbi-kyc.web.app')).toBe('sbi-kyc.web.app');
    expect(registrableDomain('www.example.com')).toBe('example.com');
  });
  it('extracts links with and without scheme, but not emails', () => {
    const e = extractEntities('Visit sbi-kyc.in or https://bit.ly/x9 or www.example.com. Mail me at someone@gmail.com');
    expect(e.urls.map((u) => u.host)).toEqual(['sbi-kyc.in', 'bit.ly', 'www.example.com']);
    expect(e.emails).toEqual(['someone@gmail.com']);
    const sp = e.urls[0]?.span;
    expect(sp?.text).toBe('sbi-kyc.in');
  });
  it('ships a brand registry of 60+ brands', () => {
    expect(getBrands().length).toBeGreaterThanOrEqual(60);
  });
});

describe('upi', () => {
  it('maps handles to apps and flags risky IDs', () => {
    const ok = analyzeUpiId('rahul@okhdfcbank');
    expect(ok.app).toBe('Google Pay (HDFC Bank)');
    expect(ok.risk).toBe(0);
    expect(analyzeUpiId('refund.support@ybl').risk).toBeGreaterThanOrEqual(50);
    expect(analyzeUpiId('someone@abcxyz').risk).toBeGreaterThanOrEqual(30);
    expect(upiHandleCount()).toBeGreaterThanOrEqual(70);
  });
  it('parses upi:// links and treats "receive" notes as critical', () => {
    const r = parseUpiUri('upi://pay?pa=shop@ybl&pn=Shree%20Stores&am=100.50&cu=INR');
    expect(r?.payee).toBe('shop@ybl');
    expect(r?.payeeName).toBe('Shree Stores');
    expect(r?.amount).toBe(100.5);
    expect(r?.risk).toBeGreaterThanOrEqual(20);
    expect(r?.risk).toBeLessThan(60);
    const bad = parseUpiUri('upi://pay?pa=cashback.offer@ybl&pn=Flipkart&tn=Receive%20your%20refund');
    expect(bad?.risk).toBeGreaterThanOrEqual(90);
    expect(parseUpiUri('https://example.com')).toBeNull();
    expect(analyze('upi://pay?pa=x@ybl&tn=receive%20cashback').severity).toBe('critical');
  });
  it('finds UPI IDs in text', () => {
    const e = extractEntities('Pay to rohan.k99@ybl on GPay');
    expect(e.upiIds[0]?.vpa).toBe('rohan.k99@ybl');
  });
});

describe('phones', () => {
  it('classifies Indian number kinds', () => {
    const m = analyzePhone('+91 98765 43210');
    expect(m.kind).toBe('mobile');
    expect(m.e164).toBe('+919876543210');
    expect(analyzePhone('1400123456').kind).toBe('telemarketing_140');
    expect(analyzePhone('1600123456').kind).toBe('service_1600');
    expect(analyzePhone('1800 425 3800').kind).toBe('tollfree');
    expect(analyzePhone('1930').kind).toBe('tollfree');
    expect(analyzePhone('022-2654 3210').kind).toBe('landline');
  });
  it('flags international numbers from scam hotspots', () => {
    const p = analyzePhone('+92 300 1234567');
    expect(p.kind).toBe('international');
    expect(p.country).toBe('PK');
    expect(p.risk).toBeGreaterThanOrEqual(40);
    expect(analyzePhone('+44 20 7946 0958').country).toBe('GB');
  });
  it('extracts phones but not reference numbers', () => {
    const e = extractEntities('Call 9876543210. UPI Ref No 412345678901, PNR 4512345678.');
    expect(e.phones.map((p) => p.e164)).toEqual(['+919876543210']);
  });
});

describe('amounts', () => {
  it('reads Indian amount formats', () => {
    const e = extractEntities('Pay ₹ 5,000 or Rs. 5000 or INR 5000 or 5 lakh or 2 crore or 5,00,000');
    const values = e.amounts.map((a) => a.value);
    expect(values).toContain(5000);
    expect(values).toContain(500000);
    expect(values).toContain(20000000);
    expect(e.amounts.every((a) => a.currency === 'INR')).toBe(true);
    expect(extractEntities('Earn 5k daily from home').amounts[0]?.value).toBe(5000);
    expect(extractEntities('25 लाख रुपये का इनाम').amounts[0]?.value).toBe(2500000);
  });
});

describe('hashing', () => {
  it('normalises identifiers', () => {
    expect(normalizeIdentifier('upi', ' Rahul@OKHDFCBANK ')).toBe('rahul@okhdfcbank');
    expect(normalizeIdentifier('upi', 'upi://pay?pa=Shop@ybl&am=1')).toBe('shop@ybl');
    expect(normalizeIdentifier('phone', '+91 98765-43210')).toBe('919876543210');
    expect(normalizeIdentifier('phone', '09876543210')).toBe('919876543210');
    expect(normalizeIdentifier('url', 'HTTPS://WWW.SBI-KYC.in/Update?x=1#top')).toBe('sbi-kyc.in/Update');
    expect(normalizeIdentifier('domain', 'https://a.b.sbi-kyc.web.app/x')).toBe('sbi-kyc.web.app');
    expect(normalizeIdentifier('email', 'Some.One@Gmail.com')).toBe('some.one@gmail.com');
  });
  it('hashes with SHA-256 over kind:normalized', async () => {
    expect(sha256HexSync('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(await sha256Hex('abc')).toBe(sha256HexSync('abc'));
    const h = await identifierHash('upi', 'Rahul@okhdfcbank');
    expect(h).toBe(sha256HexSync('upi:rahul@okhdfcbank'));
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  it('computes the SHA-256 round constants correctly (multi-block vectors)', () => {
    expect(sha256HexSync('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(sha256HexSync('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq')).toBe(
      '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1',
    );
    expect(sha256HexSync('a'.repeat(1000))).toBe('41edece42d63e8d9bf515a9ba6932e1c20cbc9f5a5d134645adb5db1b9737ea3');
  });
  it('matches node:crypto on test vectors, every padding boundary and multi-byte UTF-8', () => {
    const node = (s: string | Uint8Array): string => createHash('sha256').update(s).digest('hex');
    const vectors = [
      '',
      'abc',
      'abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq',
      'a'.repeat(1000),
      'प्रिय ग्राहक, KYC अपडेट करें ₹5,000 café 🙏🏽 नमस्ते',
      `${'9f86d081884c7d65'.repeat(4)}:1761210000000:10000000000`,
    ];
    expect(vectors[2]!.length).toBe(56);
    expect(vectors[5]!.length).toBe(90);
    for (const v of vectors) expect(sha256HexSync(v), JSON.stringify(v.slice(0, 20))).toBe(node(v));
    // Long then short, so stale bytes in the reused buffer would show up.
    for (let n = 0; n <= 200; n++) {
      const long = 'z'.repeat(n + 300);
      expect(sha256HexSync(long)).toBe(node(long));
      const s = 'x'.repeat(n);
      expect(sha256HexSync(s), `length ${n}`).toBe(node(s));
    }
    // Bigger than the shared buffer (own buffer), including multi-byte text.
    for (const big of ['a'.repeat(5000), 'é'.repeat(1400), 'नमस्ते'.repeat(400), '😀'.repeat(700)]) {
      expect(sha256HexSync(big)).toBe(node(big));
    }
    // Lone surrogates become U+FFFD, as with TextEncoder.
    expect(sha256HexSync('a\ud800b')).toBe(node('a�b'));
  });
  it('hashes raw bytes into a fresh array each call', () => {
    const one = new Uint8Array([1, 2, 3]);
    const a = sha256Bytes(one);
    const b = sha256Bytes(new Uint8Array(5000).fill(7));
    expect(a).not.toBe(b);
    expect(Buffer.from(a).toString('hex')).toBe(createHash('sha256').update(one).digest('hex'));
    expect(Buffer.from(b).toString('hex')).toBe(createHash('sha256').update(new Uint8Array(5000).fill(7)).digest('hex'));
    for (const n of [0, 55, 56, 63, 64, 119, 120, 4024, 4025]) {
      const bytes = new Uint8Array(n).map((_, i) => (i * 31) & 255);
      expect(Buffer.from(sha256Bytes(bytes)).toString('hex'), `length ${n}`).toBe(createHash('sha256').update(bytes).digest('hex'));
    }
  });
  it('normalizes phone and upi:// identifiers without the analysers', () => {
    expect(normalizeIdentifier('phone', '0044 20 7946 0958')).toBe('442079460958');
    expect(normalizeIdentifier('phone', '1930')).toBe('1930');
    expect(normalizeIdentifier('phone', '112')).toBe('112');
    expect(normalizeIdentifier('upi', 'upi://pay?am=5&pa=Refund.Desk%40AXL')).toBe('refund.desk@axl');
    expect(normalizeIdentifier('upi', 'upi://pay?am=5')).toBe('upi://pay?am=5');
  });
});

describe('package entries', () => {
  it('serves the encyclopedia from @ruko/engine/categories and the main entry alike', () => {
    expect(categoriesEntry.CATEGORIES).toBe(CATEGORIES);
    expect(categoriesEntry.CATEGORY_IDS).toEqual(CATEGORY_IDS);
    const kyc = categoriesEntry.getCategory('kyc_update');
    expect(kyc.short.length).toBeGreaterThan(20);
    expect(kyc.shortHi).toMatch(/[ऀ-ॿ]/);
  });
});

describe('verdicts and locales', () => {
  it('maps scores to severities', () => {
    expect(severityFor(0)).toBe('safe');
    expect(severityFor(15)).toBe('low');
    expect(severityFor(35)).toBe('medium');
    expect(severityFor(60)).toBe('high');
    expect(severityFor(80)).toBe('critical');
  });
  it('handles empty input', () => {
    const v = analyze('   ');
    expect(v.score).toBe(0);
    expect(v.severity).toBe('safe');
  });
  it('detects languages', () => {
    expect(detectLanguage('Aapka KYC pending hai, account band ho jayega')).toBe('hinglish');
    expect(detectLanguage('आपका खाता बंद हो जाएगा')).toBe('hi');
    expect(detectLanguage('Your account will be blocked today')).toBe('en');
  });
  it('returns Hindi text for locale hi and spans into the original text', () => {
    const text = 'Dear customer, your KYC is pending. Your account will be blocked today. Update: http://sbi-kyc.top';
    const v = analyze(text, { locale: 'hi' });
    expect(v.headline).toMatch(/[ऀ-ॿ]/);
    expect(v.summary).toMatch(/[ऀ-ॿ]/);
    expect(v.advice.some((a) => a.action?.href === 'tel:1930')).toBe(true);
    expect(v.advice.some((a) => a.action?.href === 'https://cybercrime.gov.in')).toBe(true);
    for (const s of v.signals) for (const sp of s.spans) expect(text.slice(sp.start, sp.end)).toBe(sp.text);
  });
  it('ignores zero-width characters and full-width letters used to dodge filters', () => {
    const v = analyze('Share the Ｏ​ＴＰ you received to stop your card from being blocked');
    expect(v.score).toBeGreaterThanOrEqual(60);
  });
  it('covers every category in CATEGORIES with Hindi content', () => {
    expect(CATEGORY_IDS.length).toBe(25);
    for (const id of CATEGORY_IDS) {
      const c = CATEGORIES[id];
      expect(c.nameHi).toMatch(/[ऀ-ॿ]/);
      expect(c.howItWorksHi.length).toBe(c.howItWorks.length);
      expect(c.redFlagsHi.length).toBe(c.redFlags.length);
      expect(c.whatToDoHi.length).toBe(c.whatToDo.length);
      expect(c.redFlags.length).toBeGreaterThanOrEqual(3);
    }
  });
  it('compiles every rule and keeps cue patterns lowercase', () => {
    expect(getRuleSet().rules.length).toBeGreaterThan(80);
    for (const { id, sources } of allCueSources()) {
      for (const s of sources) expect(s.replace(/\\[A-Za-z]/g, ''), id).toBe(s.replace(/\\[A-Za-z]/g, '').toLowerCase());
    }
  });
  it('runs 1,000 analyses quickly', () => {
    const msgs = [
      'Dear customer, your SBI YONO account will be blocked today. Update PAN: http://sbi-yono-kyc.in/update',
      '123456 is your OTP for txn of INR 2,499.00 at AMAZON. Do not share OTP.',
      'Ghar baithe part time job karo, roz 5000 kamao. Telegram pe contact karo',
      'आपका पिछले महीने का बिल अपडेट नहीं हुआ है, आज रात 9:30 बजे आपकी बिजली काट दी जाएगी।',
    ];
    const t0 = Date.now();
    for (let i = 0; i < 1000; i++) analyze(msgs[i % msgs.length] as string);
    expect(Date.now() - t0).toBeLessThan(3000);
  });
});
