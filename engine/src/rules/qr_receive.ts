import { r, type RuleModule } from './types';

/** "Scan this QR to receive money": a QR can only pay out. */
export const qrReceive: RuleModule = {
  cues: {
    qr: [r`qr(?: code)?|q\.r\.(?: code)?|क्यूआर(?: कोड)?|scanner|scan (?:this|the|karo|kar ?ke|karke|kare|karein|karen|kijiye|it)|स्कैन`],
    qr_pay_ok: [r`(?:to|for) pay(?:ing)? (?:the |your )?(?:bill|merchant|shop|store|order|fees?)|pay (?:at|to) (?:the )?(?:merchant|shop|store|counter)|at (?:the )?(?:counter|store|shop)`],
  },
  rules: [
    {
      id: 'qr.scan_to_receive', cat: 'qr_receive', w: 70, all: ['qr', 'receive'], near: 220,
      en: ['Scan a QR to "receive" money', 'Scanning a QR code can only send money from your account. No one sends you money this way.'],
      hi: ['पैसे "पाने" के लिए QR स्कैन करने को कहा', 'QR कोड स्कैन करने से सिर्फ़ आपके खाते से पैसे जा सकते हैं। ऐसे कोई पैसे नहीं भेजता।'],
    },
    {
      id: 'qr.scan_pin', cat: 'qr_receive', w: 50, all: ['qr', 'pin_enter'], not: 'qr_pay_ok',
      en: ['Scan a QR and enter your PIN', 'Scanning plus PIN is a payment. Only do it when you are the one paying.'],
      hi: ['QR स्कैन करके PIN डालने को कहा', 'स्कैन और PIN, यानी पेमेंट। यह तभी करें जब आप ख़ुद किसी को पैसे दे रहे हों।'],
    },
  ],
};
