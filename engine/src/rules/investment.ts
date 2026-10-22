import { r, type RuleModule } from './types';

/** Investment and trading scams: guaranteed returns, VIP stock-tip groups, fake IPO allotments, crypto. */
export function investment(): RuleModule {
  return {
    cues: {
      guaranteed: [
        r`guarantee(?:d)? (?:returns?|profits?|income|gains?|payout|earnings?|money)|(?:returns?|profits?|income|gains?) (?:are |is )?guarantee(?:d)?`,
        r`\d+(?:\.\d+)? ?% (?:returns?|profit|gains?|interest|growth)?(?: \S+){0,2} (?:daily|weekly|monthly|per (?:day|week|month)|every (?:day|week|month)|in \d+ (?:days|weeks|months)|guaranteed)`,
        r`double (?:your )?(?:money|investment|amount|capital|paisa|paise)|(?:money|investment|amount|paisa|paise|capital) (?:will )?(?:double|triple)|triple (?:your )?(?:money|investment)|\d+x (?:returns?|profit)`,
        r`risk[- ]?free (?:returns?|investment|profit|trading|income)|no risk|zero risk|(?:100|hundred) ?% (?:safe|guaranteed|profit|returns?)|assured (?:returns?|profits?|income)|fixed (?:daily |weekly |monthly )?(?:returns?|profits?|income)`,
        r`(?:paisa|paise|amount) double|double (?:munafa|paisa|paise)|guaranteed (?:munafa|return|profit)|pakka (?:munafa|profit|return)|(?:munafa|profit|returns?) pakka|(?:har din|roz|rozana|daily|every day|har mahine|monthly) \d+(?:-\d+)? ?%|\d{3,4} ?% (?:returns?|profit|gains?)`,
        r`गारंटी(?:ड)? (?:रिटर्न|मुनाफा|लाभ)|पैसा (?:डबल|दोगुना)|पैसे (?:डबल|दोगुने)|दोगुना (?:मुनाफा|पैसा)|पक्का मुनाफा|पूरी तरह सुरक्षित|बिना जोखिम|हर (?:दिन|महीने) \d+ ?%`,
      ],
      stock_tips: [
        r`stock (?:tips|market tips|recommendations|calls)|share (?:market )?tips|(?:vip|premium|exclusive|private) (?:group|club|channel|members?|stock|trading|signals?)|intraday (?:tips|calls)`,
        r`(?:trading|option|options|f&o|futures|nifty|bank ?nifty|commodity|forex) (?:tips|signals|calls)|multi ?bagger|upper circuit|operator (?:stock|tips|game)|insider (?:tip|tips|information|news)|block deals?`,
        r`institutional (?:account|trading|quota|investors? account)|ipo allot(?:ment|ted)? (?:guarantee(?:d)?|confirmed|assured|sure|100)|(?:guaranteed|assured|confirmed|sure) ipo allot(?:ment)?|sure ?shot|jackpot (?:stock|call|tip)`,
        r`शेयर (?:बाजार|मार्केट) (?:टिप्स|में निवेश)|स्टॉक टिप्स`,
      ],
      crypto: [r`crypto(?:currency)?|bitcoin|usdt|binance|ethereum|forex trading|trading platform|mining (?:pool|platform|machine)|क्रिप्टो|बिटकॉइन`],
      sebi_claim: [r`sebi[- ]?(?:registered|approved|certified|authori[sz]ed|reg\.?)|registered (?:with|by|under) sebi|sebi (?:reg(?:istration)?|license) (?:no|number)|सेबी (?:रजिस्टर्ड|पंजीकृत)`],
      invest: [r`invest(?:ment|ing|ed|or)?s?|nivesh|निवेश|deposit|trading|portfolio`],
      invest_app: [r`(?:download|install|register on|join|sign ?up on) (?:our |the )?(?:trading |investment )?(?:app|platform|website)|our (?:trading|investment) (?:app|platform)`],
      group_join: [r`(?:join|add you to|added to) (?:our |the |this )?(?:\S+ )?(?:whatsapp |telegram )?(?:group|channel|community)|whatsapp group|telegram channel|ग्रुप (?:में|ज्वाइन)|group (?:join|me add)`],
      // "10,000 रुपये लगाइए और 20,000 रुपये पाइए" / "10000 lagao aur 20000 pao": put in a sum, get a bigger one.
      put_get: [
        r`(?:₹ ?)?\d[\d,]* (?:रुपये |रुपए )?(?:लगाइए|लगाइये|लगाएं|लगाओ|निवेश करें)(?: और| तो)? (?:₹ ?)?\d[\d,]* (?:रुपये |रुपए )?(?:पाइए|पाइये|पाएं|पाओ|मिलेंगे|मिलेगा)`,
        r`(?:₹ ?|rs\.? ?)?\d[\d,]*k? (?:rs |rupaye |rupees )?(?:lagao|lagaiye|lagayein|lagaye|laga do|invest karo|invest karein|invest kro)(?: aur| to)? (?:₹ ?|rs\.? ?)?\d[\d,]*k? (?:rs |rupaye |rupees )?(?:paao|pao|paiye|payein|paye|milenge|milega)`,
      ],
    },
    rules: [
      {
        id: 'inv.put_get', cat: 'investment', w: 40, all: ['put_get'],
        en: ['"Put in this much, get that much back"', 'Turning a sum into a bigger one in days is Ponzi bait. Early payouts come from newer victims’ money.'],
        hi: ['"इतना लगाइए, उतना पाइए" वाला ऑफ़र', 'कुछ दिनों में रकम बढ़ाकर लौटाने का वादा पोंज़ी स्कीम का चारा है। शुरुआती मुनाफ़ा नए लोगों के पैसे से दिया जाता है।'],
      },
      {
        id: 'inv.guaranteed', cat: 'investment', w: 45, all: ['guaranteed'], x: 'inv_g',
        en: ['Promises guaranteed or double returns', 'No real investment can guarantee profits. This is the hook of every investment scam.'],
        hi: ['पक्के या दोगुने मुनाफ़े का वादा', 'कोई भी असली निवेश पक्के मुनाफ़े की गारंटी नहीं दे सकता। हर निवेश ठगी यहीं से शुरू होती है।'],
      },
      {
        id: 'inv.guaranteed_invest', cat: 'investment', w: 55, all: ['guaranteed', 'invest|crypto|stock_tips'], x: 'inv_g',
        en: ['Guaranteed returns on an investment', 'Promised profits plus a request to invest is the classic Ponzi pattern.'],
        hi: ['निवेश पर पक्के रिटर्न का वादा', 'पक्का मुनाफ़ा और निवेश की माँग, पोंज़ी स्कीम का पुराना तरीक़ा है।'],
      },
      {
        id: 'inv.tips_group', cat: 'investment', w: 45, all: ['stock_tips', 'group_join|tg_contact|@tglink'], x: 'inv_t',
        en: ['VIP stock-tips group', 'Fake trading groups show screenshots of profits, then move you to a fake app where you can never withdraw.'],
        hi: ['VIP स्टॉक टिप्स ग्रुप', 'नकली ट्रेडिंग ग्रुप मुनाफ़े के स्क्रीनशॉट दिखाते हैं, फिर ऐसे नकली ऐप पर ले जाते हैं जहाँ से पैसा निकलता ही नहीं।'],
      },
      {
        id: 'inv.tips', cat: 'investment', w: 30, all: ['stock_tips'], x: 'inv_t',
        en: ['Insider or guaranteed stock tips', 'Tips about IPO allotment, upper circuits or insider news are bait.'],
        hi: ['अंदर की या पक्की स्टॉक टिप्स', 'IPO अलॉटमेंट, अपर सर्किट या अंदर की ख़बर वाली टिप्स सिर्फ़ चारा हैं।'],
      },
      {
        id: 'inv.crypto', cat: 'investment', w: 40, all: ['crypto', 'guaranteed|earn|profit_word'],
        en: ['Crypto or trading profits promised', 'Crypto "platforms" promising daily profits are a leading cause of investment fraud.'],
        hi: ['क्रिप्टो या ट्रेडिंग से मुनाफ़े का वादा', 'रोज़ मुनाफ़े का वादा करने वाले क्रिप्टो "प्लेटफ़ॉर्म" निवेश ठगी की सबसे बड़ी वजहों में हैं।'],
      },
      {
        id: 'inv.sebi_claim', cat: 'investment', w: 30, all: ['sebi_claim', 'stock_tips|guaranteed|group_join|invest_app|crypto'],
        en: ['Claims to be SEBI registered', 'Anyone can write "SEBI registered". Check the name yourself on sebi.gov.in.'],
        hi: ['SEBI रजिस्टर्ड होने का दावा', '"SEBI रजिस्टर्ड" कोई भी लिख सकता है। नाम ख़ुद sebi.gov.in पर जाँचें।'],
      },
      {
        id: 'inv.app', cat: 'investment', w: 25, all: ['invest_app', 'invest|crypto|stock_tips|guaranteed'],
        en: ['Asks you to invest through their own app', 'Invest only through registered brokers you already know, not an app sent in a chat.'],
        hi: ['उनके अपने ऐप से निवेश करने को कहा', 'सिर्फ़ जाने-पहचाने रजिस्टर्ड ब्रोकर से निवेश करें, चैट में भेजे गए ऐप से नहीं।'],
      },
    ],
  };
}
