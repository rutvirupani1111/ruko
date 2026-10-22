/**
 * Shared vocabulary (cues used by many categories), generic red flags and
 * reassuring signals. Patterns run over normalised text: lowercase, nukta
 * removed (ज़ → ज), chandrabindu folded (ँ → ं), digits in ASCII.
 */
import { G3, r, type RuleModule } from './types';

export const shared: RuleModule = {
  cues: {
    urgent: [
      r`immediately|immediate action|urgent(?:ly)?|asap|right away|without (?:any )?delay|at the earliest|act now`,
      r`within (?:the next )?(?:\d{1,2}|one|two|few|twenty[- ]four) ?(?:hours?|hrs?|minutes?|mins?)`,
      r`today itself|by today|before (?:midnight|tonight|end of (?:the )?day|eod)|(?:last|final) (?:chance|reminder|warning|notice)`,
      r`turr?ant|fauran|foran|abhi ke abhi|isi waqt|aaj hi|jald(?:i|ee) se jald(?:i|ee)`,
      r`\d{1,2} (?:ghante|ghanto|ghanton|minute|mint) (?:me|mein|mai|ke andar|ke bhitar)`,
      r`तुरंत|तुरन्त|फौरन|आज ही|जल्द से जल्द|\d{1,2} घंटे (?:में|के अंदर|के भीतर)|अंतिम (?:चेतावनी|मौका|सूचना)|आखिरी (?:मौका|चेतावनी)`,
    ],
    threat: [r`or else|failing which|warna|varna|vrna|nahi to|nahin to|nhi to|वरना|नहीं तो|अन्यथा`],
    secrecy: [
      r`(?:do not|don't|dont|never) (?:tell|inform|share this with|disclose (?:this|it) to|discuss (?:this|it) with) (?:anyone|anybody|your family|family|anyone else|others|your (?:bank|relatives|friends|parents|wife|husband))`,
      r`keep (?:this|it) (?:confidential|secret|between us|private)|confidential (?:matter|case|investigation)|(?:national|official) secrets? act`,
      r`kisi ko (?:bhi )?(?:mat|na|nahi) (?:batana|batao|bataye|bataiye|btana|btao)|ghar (?:walon|valo|walo|wale|valon) ko (?:mat|na) (?:batana|batao)|ye baat (?:kisi|kisiko)`,
      r`किसी को (?:भी )?(?:मत|न|ना) (?:बताएं|बताना|बताइए|बताओ)|घर वालों को (?:मत|न) बताना|गोपनीय (?:मामला|जांच)`,
    ],
    link_cta: [
      r`click (?:on )?(?:the |this |below |given |above )?(?:link|here|url|button)`,
      r`tap (?:on )?(?:the |this |below )?(?:link|here)|(?:visit|open|use) (?:the |this |below |given )?(?:link|url)`,
      r`link (?:par|pe|pr) (?:click|clik|tap)|niche (?:diye|di) (?:gaye |gayi |hue )?link|is link (?:se|par|pe|ko)`,
      r`लिंक पर (?:क्लिक|टैप)|नीचे दिए (?:गए )?लिंक|इस लिंक (?:से|पर|को)|लिंक खोलें`,
    ],
    call_cta: [
      r`call (?:us |me |our \S+ |the \S+ )?(?:on|at|now|immediately|this number|the number|back)`,
      r`(?:contact|reach|dial|ring|whatsapp) (?:us |me |our \S+ |the \S+ )?(?:on|at|immediately|now)`,
      r`(?:call|contact) (?:karein|karen|kare|karo|kijiye|kariye|kr|kar)|(?:is|iss|niche diye|diye gaye) (?:number|no\.?|nambar) (?:par|pe|pr)`,
      r`इस नंबर पर|नंबर पर (?:कॉल|फोन|संपर्क)|(?:कॉल|फोन|संपर्क) करें`,
    ],
    press: [r`press (?:1|one|9|nine|0|zero|2|two)|dial (?:1|9)|(?:1|9|ek|nau) (?:dabaye|dabaiye|dabayen|dabao|press kare|press karein|press karo)|(?:1|9|एक|नौ) (?:दबाएं|दबाइए|दबाएँ)`],
    money_req: [
      r`(?:pay|send|transfer|deposit) (?:me |us )?(?:the )?(?:amount|money|payment|funds|rs\.?|inr|₹)`,
      r`(?:pay|send|transfer|deposit) (?:₹|rs\.? ?|inr ?)?\d`,
      r`paise? (?:bhej|bhejo|bhejiye|bhejein|bhej do|transfer kar|jama kar|de do|dedo|dijiye)`,
      r`(?:₹ ?|rs\.? ?)?\d[\d,]* (?:bhej|bhejo|bhejiye|bhej do|transfer kar(?:o|ein|de|do)?|jama kar(?:o|ein|aye)?)`,
      r`\d[\d,]* (?:rs|rupaye|rupees|rupay|₹) (?:bhej|bhejo|bhejiye|bhej do|jama kar(?:o|ein)?|de do|transfer kar(?:o|ein|do)?)`,
      r`पैसे (?:भेजें|भेजो|भेज दो|भेजिए|जमा करें|ट्रांसफर करें)|(?:राशि|रकम|रुपये) (?:भेजें|जमा करें|भेज दें|ट्रांसफर करें)|भुगतान करें`,
    ],
    fee: [
      r`(?:processing|registration|verification|activation|clearance|handling|service|file|insurance|gst|tds|delivery|courier|shipping|redelivery|customs|security|joining|application|release|transfer|unlock(?:ing)?|withdrawal) (?:fee|fees|charge|charges|amount|deposit)`,
      r`fee of|fees? (?:of )?(?:₹|rs|inr)|charges? of (?:₹|rs|inr)`,
      r`शुल्क|फीस|प्रोसेसिंग चार्ज|रजिस्ट्रेशन (?:फीस|चार्ज)`,
    ],
    fee_pay: [
      r`pay (?:the |a |rs\.? ?\d+ |₹ ?\d+ )?(?:processing|file|insurance|gst|registration|verification|documentation|service|tax|tds) (?:fee|fees|charges?|amount)`,
      r`(?:processing|file|insurance|gst|registration|verification|documentation|tds) (?:fee|fees|charges?)(?: of)? (?:₹|rs\.?|inr) ?\d[\d,]*`,
      r`(?:fee|fees|charges?) (?:pay|bhej|jama) (?:karo|karein|kare|karna|kariye)|शुल्क (?:जमा|भुगतान) करें`,
    ],
    account: [r`(?:bank )?(?:account|a/c|acct|accounts)|khata|khaata|खाता|अकाउंट|एकाउंट`],
    bank: [r`banks?|banking|बैंक|sbi|hdfc|icici|axis|kotak|pnb|canara|yes bank|idfc|indusind|bank of baroda|union bank|paytm|phonepe|gpay|google pay|net ?banking|yono`],
    card: [r`(?:credit|debit|atm) cards?|card (?:number|details|no)|कार्ड`],
    verify: [r`verif(?:y|ication|ied)|validate|re-?activate|activate|सत्यापन|सत्यापित|वेरिफाई|वेरिफिकेशन`],
    block_threat: [
      r`(?:account|a/c|acct|card|yono|net ?banking|wallet|paytm|phonepe|gpay|upi|services?|debit card|credit card|khata|id)${G3}(?:will be|shall be|is going to be|would be|to be|will get|gets?|is being|has been|is|are) (?:permanently |temporarily |immediately |soon )?(?:blocked|block|suspended|deactivated|closed|frozen|freezed|disabled|terminated|locked|barred|on hold|put on hold|restricted)`,
      r`(?:blocked|suspended|deactivated|closed|frozen) (?:today|tonight|within|in \d|shortly|soon)`,
      r`(?:account|khata|a/c|card|yono)${G3}(?:band|bandh|block|suspend|freeze|deactivate|deactive)(?: \S+)? (?:ho|kar) (?:jayega|jaega|jaayega|jayegi|jaegi|diya jayega|dia jayega|di jayegi|denge|dega|diya jaega)`,
      r`(?:खाता|अकाउंट|कार्ड)(?: \S+){0,3} (?:बंद|ब्लॉक|निलंबित|फ्रीज)(?: \S+){0,2} (?:हो|कर) (?:जाएगा|जायेगा|जाएगी|दिया जाएगा|दी जाएगी|देंगे)`,
    ],
    block_word: [r`block(?:ed)?|suspend(?:ed)?|deactivat(?:e|ed)|band|bandh|बंद|ब्लॉक|disconnect(?:ed)?`],
    refund_word: [r`refunds?|refunded|रिफंड|reimburse(?:ment)?`],
    reward_word: [r`cash ?back|rewards?|bonus|reward points?|कैशबैक|रिवॉर्ड|इनाम`],
    prize_word: [r`prize|lottery|jackpot|lucky draw|winner|cash prize|gold coin|iphone|car|bike|scooty|इनाम|लॉटरी|inaam|inam|गाड़ी|गाडी`],
    money_word: [r`money|payment|paise|paisa|amount|funds|rupees|₹|rs|पैसे|पैसा|रुपये|राशि|रकम`],
    bill_word: [r`bill|electricity|bijli|बिल|बिजली|recharge|challan`],
    support_word: [r`support|helpline|customer care|help ?desk|complaint|कस्टमर केयर|शिकायत`],
    complaint_word: [r`complaint|complain|grievance|शिकायत`],
    buy: [r`buy|purchase|get me|scratch|kharid|khareed|खरीद|send (?:me )?(?:the )?codes?|codes? (?:bhej|send|share)`],
    file_word: [r`file|download|open (?:it|this|the file)|डाउनलोड|फाइल`],
    tax_word: [r`tax|tds|gst|टैक्स`],
    profit_word: [r`profits?|returns?|munafa|मुनाफा|लाभ|earn|kamai|gains?`],
    commission_word: [r`commission|bonus|rewards?|paid|payment|salary|kamai|income|earn|कमीशन|पेमेंट|पैसे मिलेंगे`],
    job_word: [r`jobs?|work|kaam|naukri|naukari|नौकरी|काम|vacanc(?:y|ies)|income|earning|tasks?|salary`],
    advance_word: [r`advance|token (?:amount|money)|pehle (?:paise|payment|pay)|पहले पैसे|army (?:account|canteen|payment|transfer)`],
    credential_req: {
      neg: true,
      p: [
        r`(?:share|send|enter|provide|give|tell|confirm|fill|submit) (?:me |us )?(?:your |the |ur )?(?:full )?(?:card (?:number|no|details)|(?:debit|credit|atm) card (?:number|no|details|pin)|cvv|cvc|expiry date|atm pin|upi pin|mpin|m-pin|net ?banking (?:id|password|details|credentials|user ?id)|login (?:id|details|credentials|password)|password|bank (?:account )?details|account (?:number|details)|aadhaa?r (?:number|otp))`,
        r`(?:card number|cvv|atm pin|password|mpin)(?: no| details)? (?:bata|batao|bataiye|bata do|bhejo|bhej do|share karo|share kare|dijiye|de do)`,
        r`(?:कार्ड नंबर|सीवीवी|एटीएम पिन|पिन नंबर|पासवर्ड|खाता संख्या)(?: \S+)? (?:बताएं|बताइए|बताओ|भेजें|दें|शेयर करें)`,
      ],
    },
    awareness: [
      r`beware(?: of)?|be aware|be alert|be careful|stay alert|stay safe|fraudsters?|cyber ?criminals?|scamsters?|(?:do not|don't|never) fall (?:for|prey)`,
      r`never asks? (?:for |you )?(?:your )?(?:otp|pin|password|cvv|card|details)|will never (?:ask|call|request|send)|never (?:calls?|asks?|requests?|arrests?) (?:you|customers|for|on|over|anyone)`,
      r`no (?:government |police |real )?(?:agency|officer|bank|police) (?:will )?(?:ever )?(?:arrests?|asks?|calls?)|(?:is|are) not (?:real|legal|genuine)|(?:share|forward) (?:this )?with your (?:parents|family|friends)`,
      r`report (?:it |such \S+ |fraud \S+ |suspicious \S+ )?(?:at|on|to) (?:1930|cybercrime|chakshu|sanchar ?saathi)|(?:it'?s|is|are|was) (?:a )?(?:scam|fraud|fake)|scam alert|rbi kehta hai`,
      r`सावधान|सतर्क रहें|धोखेबाज|ठगों|ठगी (?:से|का)|(?:कभी|कभी भी) (?:ओटीपी|पिन|पासवर्ड)(?: \S+){0,3} (?:नहीं|न) (?:मांग|पूछ)|saavdhan|savdhan`,
    ],
    dont_share: [
      r`(?:do not|don't|dont|never|please do not|pls do not|please don't|not to) (?:share|disclose|reveal|give)${G3}(?:otp|o\.t\.p|pin|password|cvv|code|card details|details)`,
      r`(?:otp|pin|code|password)(?: \S+){0,5} (?:do not|don't|never|not to) (?:share|disclose|reveal)`,
      r`(?:otp|pin|code)(?: \S+){0,3} (?:is )?(?:confidential|secret|for your use only)|never asks? (?:for )?(?:your )?(?:otp|pin|password|cvv)`,
      r`kisi(?: ke saath| se| ko)? (?:bhi )?(?:share|shair|bata) (?:na|mat|nahi) (?:karein|karen|kare|karo|na)|(?:otp|pin)(?: \S+){0,3} (?:share|bata) (?:mat|na) (?:karein|karen|kare|karo|na)`,
      r`किसी (?:के साथ|को|से) (?:भी )?(?:साझा|शेयर) (?:न|ना|मत) (?:करें|करे|करो)|(?:साझा|शेयर) न करें|(?:ओटीपी|पिन|पासवर्ड)(?: \S+){0,3} (?:किसी को )?(?:न|मत|ना) (?:बताएं|बताएँ|दें)|गोपनीय रखें|बैंक कभी (?:भी )?(?:ओटीपी|पिन)`,
    ],
    txn_verb: [r`debited|credited|spent|withdrawn|deducted|transferred|received|sent|paid|txn|transaction|purchase|डेबिट|क्रेडिट|जमा|निकाले`],
    txn_obj: { free: true, p: [r`\ba/c\b|\bacct\b|\baccount\b|\bcard (?:ending|no|xx)|\bxx+\d{2,}|\bx+\d{3,}|\bwallet\b|\bupi\b|खाता|कार्ड`] },
    txn_meta: [
      r`avl\.? bal|available (?:balance|bal|limit)|bal(?:ance)?:? (?:rs|inr|₹)|(?:upi )?ref(?:erence)?(?: no\.?)?:? ?\d|utr|rrn|txn (?:id|no)|on \d{1,2}[-/ ](?:\d{1,2}|[a-z]{3})|info:|not you\?|if not (?:done|made|initiated|you)|उपलब्ध शेष|शेष राशि`,
    ],
    ignore_if: [
      r`ignore if (?:already )?(?:paid|done|updated|made|completed)|if already (?:paid|done|updated)|(?:kindly|please) ignore${G3}(?:already|if)|ignore karein`,
      r`(?:अगर|यदि) (?:पहले ही|पहले से)(?: \S+){0,3} (?:कर|भर) (?:दिया|चुके)|कृपया ध्यान न दें`,
    ],
    branch_visit: [r`(?:visit|contact) (?:your |the )?(?:nearest |home |base )?branch|at (?:your |the )?(?:nearest )?branch|via (?:net ?banking|mobile ?banking)|नजदीकी शाखा|शाखा में|ब्रांच (?:में|जाकर)`],
    market_risk: [r`subject to market risks?|read (?:all )?(?:scheme|offer) (?:related )?documents? carefully|बाजार जोखिम`],
    playstore: [r`play ?store|app ?store|google play|apple store|प्ले स्टोर`],
  },
  rules: [
    {
      id: 'gen.urgency', cat: 'other', w: 10, all: ['urgent'], x: 'urgency',
      en: ['Pressure to act right now', "Scammers create panic so you don't stop to check."],
      hi: ['तुरंत कुछ करने का दबाव', 'ठग घबराहट पैदा करते हैं ताकि आप रुककर जाँच न करें।'],
    },
    {
      id: 'gen.threat', cat: 'other', w: 15, all: ['threat', 'urgent|block_threat|block_word'], x: 'urgency',
      en: ["'Do it now, or else' threat", 'Genuine companies give you time and never threaten you over a message.'],
      hi: ["'अभी करो, वरना...' वाली धमकी", 'असली कंपनियाँ समय देती हैं, मैसेज पर धमकी नहीं देतीं।'],
    },
    {
      id: 'gen.secrecy', cat: 'other', w: 30, all: ['secrecy'],
      en: ['Asks you to keep it secret', 'Banks, police and officials never ask you to hide anything from your family. Secrecy is how scammers stop you from getting help.'],
      hi: ['बात छिपाने को कहा गया है', 'बैंक, पुलिस या अधिकारी कभी परिवार से बात छिपाने को नहीं कहते। ठग ऐसा इसलिए कहते हैं ताकि आप किसी से मदद न ले सकें।'],
    },
    {
      id: 'gen.credentials', cat: 'otp_theft', w: 65, all: ['credential_req'],
      en: ['Asks for card, PIN or password details', 'No bank or company ever asks for these. Anyone who does is trying to empty your account.'],
      hi: ['कार्ड, PIN या पासवर्ड की जानकारी माँगी गई है', 'कोई भी बैंक या कंपनी यह जानकारी नहीं माँगती। जो माँगे, वह आपका खाता खाली करना चाहता है।'],
    },
    {
      id: 'gen.block_threat', cat: 'other', w: 20, all: ['block_threat'], not: 'sim_threat', x: 'block',
      en: ['Threatens to block your account', 'Banks do not block accounts with a warning message and a deadline.'],
      hi: ['खाता बंद करने की धमकी', 'बैंक मैसेज भेजकर और समय-सीमा देकर खाते बंद नहीं करते।'],
    },
    {
      id: 'gen.mixed_script', cat: 'other', w: 25, all: ['@mixed'],
      en: ['Look-alike letters used to hide words', 'Some letters come from another alphabet. Scammers do this to slip past spam filters.'],
      hi: ['मिलते-जुलते अक्षरों से शब्द छिपाए गए हैं', 'कुछ अक्षर दूसरी लिपि के हैं। ठग स्पैम फ़िल्टर से बचने के लिए ऐसा करते हैं।'],
    },
    {
      id: 'gen.bank_sms_from_mobile', cat: 'impersonation', w: 30, all: ['@s_mobile', 'bank|account|card|kyc'], not: '@wa',
      en: ['Bank message from a personal number', 'Banks send SMS from registered headers like VM-HDFCBK, never from a 10-digit mobile number.'],
      hi: ['निजी नंबर से बैंक का मैसेज', 'बैंक VM-HDFCBK जैसे रजिस्टर्ड हेडर से SMS भेजते हैं, 10 अंकों वाले मोबाइल नंबर से नहीं।'],
    },
    {
      id: 'gen.foreign_sender', cat: 'other', w: 25, all: ['@s_intl_risky|@intl_risky'],
      en: ['Number from a country linked to scam calls', 'Indian banks, couriers and government offices do not contact you from foreign numbers.'],
      hi: ['ऐसे देश का नंबर जहाँ से ठगी की कॉल आती हैं', 'भारतीय बैंक, कूरियर या सरकारी दफ़्तर विदेशी नंबरों से संपर्क नहीं करते।'],
    },
    {
      id: 'gen.telemarketing', cat: 'other', w: 10, all: ['@s_140'],
      en: ['Promotional caller (140 series)', 'Numbers starting with 140 are registered telemarketers. It is an ad, not your bank.'],
      hi: ['विज्ञापन वाली कॉल (140 सीरीज़)', '140 से शुरू होने वाले नंबर रजिस्टर्ड टेलीमार्केटर के होते हैं। यह विज्ञापन है, आपका बैंक नहीं।'],
    },
    {
      id: 'gen.link_account', cat: 'phishing_link', w: 25, all: ['@ulink', 'account|bank|verify|card'], x: 'linkacct',
      en: ['A link about your account', 'Real banks ask you to use their app or website, not a link sent in a message.'],
      hi: ['आपके खाते से जुड़ा लिंक', 'असली बैंक ऐप या अपनी वेबसाइट इस्तेमाल करने को कहते हैं, मैसेज में आया लिंक नहीं।'],
    },
    // Reassuring signals (negative weights)
    {
      id: 'ok.dont_share', cat: 'other', w: -20, all: ['dont_share'],
      en: ['Reminds you never to share your OTP or PIN', 'Genuine bank and app messages warn you to keep codes private.'],
      hi: ['OTP या PIN किसी को न बताने की सलाह', 'असली बैंक और ऐप के मैसेज कोड को गुप्त रखने की याद दिलाते हैं।'],
    },
    {
      id: 'ok.awareness', cat: 'other', w: -15, all: ['awareness'],
      en: ['Reads like a safety warning', 'The message warns about fraud instead of asking you to act.'],
      hi: ['सुरक्षा चेतावनी जैसा मैसेज', 'यह मैसेज कुछ करवाने के बजाय धोखाधड़ी से सावधान करता है।'],
    },
    {
      id: 'ok.transaction_alert', cat: 'other', w: -25, all: ['txn_verb', 'txn_obj', 'txn_meta'], not: 'link_cta|@ulink|credential_req|otp_share|pin_enter|mistake',
      en: ['Looks like a normal transaction alert', 'It reports a payment with reference details and does not ask you to click, call or pay.'],
      hi: ['सामान्य ट्रांज़ैक्शन अलर्ट जैसा', 'इसमें लेन-देन और रेफ़रेंस की जानकारी है, क्लिक, कॉल या पेमेंट करने को नहीं कहा गया।'],
    },
    {
      id: 'ok.ignore_if_done', cat: 'other', w: -10, all: ['ignore_if'],
      en: ['Says to ignore it if already done', 'Genuine reminders usually say this; scams insist you act.'],
      hi: ['पहले से हो चुका हो तो नज़रअंदाज़ करने को कहा है', 'असली रिमाइंडर में ऐसा लिखा होता है; ठग ज़िद करते हैं कि आप तुरंत कुछ करें।'],
    },
    {
      id: 'ok.branch', cat: 'other', w: -10, all: ['branch_visit'],
      en: ['Points you to the branch or net banking', 'Being sent to your branch or your own banking app is how real banks work.'],
      hi: ['ब्रांच या नेट बैंकिंग से करने को कहा है', 'असली बैंक आपको ब्रांच या आपके अपने बैंकिंग ऐप पर ही भेजते हैं।'],
    },
    {
      id: 'ok.official_links', cat: 'other', w: -15, all: ['@olink'],
      en: ['Links go only to official websites', 'Every link in the message points to a verified official domain.'],
      hi: ['सारे लिंक आधिकारिक वेबसाइटों के हैं', 'मैसेज का हर लिंक किसी जाँची हुई आधिकारिक वेबसाइट का है।'],
    },
    {
      id: 'ok.dlt_brand', cat: 'other', w: -25, all: ['@s_brand'], not: '@ulink',
      en: ["Sent from the company's registered SMS header", 'Business SMS in India come from DLT-registered headers such as VM-HDFCBK, which scammers cannot easily use.'],
      hi: ['कंपनी के रजिस्टर्ड SMS हेडर से आया है', 'भारत में कंपनियों के SMS VM-HDFCBK जैसे DLT रजिस्टर्ड हेडर से आते हैं, जिन्हें ठग आसानी से इस्तेमाल नहीं कर सकते।'],
    },
    {
      id: 'ok.dlt', cat: 'other', w: -10, all: ['@s_dlt'], not: '@s_brand|@ulink',
      en: ['Sent from a registered business SMS header', 'The sender uses a DLT-registered header rather than a personal number.'],
      hi: ['रजिस्टर्ड बिज़नेस SMS हेडर से आया है', 'भेजने वाले ने निजी नंबर नहीं, DLT रजिस्टर्ड हेडर इस्तेमाल किया है।'],
    },
    {
      id: 'ok.series_1600', cat: 'other', w: -20, all: ['@s_1600'],
      en: ['Call from the 1600 series', 'TRAI reserves 1600-series numbers for service calls from banks and financial institutions.'],
      hi: ['1600 सीरीज़ से कॉल', 'TRAI ने 1600 सीरीज़ के नंबर बैंकों और वित्तीय संस्थाओं की सर्विस कॉल के लिए तय किए हैं।'],
    },
    {
      id: 'ok.market_disclaimer', cat: 'other', w: -5, all: ['market_risk'],
      en: ['Carries the standard market-risk disclaimer', 'Regulated investment messages include this line.'],
      hi: ['बाज़ार जोखिम वाली मानक चेतावनी है', 'नियमों के तहत चलने वाले निवेश मैसेज में यह लाइन होती है।'],
    },
  ],
};
