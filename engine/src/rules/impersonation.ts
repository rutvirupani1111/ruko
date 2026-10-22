import { r, type RuleModule } from './types';

/** Impersonation: relative with a "new number", boss asking for gift cards, army officer buyer, relative in custody. */
export function impersonation(): RuleModule {
  return {
    cues: {
      new_number: [
        r`(?:this is|it's|its|it is) my new (?:number|no\.?|whatsapp)|my (?:new|other|temporary|second) (?:number|no\.?|phone|whatsapp)|(?:save|note) (?:this|my) (?:new )?number|old number (?:is )?(?:not working|band|off)`,
        r`new number (?:hai|he|h|hai mera)|(?:mera|ye mera|yeh mera) (?:naya|new) number|naya number|नया नंबर`,
        r`(?:phone|mobile) (?:is )?(?:lost|broken|stolen|not working|fell|got damaged|kharab|toot|tut|kho|chori)|(?:फोन|मोबाइल) (?:खराब|टूट|खो|चोरी)`,
      ],
      kin: [r`papa|mummy|mumma|mom|dad|daddy|beta|beti|son|daughter|bhai|bhaiya|didi|uncle|aunty|aunti|chacha|mama|nana|nani|dada|dadi|jiju|पापा|मम्मी|माँ|मां|बेटा|बेटी|भैया|भाई|दीदी|चाचा|मामा|नाना|दादा`],
      urgent_money: [
        r`(?:need|needs|want|require) (?:some )?(?:money|cash|funds|₹|rs\.?|inr|\d)|send (?:me )?(?:₹|rs\.?|inr)? ?\d[\d,]*`,
        r`(?:₹|rs\.?|inr)? ?\d[\d,]*k? (?:bhej|bhejo|bhej do|send kar|transfer kar|gpay|phonepe|paytm|de do|chahiye)|(?:gpay|google pay|phonepe|paytm|upi) (?:kar|karo|kardo|kar do|kr do|me bhej)`,
        r`pay (?:to |on )?this (?:upi|number|account|qr)|(?:paise|paisa|rupaye|pese) (?:chahiye|bhejo|bhej do|de do|transfer)|पैसे (?:चाहिए|भेज|दे दो)|रुपये (?:चाहिए|भेज)`,
      ],
      gift_cards: [r`gift ?cards?|google play (?:cards?|codes?|gift|recharge|vouchers?)|amazon (?:gift|pay) (?:cards?|vouchers?|codes?)|itunes (?:cards?|gift)|apple (?:gift )?cards?|steam (?:cards?|wallet)|vouchers? codes?|redeem codes?|गिफ्ट कार्ड`],
      boss: [r`(?:your )?(?:boss|ceo|md|managing director|director|chairman|manager|principal)|i(?:'m| am) (?:in|at) (?:a )?(?:meeting|conference)|(?:can't|cannot|can not) (?:talk|call|speak)|keep (?:it|this) (?:confidential|between us)|are you (?:free|available)|मीटिंग में`],
      army: [r`army (?:officer|man|personnel|jawan|canteen|cantt|camp)|(?:crpf|bsf|cisf|itbp|military|defence|defense|air ?force|navy) (?:officer|personnel|jawan|man)|(?:i am|i'm|main) (?:in|from) (?:the )?(?:army|military|crpf|bsf)|posted (?:at|in)|आर्मी|फौजी|fauji|फौज`],
      marketplace: [r`olx|quikr|facebook marketplace|marketplace|your (?:ad|listing|advertisement|post|product)|(?:want|like) to buy your|interested in your|buy your (?:\S+ )?(?:sofa|bike|car|fridge|scooty|scooter|item|product|furniture|phone|laptop|bed|ac|tv)|आपका (?:विज्ञापन|सामान)|aapka (?:saman|item)`],
      relative_trouble: [
        r`(?:your )?(?:son|daughter|husband|brother|nephew|beta|beti|bhai|bhatija)(?: \S+){0,3} (?:is |has been |was |got )?(?:arrested|in custody|caught|detained|in police custody|in jail|in an? accident|hospitali[sz]ed|kidnapped)`,
        r`(?:बेटा|बेटी|भाई|पति)(?: \S+){0,3} (?:गिरफ्तार|पकडा|हिरासत|अस्पताल|एक्सीडेंट)|(?:beta|beti|bhai)(?: \S+){0,3} (?:pakda|giraftar|arrest|hirasat|accident)`,
        r`settle (?:the )?(?:case|matter)|(?:case|mamla|maamla) (?:khatam|rafa dafa|settle|band)|मामला (?:रफा दफा|खत्म|सेटल)|rape case|(?:police|thane) (?:mein|me) (?:hai|band)`,
      ],
      verify_tiny: [r`(?:1|one|ek|एक) (?:rupee|rupees|rupaya|rupaye|rs|रुपया|रुपये)(?: \S+){0,2} (?:bhejo|bhejiye|bhej do|send|pay|transfer|भेजिए|भेजें|भेजो)|(?:send|pay|transfer) (?:₹|rs\.?|inr)? ?(?:1|2|5|10) (?:rupee|rupees|rs)?(?: \S+){0,3} (?:to )?(?:verify|check|confirm|test)|(?:1|one|ek) (?:rupee|rupaya|rupaye|rs) (?:bhej|send|verify)|पहले (?:1|एक) रुपया`],
    },
    rules: [
      {
        id: 'imp.new_number_money', cat: 'impersonation', w: 55, all: ['new_number', 'urgent_money|money_req'],
        en: ['"New number" asking for money', 'Scammers pose as family or friends on a new number. Call the person on their old number first.'],
        hi: ['"नए नंबर" से पैसों की माँग', 'ठग नए नंबर से परिवार या दोस्त बनकर बात करते हैं। पहले उनके पुराने नंबर पर फ़ोन करें।'],
      },
      {
        id: 'imp.new_number', cat: 'impersonation', w: 10, all: ['new_number'], not: 'urgent_money|money_req',
        en: ['Says this is a new number', 'If the person then asks for money, verify on their old number.'],
        hi: ['नया नंबर होने की बात', 'अगर बाद में पैसे माँगे जाएं तो पुराने नंबर पर पुष्टि करें।'],
      },
      {
        id: 'imp.kin_urgent_money', cat: 'impersonation', w: 25, all: ['kin', 'urgent_money', 'urgent'],
        en: ['Urgent money request from "family"', 'Confirm with a call before you send anything.'],
        hi: ['"परिवार" से तुरंत पैसों की माँग', 'कुछ भी भेजने से पहले फ़ोन करके पक्का करें।'],
      },
      {
        id: 'imp.gift_cards', cat: 'impersonation', w: 45, all: ['gift_cards', 'buy|money_req|urgent'],
        en: ['Asks you to buy gift cards', 'Bosses, relatives and companies never ask for payment in gift cards or voucher codes.'],
        hi: ['गिफ़्ट कार्ड ख़रीदने को कहा', 'बॉस, रिश्तेदार या कंपनियाँ कभी गिफ़्ट कार्ड या वाउचर कोड में पैसे नहीं माँगते।'],
      },
      {
        id: 'imp.boss', cat: 'impersonation', w: 35, all: ['boss', 'gift_cards|urgent_money|money_req'], near: 400,
        en: ['"Boss" asks for an urgent payment', 'Fake bosses message from new numbers and claim to be in a meeting so you cannot call.'],
        hi: ['"बॉस" ने तुरंत पेमेंट माँगा', 'नकली बॉस नए नंबर से मैसेज करते हैं और मीटिंग में होने का बहाना बनाते हैं ताकि आप फ़ोन न कर सकें।'],
      },
      {
        id: 'imp.army_buyer', cat: 'impersonation', w: 55, all: ['army', 'marketplace|money_req|qr|advance_word|verify_tiny|buy|pin_enter'],
        en: ['"Army officer" buyer or seller', "Fake army officers on OLX send a QR or ask for an advance 'to verify'. It's a well-known scam."],
        hi: ['"आर्मी अफ़सर" ख़रीदार या विक्रेता', "OLX पर नकली आर्मी अफ़सर QR भेजते हैं या 'वेरिफ़िकेशन' के लिए एडवांस माँगते हैं। यह जानी-पहचानी ठगी है।"],
      },
      {
        id: 'imp.relative_in_trouble', cat: 'impersonation', w: 60, all: ['relative_trouble', 'money_req|urgent_money|fee|da_police|da_agency'],
        en: ['Relative "in trouble", pay to settle', 'Callers claiming your child is arrested or hurt want money fast. Call your relative directly.'],
        hi: ['रिश्तेदार "मुसीबत में", पैसे देकर मामला निपटाने को कहा', 'आपका बच्चा पकड़ा गया या घायल है, ऐसा कहने वाले जल्दी पैसे चाहते हैं। सीधे अपने रिश्तेदार को फ़ोन करें।'],
      },
      {
        id: 'imp.marketplace_qr', cat: 'impersonation', w: 45, all: ['marketplace', 'qr|verify_tiny|pin_enter|advance_word'],
        en: ['Buyer sends a QR or asks for a test payment', 'A buyer never needs you to scan a QR or pay ₹1 to send you money.'],
        hi: ['ख़रीदार QR भेज रहा है या टेस्ट पेमेंट माँग रहा है', 'पैसे भेजने के लिए ख़रीदार को आपसे QR स्कैन या ₹1 पेमेंट नहीं करवाना पड़ता।'],
      },
      {
        id: 'imp.verify_tiny', cat: 'impersonation', w: 35, all: ['verify_tiny'],
        en: ['"Send ₹1 to verify"', 'Small test payments are used to get you to enter your PIN on a payment request.'],
        hi: ['"वेरिफ़ाई करने के लिए ₹1 भेजें"', 'छोटे टेस्ट पेमेंट के बहाने आपसे पेमेंट रिक्वेस्ट पर PIN डलवाया जाता है।'],
      },
    ],
  };
}
