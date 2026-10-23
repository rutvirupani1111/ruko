import { defineStrings } from '@/i18n/core';

export const privacyStrings = defineStrings(
  'privacy',
  {
    title: 'How Ruko protects your privacy',
    eyebrow: 'Privacy',
    heading: 'Ruko checks your messages without seeing them',
    intro:
      'Scam checkers that upload your messages learn a lot about you: your bank, your family, your money. Ruko was built the other way round. The checking happens on your phone.',
    cards: {
      engine: {
        title: 'Checks run on your phone',
        body: 'The detection engine runs inside this page. Messages, links, UPI IDs and numbers you paste are never uploaded, and it works offline too.',
      },
      screenshots: {
        title: 'Screenshots stay with you',
        body: 'Text in a screenshot is read by a recogniser running in your browser. The first time, it downloads the English and Hindi reading data from jsDelivr; your image never leaves.',
      },
      account: {
        title: 'No account, no tracking',
        body: 'No sign-up, no ads, no analytics cookies. Only small preferences such as your language, theme and checklist are saved, on this device.',
      },
    },
    diagram: {
      heading: 'How community lookups stay private',
      intro:
        'When you check a UPI ID, number or link, Ruko can ask the community list whether others reported it. It does this with k-anonymity, the trick used by Have I Been Pwned, so the server never learns what you checked.',
      phone: 'Your phone',
      server: 'Ruko server',
      youCheck: 'You check',
      example: 'Example',
      fingerprint: 'Fingerprint (SHA-256)',
      sends: 'Sends',
      received: 'Received',
      onlyThis: 'This is all the server sees.',
      waiting: 'Nothing received yet.',
      bucket: 'Bucket for',
      bucketNote: 'Every reported fingerprint that starts the same way.',
      reports: (n: string) => `${n} reports`,
      more: 'and more',
      match: 'Match found on your phone',
      matchBody: (n: string) => `Reported by ${n} people. Community reports, not verified.`,
      steps: {
        hash: {
          short: 'Fingerprint',
          title: '1. Your phone makes a fingerprint',
          body: 'The ID is turned into a 64-character code (SHA-256) on your phone. The same ID always gives the same code.',
        },
        send: {
          short: 'Send 5',
          title: '2. Only 5 characters leave',
          body: 'Ruko sends just the first 5 characters. Thousands of different numbers and IDs start with the same 5, so they point to nobody in particular.',
        },
        bucket: {
          short: 'Bucket',
          title: '3. The server sends back a bucket',
          body: 'The server replies with every reported fingerprint that starts with those 5 characters, and how many people reported each one.',
        },
        match: {
          short: 'Match',
          title: '4. Your phone finds the match',
          body: 'Your phone compares the rest of the fingerprint with the bucket. Only your phone knows whether there was a match.',
        },
      },
      play: 'Play',
      pause: 'Pause',
      stepLabel: (n: number) => `Step ${n}`,
    },
    tryIt: {
      label: 'Try it with any UPI ID, number or link',
      placeholder: 'name@okaxis or 98765 43210',
      note: 'Worked out on this page. Nothing you type here is sent.',
      wouldSend: 'Ruko would send only',
      notAnId: 'Type a UPI ID, a phone number or a link.',
    },
    toggle: {
      title: 'Community lookups',
      on: 'On: Ruko sends the 5-character prefix for each UPI ID, number or link you check.',
      off: 'Off: every check stays fully on this device. You will not see community warnings.',
    },
    server: {
      heading: 'What the Ruko server keeps',
      keepsTitle: 'Keeps',
      keeps: [
        'Fingerprints of reported IDs, the scam type and how many people reported them.',
        'A code made from your IP address that changes every day, only to stop spam. The IP address itself is never stored.',
      ],
      neverTitle: 'Never gets',
      never: [
        'The UPI ID, number or link you check.',
        'Your messages, screenshots or anything you paste.',
        'Your name, phone number or contacts.',
      ],
      reports:
        'When you report a scammer, your phone sends the full fingerprint (not the ID), the scam type and a proof-of-work puzzle answer.',
      hosting: 'Like every website, our hosting provider handles standard request data such as IP addresses to deliver pages.',
    },
    open: {
      title: 'Do not just take our word for it',
      body: 'Ruko is open source. Anyone can read the code and check that it does what this page says.',
      cta: 'Read the code on GitHub',
    },
  },
  {
    title: 'Ruko आपकी प्राइवेसी कैसे बचाता है',
    eyebrow: 'प्राइवेसी',
    heading: 'Ruko आपके मैसेज देखे बिना उन्हें जाँचता है',
    intro:
      'जो स्कैम चेकर आपके मैसेज अपलोड करते हैं, वे आपके बारे में बहुत कुछ जान लेते हैं: आपका बैंक, आपका परिवार, आपका पैसा। Ruko इसका उल्टा करता है। जाँच आपके फ़ोन पर ही होती है।',
    cards: {
      engine: {
        title: 'जाँच आपके फ़ोन पर होती है',
        body: 'स्कैम पहचानने वाला इंजन इसी पेज के अंदर चलता है। आप जो मैसेज, लिंक, UPI आईडी या नंबर पेस्ट करते हैं, वह कभी अपलोड नहीं होता, और यह बिना इंटरनेट के भी चलता है।',
      },
      screenshots: {
        title: 'स्क्रीनशॉट आपके पास रहते हैं',
        body: 'स्क्रीनशॉट का टेक्स्ट आपके ब्राउज़र में चलने वाला टूल पढ़ता है। पहली बार यह jsDelivr से अंग्रेज़ी और हिंदी पढ़ने का डेटा डाउनलोड करता है; आपकी तस्वीर कहीं नहीं जाती।',
      },
      account: {
        title: 'न अकाउंट, न ट्रैकिंग',
        body: 'न साइन-अप, न विज्ञापन, न एनालिटिक्स कुकी। सिर्फ़ भाषा, थीम और चेकलिस्ट जैसी छोटी पसंद इसी डिवाइस पर सेव होती हैं।',
      },
    },
    diagram: {
      heading: 'कम्युनिटी जाँच प्राइवेट कैसे रहती है',
      intro:
        'जब आप कोई UPI आईडी, नंबर या लिंक जाँचते हैं, तो Ruko कम्युनिटी लिस्ट से पूछ सकता है कि क्या दूसरों ने इसे रिपोर्ट किया है। यह k-anonymity से होता है, वही तरीका जो Have I Been Pwned इस्तेमाल करता है, इसलिए सर्वर को कभी पता नहीं चलता कि आपने क्या जाँचा।',
      phone: 'आपका फ़ोन',
      server: 'Ruko सर्वर',
      youCheck: 'आप जाँचते हैं',
      example: 'उदाहरण',
      fingerprint: 'फ़िंगरप्रिंट (SHA-256)',
      sends: 'भेजता है',
      received: 'मिला',
      onlyThis: 'सर्वर को बस इतना ही दिखता है।',
      waiting: 'अभी कुछ नहीं मिला।',
      bucket: 'बकेट',
      bucketNote: 'ऐसे सभी रिपोर्ट किए गए फ़िंगरप्रिंट जो इसी तरह शुरू होते हैं।',
      reports: (n: string) => `${n} रिपोर्ट`,
      more: 'और भी',
      match: 'मिलान आपके फ़ोन पर हुआ',
      matchBody: (n: string) => `${n} लोगों ने रिपोर्ट किया। कम्युनिटी रिपोर्ट, जाँची हुई नहीं।`,
      steps: {
        hash: {
          short: 'फ़िंगरप्रिंट',
          title: '1. आपका फ़ोन फ़िंगरप्रिंट बनाता है',
          body: 'आपके फ़ोन पर ही आईडी को 64 अक्षरों के एक कोड (SHA-256) में बदला जाता है। एक ही आईडी से हमेशा एक ही कोड बनता है।',
        },
        send: {
          short: '5 अक्षर',
          title: '2. सिर्फ़ 5 अक्षर बाहर जाते हैं',
          body: 'Ruko सिर्फ़ पहले 5 अक्षर भेजता है। हज़ारों अलग-अलग नंबर और आईडी इन्हीं 5 अक्षरों से शुरू होते हैं, इसलिए इनसे किसी एक का पता नहीं चलता।',
        },
        bucket: {
          short: 'बकेट',
          title: '3. सर्वर एक बकेट लौटाता है',
          body: 'सर्वर उन सभी रिपोर्ट किए गए फ़िंगरप्रिंट की लिस्ट लौटाता है जो इन्हीं 5 अक्षरों से शुरू होते हैं, और हर एक को कितने लोगों ने रिपोर्ट किया।',
        },
        match: {
          short: 'मिलान',
          title: '4. मिलान आपके फ़ोन पर होता है',
          body: 'आपका फ़ोन बाकी फ़िंगरप्रिंट को उस लिस्ट से मिलाता है। मिलान हुआ या नहीं, यह सिर्फ़ आपका फ़ोन जानता है।',
        },
      },
      play: 'चलाएँ',
      pause: 'रोकें',
      stepLabel: (n: number) => `चरण ${n}`,
    },
    tryIt: {
      label: 'किसी भी UPI आईडी, नंबर या लिंक से आज़माएँ',
      placeholder: 'name@okaxis या 98765 43210',
      note: 'यह इसी पेज पर बनता है। यहाँ लिखा कुछ भी भेजा नहीं जाता।',
      wouldSend: 'Ruko सिर्फ़ इतना भेजेगा',
      notAnId: 'UPI आईडी, फ़ोन नंबर या लिंक लिखें।',
    },
    toggle: {
      title: 'कम्युनिटी जाँच',
      on: 'चालू: आप जो भी UPI आईडी, नंबर या लिंक जाँचते हैं, उसके सिर्फ़ 5 अक्षर भेजे जाते हैं।',
      off: 'बंद: हर जाँच पूरी तरह इसी डिवाइस पर रहती है। आपको कम्युनिटी चेतावनियाँ नहीं दिखेंगी।',
    },
    server: {
      heading: 'Ruko सर्वर क्या रखता है',
      keepsTitle: 'रखता है',
      keeps: [
        'रिपोर्ट की गई आईडी के फ़िंगरप्रिंट, ठगी का प्रकार और कितने लोगों ने रिपोर्ट किया।',
        'आपके IP पते से बना एक कोड जो हर दिन बदलता है, सिर्फ़ स्पैम रोकने के लिए। IP पता खुद कभी सेव नहीं होता।',
      ],
      neverTitle: 'कभी नहीं पाता',
      never: [
        'वह UPI आईडी, नंबर या लिंक जो आप जाँचते हैं।',
        'आपके मैसेज, स्क्रीनशॉट या जो कुछ भी आप पेस्ट करते हैं।',
        'आपका नाम, फ़ोन नंबर या कॉन्टैक्ट।',
      ],
      reports: 'जब आप किसी ठग की रिपोर्ट करते हैं, तो आपका फ़ोन पूरा फ़िंगरप्रिंट (आईडी नहीं), ठगी का प्रकार और एक पहेली (proof-of-work) का जवाब भेजता है।',
      hosting: 'हर वेबसाइट की तरह, हमारी होस्टिंग कंपनी पेज दिखाने के लिए IP पते जैसी सामान्य जानकारी संभालती है।',
    },
    open: {
      title: 'सिर्फ़ हमारी बात पर भरोसा न करें',
      body: 'Ruko ओपन सोर्स है। कोई भी इसका कोड पढ़कर जाँच सकता है कि यह वही करता है जो इस पेज पर लिखा है।',
      cta: 'GitHub पर कोड देखें',
    },
  },
);
