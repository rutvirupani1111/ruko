import { G3, r, type RuleModule } from './types';

/** SIM swap and eSIM scams: "SIM blocked in 2 hours", "upgrade to eSIM, send ESIM to 121". */
export function simSwap(): RuleModule {
  return {
    cues: {
      sim: [r`sim(?: card)?|e-?sim|सिम(?: कार्ड)?|mobile (?:number|connection|service)|(?:jio|airtel|vi|vodafone|idea|bsnl) (?:number|sim|connection)|your (?:mobile )?number|(?:aapka|aapki|tumhara) (?:number|sim)|आपका (?:नंबर|सिम)`],
      sim_threat: [
        r`(?:sim|e-?sim|number|mobile number|connection|services?)${G3}(?:will be|shall be|is going to be|would be|to be|has been|are being|is being) (?:permanently |temporarily |immediately )?(?:blocked|block|suspended|deactivated|disconnected|discontinued|closed|barred|terminated|stopped)`,
        r`(?:sim|number)${G3}(?:band|bandh|block|deactivate)(?: \S+)? (?:ho|kar) (?:jayega|jaega|jayegi|jaegi|diya jayega|di jayegi)`,
        r`(?:सिम|नंबर)(?: \S+){0,3} (?:बंद|ब्लॉक)(?: \S+)? (?:हो|कर) (?:जाएगा|जाएगी|दिया जाएगा|दी जाएगी)`,
      ],
      esim: [
        r`e-?sim (?:upgrade|activation|request|conversion|convert|update|card|qr|code|activate)|(?:upgrade|convert|switch) (?:your )?(?:sim|physical sim|4g sim)(?: \S+){0,2} (?:to|into) (?:e-?sim|5g)`,
        r`5g (?:upgrade|sim upgrade|sim)|sim (?:upgrade|swap|replacement|update|kyc)|(?:send|sms|type) "?e-?sim"?|ई-?सिम`,
      ],
      esim_act: [r`(?:send|sms|share|forward|reply|scan|type|tell|give)(?: \S+){0,3} (?:esim|e-sim|email|e-mail|otp|code|qr|details)|(?:otp|code|qr)(?: \S+){0,3} (?:share|bhej|bata|send)|भेजें|कोड (?:बताएं|भेजें)`],
      not_requested: [r`if (?:you )?(?:did not|didn't|have not|haven't) (?:request|raise|initiate|place)|if not (?:requested|initiated|done) by you|(?:aapne|आपने) (?:request )?(?:nahi|नहीं) (?:ki|की)`],
      recharge_ctx: [r`recharge|validity|plan|pack|balance|top-?up|रिचार्ज|वैलिडिटी`],
      illegal: [r`illegal|unlawful|suspicious|criminal|misuse(?:d)?|fraudulent|harass(?:ing|ment)|objectionable|अवैध|गैरकानूनी|गलत इस्तेमाल`],
      trai_dot: { free: true, p: [r`\btrai\b|telecom regulatory|department of telecom(?:munications?)?|\bdot\b (?:department|officer|india)|ट्राई|दूरसंचार विभाग`] },
    },
    rules: [
      {
        id: 'sim.block_threat', cat: 'sim_swap', w: 45, all: ['sim_threat', 'call_cta|press|kyc|verify|@ulink|@mobile|urgent|illegal'], not: 'recharge_ctx',
        en: ['Threat to block your SIM', 'Telecom operators do not block SIMs through threatening calls or messages with a deadline.'],
        hi: ['आपका सिम बंद करने की धमकी', 'टेलीकॉम कंपनियाँ धमकी भरे कॉल या समय-सीमा वाले मैसेज से सिम बंद नहीं करतीं।'],
      },
      {
        id: 'sim.esim', cat: 'sim_swap', w: 50, all: ['esim', 'esim_act|@ulink|@mobile'], not: 'not_requested',
        en: ['eSIM or 5G "upgrade" request', 'Following these steps moves your number to the scammer’s phone, along with all your OTPs.'],
        hi: ['eSIM या 5G "अपग्रेड" की रिक्वेस्ट', 'ये स्टेप करने से आपका नंबर और सारे OTP ठग के फ़ोन पर चले जाते हैं।'],
      },
      {
        id: 'sim.trai', cat: 'sim_swap', w: 50, all: ['trai_dot', 'block_word|illegal|sim_threat|da_legal'],
        en: ['"TRAI" will disconnect your number', 'TRAI does not disconnect individual numbers or call people about illegal activity.'],
        hi: ['"TRAI" आपका नंबर बंद करेगा', 'TRAI किसी एक व्यक्ति का नंबर बंद नहीं करता, न अवैध गतिविधि के बारे में फ़ोन करता है।'],
      },
      {
        id: 'sim.press_digit', cat: 'sim_swap', w: 35, all: ['press', 'sim|sim_threat'],
        en: ['Automated call: "press 9" about your SIM', 'Recorded calls about your number being blocked connect you to scammers.'],
        hi: ['ऑटोमेटेड कॉल: सिम के लिए "9 दबाएं"', 'नंबर बंद होने वाली रिकॉर्डेड कॉल आपको ठगों से जोड़ती है।'],
      },
    ],
  };
}
