import { r, type RuleModule } from './types';

/** Romance and gift scams: online "partner" abroad, gift stuck at customs, money for flights. */
export function romance(): RuleModule {
  return {
    cues: {
      love: [
        r`i love you|love you (?:so much|baby|dear|jaan)|my love|(?:my )?(?:darling|sweetheart|honey|baby|dear|jaan|jaanu|sona)|marry (?:you|me)|soul ?mate|fell in love`,
        r`(?:तुमसे|आपसे) (?:बहुत )?प्यार|शादी (?:करना|करूंगी|करूंगा)|pyaa?r (?:karti|karta|karne)|shaadi (?:karna|karungi|karunga)|तुम्हारी याद`,
      ],
      foreign: [
        r`(?:from|in|living in|based in) (?:the )?(?:uk|usa|us|u\.s\.a?|london|canada|australia|dubai|germany|america|abroad|overseas|england|scotland|syria|afghanistan|turkey|france|italy)`,
        r`(?:doctor|nurse|engineer|soldier|army|peacekeeping|oil rig|ship|navy|pilot|businessman|businesswoman|widow|widower)(?: \S+){0,3} (?:in|from|at) (?:the )?(?:uk|usa|us|london|canada|syria|dubai|abroad|overseas)|विदेश|videsh|foreigner`,
      ],
      gift_parcel: [
        r`(?:sent|sending|shipped|send) (?:you )?(?:a |an |the )?(?:special |expensive |big )?(?:gift|parcel|package|box)|gift (?:parcel|box|package)|(?:with|for) your gift|gift for you`,
        r`(?:dollars?|pounds?|euros?|gold|jewel(?:le)?ry|diamond|iphone|watch|cash)(?: \S+){0,4} (?:in|inside) (?:the )?(?:parcel|package|box|gift)|गिफ्ट|तोहफा|tohfa`,
      ],
      clearance: [r`customs|airport|clearance|diplomatic|immigration|anti[- ]?money|delivery agent|courier (?:company|agent)|कस्टम|एयरपोर्ट|हवाई अड्डे`],
      love_money: [
        r`(?:flight|ticket|visa|customs|clearance|hospital|medical|travel) (?:fee|charges?|money|ticket|bill|expenses|cost)|need (?:some )?money|send (?:me )?(?:some )?money|pay (?:the )?(?:fee|charges|clearance)`,
        r`paise (?:bhej|chahiye|de do)|पैसे (?:भेज|चाहिए)`,
      ],
      online_met: [r`instagram|facebook|dating|matrimony|shaadi\.com|jeevansathi|tinder|bumble|your profile|online`],
      // "milne india aa rahi hu", "coming to India to meet you", "मिलने भारत आ रही हूं".
      visit: [
        r`(?:coming|flying|travel(?:l)?ing|arriving) to (?:india|meet you|see you)|(?:landed|arrived) in india`,
        r`milne(?: \S+)? (?:aa rahi|aa raha|aayi|aaya|aaungi|aaunga|aa)|(?:india|bharat) (?:aa rahi|aa raha|aayi|aaya|aaungi|aaunga|pahunch(?:i|a|e)?)`,
        r`मिलने(?: \S+)? (?:आ रही|आ रहा|आई|आया|आऊंगी|आऊंगा)|भारत (?:आ रही|आ रहा|आई|आया|पहुंच(?:ी|ा|े)?)`,
      ],
    },
    rules: [
      {
        id: 'rom.visit_stuck', cat: 'romance', w: 40, all: ['visit', 'clearance', 'money_req|love_money|urgent_money|fee|fee_pay|@amount'],
        en: ['"Coming to meet you" but stuck at the airport', 'A visitor held at customs who needs your money to get out is a classic romance-scam script.'],
        hi: ['"मिलने आ रहे थे" पर एयरपोर्ट पर अटके', 'कस्टम में रोका गया "मेहमान" जिसे छूटने के लिए आपके पैसे चाहिए, रोमांस ठगी की पुरानी कहानी है।'],
      },
      {
        id: 'rom.gift_customs', cat: 'romance', w: 55, all: ['gift_parcel', 'clearance', 'money_req|fee|fee_pay|love_money|small_fee|@amount'],
        en: ['Gift from abroad stuck at customs', 'The "gift" does not exist. The customs or courier "agent" is part of the same scam.'],
        hi: ['विदेश से आया गिफ़्ट कस्टम में अटका', 'ऐसा कोई "गिफ़्ट" होता ही नहीं। कस्टम या कूरियर "एजेंट" भी उसी ठगी का हिस्सा है।'],
      },
      {
        id: 'rom.love_money', cat: 'romance', w: 55, all: ['love', 'love_money|urgent_money|money_req', 'foreign|gift_parcel|clearance|online_met'],
        en: ['Online love interest asks for money', "Romance scammers build trust for weeks, then need money for a ticket, visa or emergency. Don't send it."],
        hi: ['ऑनलाइन मिले "प्यार" ने पैसे माँगे', 'ऐसे ठग हफ़्तों भरोसा जीतते हैं, फिर टिकट, वीज़ा या किसी मुसीबत के नाम पर पैसे माँगते हैं। पैसे न भेजें।'],
      },
      {
        id: 'rom.foreign_love', cat: 'romance', w: 15, all: ['love', 'foreign'],
        en: ['Romance with someone abroad', 'Be careful with people you only know online, especially if they say they live abroad.'],
        hi: ['विदेश में रहने वाले से प्यार की बातें', 'जिन्हें आप सिर्फ़ ऑनलाइन जानते हैं, ख़ासकर जो विदेश में रहने का दावा करें, उनसे सावधान रहें।'],
      },
    ],
  };
}
