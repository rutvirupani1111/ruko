import { r, type RuleModule } from './types';

/** OTP theft: "bank officer" asks for the OTP; WhatsApp code "sent by mistake". */
export function otpTheft(): RuleModule {
  return {
    cues: {
      otp: [r`otp|o\.t\.p\.?|one[- ]time (?:password|passcode|pin|code)|verification code|security code|(?:6|six|4|four)[- ]digit (?:code|otp|number|pin)|ओटीपी|ओ\.टी\.पी\.?|वन टाइम पासवर्ड`],
      otp_share: {
        neg: true,
        p: [
          r`(?:share|send|tell|forward|give|read out|provide|say|whatsapp|sms|repeat|batao|bata do|reply with|reply back with) (?:me |us |him |her |it |to me |to us |back )?(?:the |that |this |your |ur |received |same |6 digit |4 digit )?(?:otp|o\.t\.p|one[- ]time password|verification code|security code)`,
          r`(?:otp|o\.t\.p)(?: (?:jo|that|which|aapko|aapke)(?: \S+){0,4})? (?:share|send|bata|batao|bataiye|bataye|btao|btaiye|bata do|bata dijiye|bata dena|bhej|bhejo|bhejiye|bhej do|forward|de do|dedo|dijiye|read out|tell me|tell us|sms kar|whatsapp kar)`,
          r`(?:aaya|aya|aayi|aai|aaye) (?:hua |hoga |hai |huwa )?(?:otp|code)|(?:otp|code) (?:aaya|aya) (?:hoga|hai|hua)`,
          r`ओटीपी (?:हमें |मुझे |मेरे को )?(?:बताएं|बताएँ|बताइए|बताइये|बताओ|बता दें|बता दीजिए|भेजें|भेजिए|भेज दें|भेजो|शेयर करें|दें|दीजिए|दो)|आया (?:हुआ )?(?:ओटीपी|कोड)|(?:ओटीपी|कोड) आया (?:होगा|है)`,
        ],
      },
      code_share: {
        neg: true,
        p: [
          r`share (?:it|the code|this code|code|that code) (?:with|to) (?:me|us)|(?:send|forward) (?:me|us) (?:the|that|this) code|code (?:bata|batao|bhejo|bhej do|bhej de|bhej dena|send kar|send karo|share karo|forward kar)`,
          r`कोड (?:बताएं|बताइए|भेजें|भेज दें)`,
        ],
      },
      delivery_otp: [
        r`(?:share|give|provide|tell) (?:the |this |your )?(?:otp|code|pin)(?: \S+){0,3} (?:with|to) (?:the |our |your )?(?:delivery|rider|driver|captain|valet)`,
        r`(?:delivery|ride|trip|start|handover|pickup|pick-up) (?:otp|code|pin)|(?:otp|code|pin)(?: \S+){0,6} (?:at the time of|upon|on|during|after|before) (?:delivery|pickup|receiving)`,
        r`(?:driver|captain|rider|delivery (?:agent|executive|partner|boy)) (?:ko|को) (?:otp|ओटीपी)`,
      ],
      bank_officer: [
        r`(?:bank|sbi|hdfc|icici|axis|kotak|rbi|head office|branch|card department|customer care|credit card|security|fraud (?:team|department|cell)|verification (?:team|department))(?: \S+){0,3} (?:officer|executive|manager|agent|staff|team|department)`,
        r`calling (?:you )?from (?:\S+ )?(?:bank|sbi|hdfc|icici|axis|head office|rbi|customer care|amazon|flipkart|paytm|phonepe)|बैंक (?:से|अधिकारी|मैनेजर)|bank se (?:bol raha|baat kar)`,
      ],
      wa_code: [
        r`whatsapp (?:code|otp|verification code|6[- ]digit)|(?:code|otp)(?: \S+){0,6} (?:by mistake|accidentally|galti se|wrong number)`,
        r`(?:sent|send) (?:my |a )?(?:code|otp) (?:to your number|on your number)|(?:mistake|galti) se (?:aapke|your|tumhare) (?:number|phone)(?: \S+){0,3} (?:code|otp)`,
      ],
    },
    rules: [
      {
        id: 'otp.share_request', cat: 'otp_theft', w: 65, all: ['otp_share'], not: 'delivery_otp',
        en: ['Asks you to share an OTP', 'An OTP is the key to your account. No bank, company or official ever asks for it.'],
        hi: ['OTP बताने को कहा', 'OTP आपके खाते की चाबी है। कोई बैंक, कंपनी या अधिकारी इसे कभी नहीं माँगता।'],
      },
      {
        id: 'otp.code_request', cat: 'otp_theft', w: 50, all: ['code_share', 'otp|wa_code|bank_officer|mistake|verify'], not: 'delivery_otp|otp_share',
        en: ['Asks for a code sent to your phone', 'Codes sent to your phone let someone take over your account or WhatsApp.'],
        hi: ['आपके फ़ोन पर आया कोड माँगा', 'आपके फ़ोन पर आए कोड से कोई आपका अकाउंट या WhatsApp अपने क़ब्ज़े में ले सकता है।'],
      },
      {
        id: 'otp.officer', cat: 'otp_theft', w: 30, all: ['otp', 'bank_officer'], not: 'delivery_otp|dont_share|awareness',
        en: ['"Bank officer" talks about an OTP', 'Bank staff never call or message about OTPs.'],
        hi: ['"बैंक अधिकारी" OTP की बात कर रहा है', 'बैंक के कर्मचारी OTP के बारे में कभी फ़ोन या मैसेज नहीं करते।'],
      },
      {
        id: 'otp.whatsapp_code', cat: 'otp_theft', w: 55, all: ['wa_code'], not: 'dont_share|awareness',
        en: ['WhatsApp code "sent by mistake"', 'Forwarding that code lets them hijack your WhatsApp and message your contacts for money.'],
        hi: ['"ग़लती से भेजा" WhatsApp कोड', 'वह कोड भेजते ही आपका WhatsApp उनके पास चला जाएगा और वे आपके कॉन्टैक्ट्स से पैसे माँगेंगे।'],
      },
      {
        id: 'ok.delivery_otp', cat: 'other', w: -10, all: ['delivery_otp'],
        en: ['OTP is for handing over a delivery or ride', 'Sharing a delivery or ride OTP with the agent in person is normal.'],
        hi: ['OTP डिलीवरी या राइड के लिए है', 'डिलीवरी या राइड का OTP सामने मौजूद एजेंट को बताना सामान्य बात है।'],
      },
    ],
  };
}
