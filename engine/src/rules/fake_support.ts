import { r, type RuleModule } from './types';

/** Fake customer care: helpline numbers on personal mobiles, "call this number for refund". */
export function fakeSupport(): RuleModule {
  return {
    cues: {
      care: [
        r`customer (?:care|support|service|helpline)|helpline|help ?desk|support (?:team|executive|number|desk|centre|center)|care (?:number|no\.?|centre|center|executive)|toll[- ]?free(?: number| no)?|complaint (?:number|cell|desk)`,
        r`कस्टमर केयर|ग्राहक सेवा|हेल्पलाइन|सहायता केंद्र`,
      ],
      care_claim: [
        r`(?:customer care|helpline|support|care) (?:number|no\.?)(?: is)?|for (?:any )?(?:refund|complaint|help|support|query|issue|problem)s?(?: \S+){0,3} (?:call|contact|whatsapp|dial)`,
        // Reversed order: "contact <brand> support at 98xxxxxxxx for an instant refund".
        r`(?:call|contact|whatsapp|dial)(?: \S+){0,6} for (?:an? |your )?(?:instant |quick |immediate |full )?(?:refunds?|cashback)`,
        r`(?:refund|complaint|cashback|kyc|claim) (?:ke liye|ke lie|keliye)(?: \S+){0,3} (?:call|contact|sampark)|(?:रिफंड|शिकायत|कैशबैक) (?:के लिए|हेतु)(?: \S+){0,3} (?:कॉल|संपर्क)`,
      ],
    },
    rules: [
      {
        id: 'support.mobile_care', cat: 'fake_support', w: 45, all: ['care', '@mobile'],
        en: ['Customer care on a personal mobile number', 'Companies publish toll-free or landline numbers on their official site. A 10-digit mobile "helpline" is a scammer.'],
        hi: ['निजी मोबाइल नंबर पर "कस्टमर केयर"', 'कंपनियाँ आधिकारिक वेबसाइट पर टोल-फ़्री या लैंडलाइन नंबर देती हैं। 10 अंकों वाला मोबाइल "हेल्पलाइन" ठग का होता है।'],
      },
      {
        id: 'support.call_for_refund', cat: 'fake_support', w: 40, all: ['care_claim', '@mobile|@intl'], x: 'support_refund',
        en: ['Call a number to get a refund or fix a complaint', 'Fake support agents ask for remote access, OTPs or a "small payment" to process refunds.'],
        hi: ['रिफ़ंड या शिकायत के लिए किसी नंबर पर कॉल', 'नकली सपोर्ट वाले रिफ़ंड के नाम पर रिमोट एक्सेस, OTP या "छोटा पेमेंट" माँगते हैं।'],
      },
      {
        id: 'support.refund_call', cat: 'fake_support', w: 35, all: ['refund_word|reward_word|complaint_word', 'call_cta', '@mobile'], x: 'support_refund',
        en: ['Refund through a phone call', 'Refunds are processed in the app or website, not over calls to mobile numbers.'],
        hi: ['फ़ोन कॉल से रिफ़ंड', 'रिफ़ंड ऐप या वेबसाइट से होते हैं, मोबाइल नंबर पर कॉल से नहीं।'],
      },
    ],
  };
}
