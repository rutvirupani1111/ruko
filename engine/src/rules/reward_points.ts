import { r, type RuleModule } from './types';

/** Credit card reward points "expiring today, redeem now" (often with an APK). */
export const rewardPoints: RuleModule = {
  cues: {
    points: [
      r`reward points?|rewards? (?:point|pts)|credit card points|(?:points|pts) (?:worth|of|value)|loyalty points|redeem(?:able)? points|(?:sbi|hdfc|icici|axis|kotak|credit card|card) (?:reward|rewards)`,
      r`रिवॉर्ड (?:पॉइंट|प्वाइंट)|reward point`,
    ],
    expiring: [r`expir(?:e|es|ed|ing|y)|lapse|lapsing|समाप्त|expire (?:ho|hone)|khatam (?:ho|hone)`],
    redeem: [r`redeem|redemption|रिडीम|claim (?:your )?(?:points|rewards?)|convert (?:to|into) cash|cash (?:out|in) (?:your )?points`],
  },
  rules: [
    {
      id: 'rp.expiring', cat: 'reward_points', w: 35, all: ['points', 'expiring', 'redeem'],
      en: ['Reward points "expiring", redeem now', 'Expiring-points messages push you to a fake page or app that steals card details.'],
      hi: ['रिवॉर्ड पॉइंट "ख़त्म" होने वाले हैं, अभी रिडीम करें', 'पॉइंट ख़त्म होने वाले मैसेज नकली पेज या ऐप पर ले जाते हैं जो कार्ड की जानकारी चुराते हैं।'],
    },
    {
      id: 'rp.link', cat: 'reward_points', w: 35, all: ['points', 'redeem|expiring|@amount', '@ulink'],
      en: ['Redeem points through a link', 'Points are redeemed only inside your bank app or official rewards site.'],
      hi: ['लिंक से पॉइंट रिडीम करने को कहा', 'पॉइंट सिर्फ़ बैंक के ऐप या आधिकारिक रिवॉर्ड साइट पर रिडीम होते हैं।'],
    },
    {
      id: 'rp.apk', cat: 'reward_points', w: 50, all: ['points', 'apk_word|install_app|@apk'], not: 'playstore',
      en: ['Install an app to redeem points', 'Reward-point APKs read your SMS and OTPs and empty your card.'],
      hi: ['पॉइंट के लिए ऐप डालने को कहा', 'रिवॉर्ड पॉइंट वाले APK आपके SMS और OTP पढ़कर कार्ड खाली कर देते हैं।'],
    },
  ],
};
