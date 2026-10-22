import { r, type RuleModule } from './types';

/** "Sent by mistake, please return" and fake refunds for cancelled orders. */
export const fakeRefund: RuleModule = {
  cues: {
    mistake: [
      r`by mistake|mistakenly|wrongly (?:sent|transferred|credited|paid)|accidentally (?:sent|transferred|paid|credited)|(?:sent|transferred|paid|credited) (?:it )?(?:to )?(?:the |a )?wrong (?:number|account|person|upi)`,
      r`galti se|galati se|galthi se|galti me|bhool se|गलती से|भूल से|गलत नंबर पर|गलत खाते में`,
    ],
    return_req: [
      r`(?:please |pls |plz |kindly )?(?:return|send (?:it |them |the money |that |my money )?back|refund (?:it|me|my money|the amount)|transfer (?:it |the amount |the money )?back|give (?:it )?back|reverse (?:it|the (?:payment|amount|transaction)))`,
      r`(?:wapas|vapas) (?:bhej|kar|de|transfer|lauta)|lauta (?:do|dijiye|dena)|वापस (?:भेज|कर|दे|लौटा)|लौटा (?:दें|दीजिए|दो)`,
    ],
    credited_claim: [
      r`(?:rs\.?|₹|inr) ?\d[\d,]*(?:\.\d+)? (?:has been |have been |is |was )?(?:credited|received|transferred|sent)`,
      r`(?:credited|sent|transferred) (?:to |in |into )?your (?:account|a/c|number|upi|paytm|phonepe|gpay)`,
      r`aapke (?:account|khate|number) (?:me|mein|par|pe) (?:\S+ )?(?:aa gaye|bhej diye|transfer ho gaye|credit ho gaye|chale gaye|daal diye)`,
      r`आपके (?:खाते|अकाउंट|नंबर) (?:में|पर)(?: \S+){0,3} (?:भेज दिए|आ गए|चले गए|ट्रांसफर)`,
    ],
    refund_claim: [
      r`(?:to |for )?(?:get|receive|claim|process|initiate|avail) (?:your |the |ur )?refund|refund (?:process|form|link|request|claim|approval|team|department|desk)`,
      r`refund (?:is |has been )?(?:pending|on hold|initiated|approved)(?: \S+){0,6} (?:click|call|share|fill|download|verify|contact|update)`,
      r`refund (?:lene|pane|paane|ke liye|lena)|रिफंड (?:पाने|लेने|के लिए)`,
    ],
    cancelled: [r`(?:cancel+ed|returned|failed) (?:order|item|product|booking|ticket|transaction|payment)|order (?:cancel|cancelled|canceled)|ऑर्डर (?:कैंसिल|रद्द)`],
    emotional: [r`hospital|operation|medicine|surgery|fees? (?:of|for) my|exam fees?|school fees?|accident|emergency|bimaa?r|अस्पताल|बीमार|इलाज`],
  },
  rules: [
    {
      id: 'refund.mistake_return', cat: 'fake_refund', w: 55, all: ['mistake', 'return_req'],
      en: ['"Sent to you by mistake, please return"', 'Scammers send a fake credit SMS, then beg you to return money. Check your bank app: the money usually never arrived.'],
      hi: ['"गलती से भेज दिए, वापस कर दो"', 'ठग पहले नकली क्रेडिट SMS भेजते हैं, फिर पैसे लौटाने की विनती करते हैं। बैंक ऐप देखें, पैसे अक्सर आए ही नहीं होते।'],
    },
    {
      id: 'refund.credited_mistake', cat: 'fake_refund', w: 35, all: ['credited_claim', 'mistake'],
      en: ['Claims money landed in your account by mistake', 'Check your actual balance in the bank app, not the message.'],
      hi: ['ग़लती से आपके खाते में पैसे आने का दावा', 'मैसेज नहीं, बैंक ऐप में असली बैलेंस देखें।'],
    },
    {
      id: 'refund.claim_action', cat: 'fake_refund', w: 45, all: ['refund_claim', '@ulink|@mobile|install_app|credential_req|pin_enter|remote_app|apk_word|collect|qr'],
      en: ['Asks you to act to "get your refund"', 'Real refunds reach your account automatically. You never click links, call numbers or install apps for them.'],
      hi: ['"रिफ़ंड पाने" के लिए कुछ करने को कहा', 'असली रिफ़ंड अपने आप खाते में आता है। इसके लिए लिंक, नंबर या ऐप की ज़रूरत नहीं होती।'],
    },
    {
      id: 'refund.cancelled_order', cat: 'fake_refund', w: 35, all: ['cancelled', 'refund_word|refund_claim', 'call_cta|@mobile|@ulink|install_app|remote_app'],
      en: ['Refund for a cancelled order via call or link', 'Shopping sites refund to the original payment method on their own.'],
      hi: ['कैंसिल ऑर्डर का रिफ़ंड कॉल या लिंक से', 'शॉपिंग साइटें रिफ़ंड अपने आप उसी तरीक़े से लौटाती हैं जिससे पेमेंट हुआ था।'],
    },
    {
      id: 'refund.emotional', cat: 'fake_refund', w: 20, all: ['mistake', 'emotional|urgent'],
      en: ['Emotional pressure to send money back', 'Stories about hospital bills or exam fees are used to rush you.'],
      hi: ['पैसे लौटाने के लिए भावनात्मक दबाव', 'अस्पताल या फ़ीस की कहानी आपको जल्दबाज़ी में डालने के लिए होती है।'],
    },
  ],
};
