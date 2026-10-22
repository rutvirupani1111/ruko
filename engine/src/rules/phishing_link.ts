import { r, type RuleModule } from './types';

/** Phishing wording around links: login bait, fake challans, short links about money. */
export const phishingLink: RuleModule = {
  cues: {
    challan: [r`(?:traffic |e-?|vehicle )?challan|चालान|(?:traffic|rto) (?:fine|penalty|violation)|over-?speeding|parivahan`],
    login_bait: [r`(?:login|log in|sign in|verify|confirm|validate|update|reactivate|unlock|restore)(?: \S+){0,3} (?:your )?(?:account|password|details|card|net ?banking|profile|credentials|identity)`],
    suspicious_activity: [r`(?:unusual|suspicious|unauthori[sz]ed|unknown) (?:activity|login|sign-?in|transaction|access)|(?:someone|somebody) (?:tried|is trying) to (?:login|access)|account (?:compromised|hacked)`],
  },
  rules: [
    {
      id: 'phish.login_link', cat: 'phishing_link', w: 40, all: ['login_bait|suspicious_activity', '@ulink'],
      en: ['Asks you to log in or verify through a link', 'Phishing pages copy real login screens to steal your password and OTP.'],
      hi: ['लिंक से लॉगिन या वेरिफ़ाई करने को कहा', 'फ़िशिंग पेज असली लॉगिन स्क्रीन की नकल करके पासवर्ड और OTP चुराते हैं।'],
    },
    {
      id: 'phish.link_money', cat: 'phishing_link', w: 25, all: ['link_cta', '@ulink', 'bank|card|refund_word|reward_word|kyc|prize_word|money_word'], x: 'linkacct',
      en: ['Pushes you to open a link about money', 'Links in messages about money, rewards or refunds are the most common phishing trick.'],
      hi: ['पैसों से जुड़ा लिंक खोलने का दबाव', 'पैसे, इनाम या रिफ़ंड वाले मैसेज के लिंक फ़िशिंग की सबसे आम चाल हैं।'],
    },
    {
      id: 'phish.challan', cat: 'phishing_link', w: 50, all: ['challan', '@ulink|apk_word|install_app|@mobile'],
      en: ['Traffic challan through a link or app', 'Pay challans only on echallan.parivahan.gov.in. Fake challan links and APKs are common.'],
      hi: ['लिंक या ऐप से ट्रैफ़िक चालान', 'चालान सिर्फ़ echallan.parivahan.gov.in पर भरें। नकली चालान वाले लिंक और APK बहुत आम हैं।'],
    },
    {
      id: 'phish.short_link_money', cat: 'phishing_link', w: 30, all: ['@short', 'bank|account|kyc|card|refund_word|reward_word|loan|prize_word|challan'],
      en: ['Short link about your bank or money', 'Short links hide the real website. Banks link to their own domain.'],
      hi: ['बैंक या पैसों के बारे में छोटा लिंक', 'छोटे लिंक असली वेबसाइट छिपा देते हैं। बैंक अपनी ही वेबसाइट का लिंक देते हैं।'],
    },
  ],
};
