// Benchmark: 1,000 analyses must finish in under 1 second in Node.
// Run with `npm run bench` (builds first).
import { analyze } from '../dist/index.js';

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
if (ms >= 1000) {
  console.error('Too slow: the budget is 1,000 analyses in under 1 second.');
  process.exit(1);
}
