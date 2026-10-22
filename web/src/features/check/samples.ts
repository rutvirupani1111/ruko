import type { Source } from '@ruko/engine';
import type { Locale } from '@/i18n/core';

export interface Sample {
  id: string;
  kind: 'scam' | 'genuine';
  label: Record<Locale, string>;
  text: Record<Locale, string>;
  source?: Source;
  sender?: string;
}

/**
 * Example inputs for the sample chips. Phone numbers use the well-known dummy
 * 98765 43210 and links use domains that are not real banks.
 */
export const SAMPLES: Sample[] = [
  {
    id: 'kyc',
    kind: 'scam',
    label: { en: 'Try a KYC scam', hi: 'KYC स्कैम आज़माएँ' },
    source: 'sms',
    sender: '+91 98765 43210',
    text: {
      en: 'Dear Customer, your SBI YONO account will be BLOCKED today because your KYC/PAN is not updated. Update immediately: http://sbi-kyc-update.top/verify or call 9876543210.',
      hi: 'प्रिय ग्राहक, आपका SBI YONO खाता आज ब्लॉक हो जाएगा क्योंकि आपका KYC/PAN अपडेट नहीं है। तुरंत अपडेट करें: http://sbi-kyc-update.top/verify या 9876543210 पर कॉल करें।',
    },
  },
  {
    id: 'arrest',
    kind: 'scam',
    label: { en: 'Try a digital arrest call', hi: 'डिजिटल अरेस्ट कॉल आज़माएँ' },
    source: 'call',
    text: {
      en: 'This is Inspector Rajesh Sharma from Mumbai Police Cyber Crime. A parcel with drugs and 5 fake passports was booked using your Aadhaar card. An arrest warrant has been issued in your name. Join the Skype video call now and stay on camera. Do not tell anyone, this is a confidential investigation.',
      hi: 'मैं मुंबई पुलिस साइबर क्राइम से इंस्पेक्टर राजेश शर्मा बोल रहा हूँ। आपके आधार कार्ड से ड्रग्स और 5 नकली पासपोर्ट वाला पार्सल बुक हुआ है। आपके नाम पर अरेस्ट वारंट जारी हुआ है। अभी स्काइप वीडियो कॉल पर जुड़िए और कैमरे के सामने रहिए। किसी को मत बताना, यह गोपनीय जाँच है।',
    },
  },
  {
    id: 'job',
    kind: 'scam',
    label: { en: 'Try a work-from-home offer', hi: 'घर बैठे नौकरी वाला ऑफ़र आज़माएँ' },
    source: 'whatsapp',
    sender: '+84 912 345 678',
    text: {
      en: 'Hello! We are hiring for part time work from home. Just like YouTube videos and earn Rs 5000/day. Join our Telegram group t.me/earnfast_tasks. First prepaid task is only Rs 1000, you get Rs 1500 back.',
      hi: 'नमस्ते! घर बैठे पार्ट टाइम काम। बस YouTube वीडियो लाइक करो और रोज़ ₹5000 कमाओ। हमारे Telegram ग्रुप t.me/earnfast_tasks से जुड़ो। पहला प्रीपेड टास्क सिर्फ़ ₹1000 का, वापस मिलेंगे ₹1500।',
    },
  },
  {
    id: 'refund',
    kind: 'scam',
    label: { en: 'Try a refund trick', hi: 'रिफ़ंड वाली चाल आज़माएँ' },
    source: 'whatsapp',
    sender: '+91 98765 43210',
    text: {
      en: 'Sorry sir, I sent ₹5,000 to your number by mistake. Please return it. I have sent a collect request from refund.help@ybl, just enter your UPI PIN to receive the money.',
      hi: 'माफ़ कीजिए सर, गलती से ₹5,000 आपके नंबर पर भेज दिए। कृपया लौटा दीजिए। मैंने refund.help@ybl से रिक्वेस्ट भेजी है, पैसे पाने के लिए बस अपना UPI PIN डाल दीजिए।',
    },
  },
  {
    id: 'link',
    kind: 'scam',
    label: { en: 'Try a fake bank link', hi: 'नकली बैंक लिंक आज़माएँ' },
    text: {
      en: 'https://hdfcbank-netbanking-login.web.app/verify',
      hi: 'https://hdfcbank-netbanking-login.web.app/verify',
    },
  },
  {
    id: 'bank-sms',
    kind: 'genuine',
    label: { en: 'Try a genuine bank SMS', hi: 'असली बैंक SMS आज़माएँ' },
    source: 'sms',
    sender: 'VM-HDFCBK',
    text: {
      en: 'Sent Rs.1499.00 From HDFC Bank A/C x4321 To SWIGGY On 21/10/26 Ref 629874512345. Not You? Call 18002586161/SMS BLOCK UPI to 7308080808',
      hi: 'HDFC Bank खाता x4321 से Rs.1499.00 SWIGGY को भेजे गए, तारीख 21/10/26, Ref 629874512345. आपने नहीं भेजे? 18002586161 पर कॉल करें या BLOCK UPI लिखकर 7308080808 पर SMS करें',
    },
  },
  {
    id: 'delivery',
    kind: 'genuine',
    label: { en: 'Try a delivery update', hi: 'डिलीवरी अपडेट आज़माएँ' },
    source: 'sms',
    sender: 'JD-AMAZON',
    text: {
      en: 'Your Amazon order #407-1234567-1234567 is out for delivery today. Track it in the Amazon app or at amazon.in/your-orders. Do not share your delivery OTP until the package is in your hands.',
      hi: 'आपका Amazon ऑर्डर #407-1234567-1234567 आज डिलीवरी के लिए निकल चुका है। Amazon ऐप में या amazon.in/your-orders पर ट्रैक करें। पैकेट हाथ में आने तक डिलीवरी OTP किसी को न बताएँ।',
    },
  },
];
