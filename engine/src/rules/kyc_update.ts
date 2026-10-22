import { r, type RuleModule } from './types';

/** Fake KYC update: "your KYC expired, account blocked today, update at this link". */
export function kycUpdate(): RuleModule {
  const KYC = r`(?:e-?|re-?|c)?kyc|k\.y\.c\.?|k y c|केवाईसी|के\.वाई\.सी\.?|केवाइसी`;

  return {
    cues: {
      kyc: [r`${KYC}|know your customer`],
      kyc_bad: [
        r`(?:${KYC})(?: \S+){0,4} (?:expired?|expiring|pending|incomplete|not (?:been )?(?:updated|completed|verified|done)|outdated|suspended|blocked|failed|rejected|due|mandatory|required|invalid|deactivated)`,
        r`(?:update|complete|verify|renew|re-?submit|submit|do) (?:your |the |ur )?(?:${KYC})|(?:${KYC}) (?:update|updation|verification|renewal|re-?verification)`,
        r`(?:${KYC})(?: \S+){0,3} (?:nahi|nhi|nahin) (?:hai|hua|hui|kiya)|(?:${KYC}) (?:update|pura) (?:karo|karein|karen|kare|kariye|kijiye|kar lo|karwaye|karwa lo)`,
        r`(?:${KYC})(?: \S+){0,3} (?:अपडेट|अधूरा|अधूरी|लंबित|समाप्त|एक्सपायर|पेंडिंग|नहीं)|(?:अपडेट|पूरा|पूरी) (?:करें|करे|कीजिए|कीजिये)(?: \S+){0,2} (?:${KYC})`,
      ],
      pan_aadhaar: [
        r`(?:pan|aadhaa?r|adhaa?r)(?: card)?(?: \S+){0,2} (?:link|linking|linked|update|updation|seeding|verification|verify|not updated|is not linked|expired|blocked|deactivated)`,
        r`(?:link|update|verify|seed) (?:your )?(?:pan|aadhaa?r|adhaa?r)(?: card)?|pan card (?:update|link) (?:karo|karein|kare)`,
        r`(?:पैन|आधार) (?:कार्ड )?(?:लिंक|अपडेट|सत्यापन)`,
      ],
    },
    rules: [
      {
        id: 'kyc.status', cat: 'kyc_update', w: 30, all: ['kyc_bad'],
        en: ['Says your KYC is pending or expired', 'Fake KYC alerts are the most common bank scam. Banks ask you to update KYC at a branch or in their app.'],
        hi: ['KYC पेंडिंग या एक्सपायर होने की बात', 'फ़र्ज़ी KYC अलर्ट सबसे आम बैंक ठगी है। बैंक KYC ब्रांच में या अपने ऐप से अपडेट करवाते हैं।'],
      },
      {
        id: 'kyc.block', cat: 'kyc_update', w: 40, all: ['kyc|pan_aadhaar', 'block_threat|block_word'], not: 'sim_threat',
        en: ['Threatens to block your account over KYC', 'Banks never block an account through an SMS deadline. The threat is meant to rush you.'],
        hi: ['KYC के नाम पर खाता बंद करने की धमकी', 'बैंक SMS में समय-सीमा देकर खाता बंद नहीं करते। धमकी आपको जल्दबाज़ी में डालने के लिए है।'],
      },
      {
        id: 'kyc.link', cat: 'kyc_update', w: 35, all: ['kyc|pan_aadhaar', '@ulink'],
        en: ['KYC update through a link', 'No bank asks you to update KYC, PAN or Aadhaar through a link in a message.'],
        hi: ['लिंक से KYC अपडेट करने को कहा', 'कोई भी बैंक मैसेज के लिंक से KYC, PAN या आधार अपडेट नहीं करवाता।'],
      },
      {
        id: 'kyc.call', cat: 'kyc_update', w: 30, all: ['kyc|pan_aadhaar', '@mobile|@intl'],
        en: ['KYC through a phone number', 'Banks do not complete KYC over calls to personal numbers.'],
        hi: ['फ़ोन नंबर पर KYC', 'बैंक निजी नंबरों पर कॉल करके KYC पूरा नहीं करवाते।'],
      },
      {
        id: 'kyc.app', cat: 'kyc_update', w: 40, all: ['kyc|pan_aadhaar', 'install_app|apk_word|remote_app|@apk'], not: 'playstore',
        en: ['Asks you to install an app for KYC', 'KYC never needs a new app from a link or a screen-sharing app.'],
        hi: ['KYC के लिए ऐप डलवाने को कहा', 'KYC के लिए लिंक से कोई नया ऐप या स्क्रीन शेयर करने वाला ऐप नहीं चाहिए होता।'],
      },
      {
        id: 'kyc.pan_threat', cat: 'kyc_update', w: 30, all: ['pan_aadhaar', 'block_threat|urgent|block_word'], not: 'sim_threat',
        en: ['PAN or Aadhaar update under threat', 'Account blocks over PAN updates are a common scam script.'],
        hi: ['धमकी के साथ PAN या आधार अपडेट', 'PAN अपडेट न करने पर खाता बंद होने की बात, ठगी की आम स्क्रिप्ट है।'],
      },
    ],
  };
}
