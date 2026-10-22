import { r, type RuleModule } from './types';

/** Sextortion: recorded video calls and "pay or we leak it" threats, often followed by fake police. */
export const sextortion: RuleModule = {
  cues: {
    explicit: [
      r`(?:nude|naked|obscene|intimate|private|explicit|sex|sexual|porn|vulgar|dirty|gandi|nangi|nanga) (?:video|videos|photos?|pics?|clip|chat|call|video call)|(?:video|photos?|clip)s? (?:of you )?(?:naked|nude)`,
      r`अश्लील (?:वीडियो|फोटो|चैट)|नग्न|गंदी (?:वीडियो|फोटो)|आपत्तिजनक (?:वीडियो|फोटो)`,
    ],
    recorded: [
      r`(?:recorded|record(?:ing)?|captured|screen ?record(?:ed|ing)?) (?:your |the |our |this )?(?:video ?call|video|call|screen)|screen recording`,
      r`video (?:call )?record (?:ho|kar|kr) (?:gaya|gayi|liya|li|li hai|liya hai)|(?:वीडियो|कॉल) रिकॉर्ड`,
    ],
    expose: [
      r`(?:send|share|forward|upload|post|leak|show|circulate|publish)(?: \S+){0,4} (?:to|on|with|in) (?:all )?(?:your )?(?:family|friends|contacts|relatives|wife|husband|parents|father|mother|colleagues|office|boss|youtube|facebook|instagram|social media|everyone|whatsapp groups?|internet)`,
      r`(?:go|goes|will go|make it|made) viral|viral (?:kar|ho) (?:denge|dunga|doonga|jayega|jaega|dege|dungi)`,
      r`(?:sabko|sab ko|sabhi ko|family ko|ghar (?:walon|valon|walo) ko|relatives ko|rishtedaron ko|dosto ko) (?:bhej|dikha|send|forward)|youtube (?:par|pe) (?:daal|upload|dal)`,
      r`सबको (?:भेज|दिखा)|वायरल (?:कर|हो)|बदनाम (?:कर|हो)|(?:परिवार|घरवालों|रिश्तेदारों|दोस्तों) (?:को|में) (?:भेज|दिखा)`,
    ],
    pay_demand: [
      r`(?:₹|rs\.?|inr)? ?\d[\d,]*k? (?:bhej|bhejo|de|do|send|pay|transfer|dedo|chahiye)|pay (?:me|us|now)|paise (?:bhej|de|do)|पैसे (?:भेजो|भेज|दो|दे)|(?:रुपये|रुपए) (?:भेजो|दो)`,
    ],
    delete_video: [r`(?:delete|remove|take down|hata)(?: \S+){0,3} (?:the )?(?:video|photos?|clip|content|post)|video (?:delete|hata|remove)|वीडियो (?:डिलीट|हटा)`],
  },
  rules: [
    {
      id: 'sext.threat', cat: 'sextortion', w: 60, all: ['explicit|recorded', 'expose'],
      en: ['Threat to leak a private video', 'This is blackmail. Paying never makes it stop. Stop replying and report it.'],
      hi: ['निजी वीडियो लीक करने की धमकी', 'यह ब्लैकमेल है। पैसे देने से यह रुकता नहीं। जवाब देना बंद करें और शिकायत करें।'],
    },
    {
      id: 'sext.pay_or_else', cat: 'sextortion', w: 45, all: ['explicit|recorded|expose', 'pay_demand|money_req', 'threat|expose|urgent'],
      en: ['Pay or the video goes out', 'Blackmailers demand more after every payment.'],
      hi: ['पैसे दो वरना वीडियो वायरल', 'ब्लैकमेलर हर पेमेंट के बाद और पैसे माँगते हैं।'],
    },
    {
      id: 'sext.police_video', cat: 'sextortion', w: 50, all: ['da_agency|da_police', 'explicit|recorded|delete_video', 'pay_demand|money_req|fee|delete_video'],
      en: ['Fake police demand money over a video', 'After a sextortion call, fake "police" or "YouTube officers" ask for money to delete the video. They are the same gang.'],
      hi: ['वीडियो के नाम पर नकली पुलिस की माँग', 'सेक्सटॉर्शन कॉल के बाद नकली "पुलिस" या "YouTube अधिकारी" वीडियो हटाने के पैसे माँगते हैं। ये उसी गिरोह के लोग होते हैं।'],
    },
    {
      id: 'sext.explicit_money', cat: 'sextortion', w: 40, all: ['explicit', 'pay_demand|money_req'],
      en: ['Money demanded over intimate content', 'Report blackmail at cybercrime.gov.in. You are not at fault.'],
      hi: ['निजी कंटेंट के बदले पैसों की माँग', 'ब्लैकमेल की शिकायत cybercrime.gov.in पर करें। इसमें आपकी कोई ग़लती नहीं है।'],
    },
  ],
};
