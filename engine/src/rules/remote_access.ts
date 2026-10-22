import { r, type RuleModule } from './types';

/** Remote access scams: AnyDesk, TeamViewer QuickSupport, RustDesk, screen sharing. */
export const remoteAccess: RuleModule = {
  cues: {
    remote_app: [
      r`any ?desk|team ?viewer|quick ?support|rust ?desk|air ?droid|ammyy(?: admin)?|ultra ?viewer|supremo|splashtop|zoho assist|alpemix|quick assist|remote (?:desktop|access|control|support) (?:app|software)`,
      r`एनीडेस्क|एनी डेस्क|टीमव्यूअर|टीम व्यूअर`,
    ],
    screen_share: [r`screen ?shar(?:e|ing)|share (?:your |ur )?screen|स्क्रीन (?:शेयर|साझा)|screen share (?:karo|kare|karein|on)`],
    ra_action: [r`download|install|open|share|code|id|9[- ]digit|nine digit|डाउनलोड|कोड|इंस्टॉल`],
    money_ctx: [r`bank|refund|kyc|payment|upi|account|customer care|support|verification|verify|cashback|loan|card|बैंक|रिफंड|खाता|पेमेंट`],
  },
  rules: [
    {
      id: 'ra.app', cat: 'remote_access', w: 65, all: ['remote_app', 'ra_action|money_ctx'],
      en: ['Asks you to install a screen-sharing app', 'AnyDesk, TeamViewer and similar apps let the caller see your OTPs and control your phone.'],
      hi: ['स्क्रीन शेयर करने वाला ऐप डलवाना', 'AnyDesk, TeamViewer जैसे ऐप से सामने वाला आपके OTP देख सकता है और फ़ोन चला सकता है।'],
    },
    {
      id: 'ra.app_mention', cat: 'remote_access', w: 40, all: ['remote_app'], not: 'ra_action|money_ctx',
      en: ['Mentions a remote access app', 'Never install remote access apps for someone who contacted you.'],
      hi: ['रिमोट एक्सेस ऐप का ज़िक्र', 'जिसने आपसे ख़ुद संपर्क किया हो, उसके कहने पर रिमोट एक्सेस ऐप कभी न डालें।'],
    },
    {
      id: 'ra.screen_share', cat: 'remote_access', w: 60, all: ['screen_share', 'money_ctx'],
      en: ['Share your screen for a bank or refund issue', 'Sharing your screen shows your OTPs and PINs to the other person.'],
      hi: ['बैंक या रिफ़ंड के लिए स्क्रीन शेयर', 'स्क्रीन शेयर करने से सामने वाले को आपके OTP और PIN दिख जाते हैं।'],
    },
  ],
};
