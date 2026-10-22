import { r, type RuleModule } from './types';

/** Fake government schemes: PM-Kisan, free laptops, ration, subsidies with a "registration fee". */
export const govtScheme: RuleModule = {
  cues: {
    scheme: [
      r`yojana|yojna|scheme|योजना|pm[- ]?kisan|kisan samman|ayushman|pm awas|awas yojana|ujjwala|mudra (?:loan|yojana)|ladli (?:behna|bahna)|ladki bahin|subsidy|सब्सिडी|अनुदान|berojgari bhatta|बेरोजगारी भत्ता`,
      r`(?:free|muft|मुफ्त|फ्री) (?:laptop|ration|recharge|scooty|cycle|mobile|tablet|gas|solar|data|smartphone|sewing machine|silai machine|लैपटॉप|राशन|रिचार्ज|स्कूटी|मोबाइल)`,
      r`(?:government|govt|sarkari|sarkar|central govt|modi|pm|pradhan mantri|प्रधानमंत्री|सरकारी|सरकार) (?:scheme|yojana|yojna|subsidy|grant|help|ki taraf se|की ओर से|की तरफ से|योजना|सहायता|offer|gift)`,
    ],
    reg_fee: [
      r`registration (?:fee|charges?|amount)|(?:apply|application|form|processing|file|verification|enrol(?:l)?ment) (?:fee|fees|charges?)|pay (?:₹|rs\.?|inr)? ?\d+ (?:to|for) (?:register|apply|activate|enrol)`,
      r`पंजीकरण (?:शुल्क|फीस)|आवेदन शुल्क|(?:₹|rs\.?)? ?\d+ (?:rs|rupaye|rupees)? ?(?:bhej|jama)(?: \S+){0,2} (?:form|registration|apply)|fees? (?:jama|bhej|pay) (?:karo|karein|kare)`,
    ],
    free: [r`free|मुफ्त|muft|free mein|फ्री`],
    forward_chain: [
      r`(?:forward|share|send) (?:this |it |the message )?(?:to|in|with) (?:\d+|ten|five|twenty|all your) (?:groups?|people|friends|contacts)|\d+ (?:groups?|logon|logo) (?:me|mein|ko) (?:bhej|share|forward)`,
      r`(?:\d+|दस|पांच|बीस) (?:ग्रुप|लोगों) (?:में|को) (?:भेज|शेयर)`,
    ],
  },
  rules: [
    {
      id: 'gov.scheme_fee', cat: 'govt_scheme', w: 55, all: ['scheme', 'reg_fee|fee|fee_pay|money_req'],
      en: ['Government scheme that asks for a fee', 'Government schemes never charge a fee over WhatsApp or SMS. Apply only on .gov.in sites or at a CSC.'],
      hi: ['फ़ीस माँगने वाली "सरकारी योजना"', 'सरकारी योजनाएं WhatsApp या SMS पर फ़ीस नहीं माँगतीं। आवेदन सिर्फ़ .gov.in साइट या CSC से करें।'],
    },
    {
      id: 'gov.scheme_link', cat: 'govt_scheme', w: 40, all: ['scheme', '@ulink|apk_word|install_app'], not: 'playstore',
      en: ['Scheme registration through an unofficial link', 'Real scheme portals end in .gov.in or .nic.in.'],
      hi: ['ग़ैर-सरकारी लिंक से योजना का रजिस्ट्रेशन', 'असली योजनाओं की वेबसाइट .gov.in या .nic.in पर ख़त्म होती है।'],
    },
    {
      id: 'gov.free_offer', cat: 'govt_scheme', w: 35, all: ['free', 'scheme', '@ulink|forward_chain|link_cta|@mobile|money_req|fee'],
      en: ['"Free" government offer to grab', 'Free laptops, recharges and rations promised in forwards collect your data or money.'],
      hi: ['"मुफ़्त" सरकारी ऑफ़र', 'फ़ॉरवर्ड में मुफ़्त लैपटॉप, रिचार्ज या राशन का वादा आपका डेटा या पैसे लेने के लिए होता है।'],
    },
    {
      id: 'gov.chain', cat: 'govt_scheme', w: 25, all: ['forward_chain'],
      en: ['Asks you to forward it to many groups', 'Forwarding chains spread scam links to your friends and family.'],
      hi: ['कई ग्रुप में भेजने को कहा', 'फ़ॉरवर्ड की चेन से ठगी वाले लिंक आपके दोस्तों और परिवार तक पहुँचते हैं।'],
    },
  ],
};
