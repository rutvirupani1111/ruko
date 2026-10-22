// Benchmark: 1,000 analyses must finish in under 1 second in Node.
// Also times sha256HexSync on a 90-byte input (the web app's proof-of-work shape).
// Run with `npm run bench` (builds first).
import { analyze, sha256HexSync } from '../dist/index.js';

const messages = [
  'Dear customer, your SBI YONO account will be blocked today. Please update your PAN card immediately: http://sbi-yono-kyc.in/update',
  '123456 is your OTP for txn of INR 2,499.00 at AMAZON on HDFC Bank card ending 1234. Do not share OTP for security reasons.',
  'Ghar baithe part time job karo, roz 5000 kamao. Bas YouTube video like karna hai. Telegram pe contact karo @priya_hr',
  'प्रिय उपभोक्ता, आपका पिछले महीने का बिल अपडेट नहीं हुआ है, आज रात 9:30 बजे आपकी बिजली काट दी जाएगी। तुरंत बिजली अधिकारी से संपर्क करें 9876501234',
  'This is Inspector Sharma from Mumbai Cyber Crime Cell. A FedEx parcel booked with your Aadhaar contains MDMA. Join a Skype video call now and do not tell anyone.',
  'Hey, are we still on for dinner tonight at 8?',
  'upi://pay?pa=refund.desk@axl&pn=Amazon%20Refund&am=5000&tn=Receive%20refund%20amount',
  'Your Amazon package will be delivered today by 9 PM. Track: https://amzn.in/d/3xYz12',
];

// Warm up (rule compilation happens on first use).
for (const m of messages) analyze(m);

const N = 1000;
const t0 = performance.now();
for (let i = 0; i < N; i++) analyze(messages[i % messages.length], { locale: i % 2 ? 'hi' : 'en' });
const ms = performance.now() - t0;
console.log(`${N} analyses in ${ms.toFixed(1)} ms (${((ms / N) * 1000).toFixed(0)} µs each)`);
let failed = false;
if (ms >= 1000) {
  console.error('Too slow: the budget is 1,000 analyses in under 1 second.');
  failed = true;
}

// SHA-256 micro-benchmark. The web app's report proof-of-work hashes
// `${identifierHash}:${issuedAt}:${nonce}` about 2^18 times per report, so this is
// the loop a cheap phone runs. 64 hex + ':' + 13-digit time + ':' + 11-digit nonce = 90 bytes.
const POW_BITS = 18;
const HASH_BUDGET_US = 4; // 0.1.1 took ~8.6 µs here; 0.1.2 is well under 2 µs on a laptop.
const prefix = `${'9f86d081884c7d65'.repeat(4)}:1761210000000:`;
// 4,096 distinct inputs built before timing, so only the hashing is measured.
const inputs = Array.from({ length: 4096 }, (_, i) => `${prefix}${10_000_000_000 + i}`);
if (inputs.some((s) => s.length !== 90)) throw new Error('bench inputs must be 90 bytes');
let zeros = 0;
for (let i = 0; i < 20_000; i++) if (sha256HexSync(inputs[i & 4095]).charCodeAt(0) === 48) zeros++;
const H = 200_000;
const h0 = performance.now();
for (let i = 0; i < H; i++) if (sha256HexSync(inputs[i & 4095]).charCodeAt(0) === 48) zeros++;
const hashMs = performance.now() - h0;
const usPerHash = (hashMs * 1000) / H;
if (zeros === 0) throw new Error('sha256HexSync output looks wrong: no digest started with 0');
console.log(
  `sha256HexSync, 90-byte input: ${usPerHash.toFixed(2)} µs per hash ` +
    `(${(H / hashMs).toFixed(0)}k hashes/s; a ${POW_BITS}-bit proof-of-work averages ` +
    `${((2 ** POW_BITS * usPerHash) / 1e6).toFixed(2)} s here)`,
);
if (usPerHash > HASH_BUDGET_US) {
  console.error(`Too slow: the budget is ${HASH_BUDGET_US} µs per 90-byte hash.`);
  failed = true;
}
if (failed) process.exit(1);
