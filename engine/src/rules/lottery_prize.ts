import { r, type RuleModule } from './types';

/** Lottery and prize scams: KBC, lucky draws, "you won 25 lakh", processing fees. */
export function lotteryPrize(): RuleModule {
  return {
    cues: {
      won: [
        r`(?:you|u|your (?:mobile |phone |whatsapp )?number|your (?:sim|card)) (?:have |has |are )?(?:won|win|been selected|selected as)`,
        r`(?:lucky|lottery|prize|bumper|jackpot) (?:winner|draw|prize|number|customer|coupon)|congratulations?(?: \S+){0,6} (?:won|winner|selected|lucky|prize|lottery)|winner of|declared (?:as )?(?:the )?winner`,
        r`aap(?:ne)? (?:\S+ )?(?:jeet|jeeta|jeete|jeeti) (?:hai|hain|gaye)|aapka (?:number|mobile number) (?:select|chuna) (?:hua|gaya)`,
        r`आप(?:ने|को)?(?: \S+){0,4} (?:जीता|जीते|जीती|जीत) (?:है|हैं|गए)|विजेता|बधाई हो(?: \S+){0,8} (?:जीत|इनाम|लॉटरी)|आपका (?:नंबर|मोबाइल नंबर) (?:चुना|सेलेक्ट)`,
      ],
      lottery: [r`lottery|lotri|lucky draw|bumper draw|lucky (?:winner|number)|prize money|cash prize|jackpot|इनाम|लॉटरी|लकी ड्रा|inaam|inam|ईनाम`],
      kbc: [r`kbc|k\.b\.c|kaun banega crorepati|कौन बनेगा करोडपति|केबीसी|(?:jio|airtel|whatsapp|vodafone|tata|reliance|amazon|flipkart) (?:lucky draw|lottery)`],
      claim: [
        r`to claim|claim (?:your |the |it |now|karne)|claim karne ke liye|claim (?:kare|karein|karen|karo)`,
        r`(?:prize|lottery|amount|inaam|reward) (?:pane|paane|lene|prapt karne) (?:ke liye|ke lie)|(?:इनाम|राशि|रकम) (?:पाने|लेने|प्राप्त करने) के लिए|दावा`,
      ],
    },
    rules: [
      {
        id: 'lot.won', cat: 'lottery_prize', w: 45, all: ['won', 'lottery|kbc|@bigamt|prize_word'],
        en: ["Says you've won a prize or lottery", "You can't win a lottery you never entered. Prize messages from strangers are scams."],
        hi: ['इनाम या लॉटरी जीतने की बात', 'जिस लॉटरी में आपने हिस्सा ही नहीं लिया, उसे आप जीत नहीं सकते। अनजान लोगों के इनाम वाले मैसेज ठगी होते हैं।'],
      },
      {
        id: 'lot.kbc', cat: 'lottery_prize', w: 55, all: ['kbc'], not: 'awareness',
        en: ['KBC or brand "lucky draw"', 'KBC, Jio, Airtel and WhatsApp do not run lotteries over messages.'],
        hi: ['KBC या किसी ब्रांड का "लकी ड्रा"', 'KBC, Jio, Airtel या WhatsApp मैसेज से कोई लॉटरी नहीं चलाते।'],
      },
      {
        id: 'lot.fee', cat: 'lottery_prize', w: 55, all: ['won|lottery|kbc', 'fee|fee_pay|tax_word|money_req'],
        en: ['Pay a fee to get your prize', "A real prize never asks for 'tax', 'GST' or a 'processing fee' up front."],
        hi: ['इनाम के लिए पहले फ़ीस', "असली इनाम के लिए पहले से 'टैक्स', 'GST' या 'प्रोसेसिंग फ़ीस' नहीं माँगी जाती।"],
      },
      {
        id: 'lot.claim_contact', cat: 'lottery_prize', w: 30, all: ['won|lottery', 'claim', '@mobile|@intl|@ulink|@wa|call_cta|tg_contact|@tglink'],
        en: ['Contact someone to claim', 'Prize "agents" on WhatsApp or personal numbers are always fake.'],
        hi: ['इनाम के लिए किसी से संपर्क करने को कहा', 'WhatsApp या निजी नंबर पर इनाम दिलाने वाले "एजेंट" हमेशा नकली होते हैं।'],
      },
      {
        id: 'lot.big_amount', cat: 'lottery_prize', w: 25, all: ['won|lottery|kbc', '@bigamt'],
        en: ['Huge prize amount', 'Lakhs or crores in prize money are used to cloud your judgement.'],
        hi: ['बहुत बड़ी इनामी रक़म', 'लाखों-करोड़ों के इनाम का लालच सोचने-समझने की ताक़त कम करने के लिए दिया जाता है।'],
      },
    ],
  };
}
