import { G3, r, type RuleModule } from './types';

/** 'Digital arrest': fake police/CBI/ED/NCB/customs officers keep the victim on a video call and extort money. */
export const digitalArrest: RuleModule = {
  cues: {
    da_agency: [
      r`cbi|c\.b\.i\.?|central bureau of investigation|enforcement directorate|ncb|narcotics(?: control)? bureau|narcotics (?:department|cell|division|officers?|team|wing)|anti[- ]narcotics`,
      r`(?:mumbai|delhi|bangalore|bengaluru|hyderabad|kolkata|chennai|lucknow|noida|gurgaon|gurugram|pune|jaipur|ahmedabad|andheri|bandra|thane|crime) (?:police|crime branch|cyber (?:crime|cell|police)|customs)`,
      r`cyber ?(?:crime )?(?:cell|branch|department|police|wing|division)|crime branch|interpol|national investigation agency|nia (?:officer|team)`,
      r`(?:customs|excise) (?:department|officers?|officials?|authorities)|dcp|ips officer|sub[- ]?inspector|police (?:station|inspector|officer|commissioner|headquarters|department)`,
      r`supreme court|high court|magistrate|ed (?:officer|department|office|notice|case|raid|summons)|(?:rbi|trai|income tax) (?:officer|official|raid)|(?:department|dept\.?) of telecom(?:munications)?`,
      r`police (?:wale|wala|thana|se)|thane se|crime branch se|cbi se|cbi (?:wale|officer)`,
      r`सीबीआई|सी\.बी\.आई|ईडी|प्रवर्तन निदेशालय|एनसीबी|नारकोटिक्स|कस्टम (?:विभाग|अधिकारी)|साइबर (?:क्राइम|सेल|पुलिस|अपराध)|क्राइम ब्रांच|(?:मुंबई|दिल्ली) पुलिस|पुलिस (?:थाना|स्टेशन|अधिकारी|इंस्पेक्टर|विभाग)|थाने|सुप्रीम कोर्ट|हाई कोर्ट|अदालत|न्यायालय`,
    ],
    da_police: [r`police|पुलिस|pulis|cops?|inspector|इंस्पेक्टर|daroga|दरोगा`],
    da_legal: [
      r`arrest warrant|warrant (?:has been |is )?(?:issued|generated|out)|non[- ]bailable|(?:will|shall|would|may) be arrested|(?:you are|you're|you will be) (?:under arrest|arrested)|arrest(?:ed)? (?:you|soon|today|immediately)`,
      r`legal action|legal proceedings|case (?:has been |is )?(?:registered|filed|lodged|booked)|fir (?:has been |is )?(?:registered|filed|lodged)|money laundering|hawala|terror(?:ist)? funding`,
      r`illegal (?:transactions?|activit(?:y|ies)|funds|parcel|items?)|drug trafficking|human trafficking|under (?:digital|house|virtual|online) arrest|digital arrest`,
      r`court (?:order|summons|notice|warrant)|summons|(?:sent|go) to jail|investigation (?:against|on) you|interrogation|statement (?:recording|will be recorded)|(?:freeze|seize|seized|attach) (?:your )?(?:bank )?(?:accounts?|assets|property)`,
      r`giraftar|giraftaar|girftar|grftar|arrest ho (?:jaoge|jayenge|jaenge|sakte)|warrant (?:nikla|jari|issue) hua|case (?:darj|register) (?:hua|ho gaya|kiya)|fir (?:darj|ho gayi)|kanoo?ni (?:karyavahi|karwai|karvai|action)|jail (?:jaoge|jana padega|ho jayegi|bhej)`,
      r`गिरफ्तार|गिरफ्तारी|वारंट|मनी लॉन्ड्रिंग|मनी लांड्रिंग|हवाला|कानूनी कार्रवाई|केस दर्ज|मामला दर्ज|एफआईआर|जेल|पूछताछ|डिजिटल अरेस्ट|अवैध (?:लेनदेन|पार्सल|गतिविधि)`,
    ],
    da_term: [r`digital arrest|digitally arrested|डिजिटल अरेस्ट|digital giraftari`],
    da_aadhaar: [
      r`(?:your )?aadhaa?r(?: card| number| no\.?)? (?:is |was |has been |have been )?(?:used|linked|misused|found|involved|registered)`,
      r`(?:sim|sims|sim cards?|mobile numbers?|bank accounts?|accounts?)${G3}(?:issued|registered|opened|linked) (?:on|in|with|using|against) your (?:aadhaa?r|name|id|pan)`,
      r`aapke aadhaa?r (?:se|par|pe|ka|card se)|aapke naam (?:par|pe|se) (?:sim|parcel|account|khata)`,
      r`आपके आधार (?:से|पर|का)|आपके नाम (?:पर|से) (?:सिम|खाता|पार्सल)`,
    ],
    da_video: [
      r`skype|video call|on camera|camera (?:on|chalu)|stay on (?:the )?(?:call|line|video|camera)|keep (?:the )?(?:camera|video) on|whatsapp video|zoom (?:call|meeting)`,
      r`(?:don't|do not|dont) (?:disconnect|cut|end) (?:the |this )?call|video call (?:par|pe) (?:raho|rahiye|rahna)|call (?:mat|na) (?:kaatna|katna|kaatiye|kato)`,
      r`वीडियो कॉल|स्काइप|कैमरा (?:चालू|ऑन)|कॉल (?:न|मत) काटें`,
    ],
    da_transfer: [
      r`(?:transfer|move|deposit|send) (?:all |your )?(?:the )?(?:money|funds|savings|amount|balance)(?: \S+){0,4} (?:to|into|in) (?:the |a )?(?:rbi|safe|secure|government|govt|verification|escrow|supervision|secret|official|investigation)(?: \S+)? (?:account|custody)`,
      r`(?:rbi|government|govt|safe|secure|verification|escrow|supervisory|investigation) (?:account|custody)|(?:money|amount|funds) will be (?:returned|refunded|released) after (?:the )?(?:verification|investigation|inquiry|clearance)`,
      r`(?:bail|clearance|settlement|security) (?:amount|money|deposit)|verification (?:ke liye|ke lie) (?:paise|paisa|amount)|paise (?:verify|check) (?:honge|hoga|karne)`,
      r`(?:जमानत|सत्यापन) (?:राशि|खाता|के लिए)|पैसे (?:सत्यापन|वेरिफिकेशन) के लिए`,
    ],
    da_contraband: [
      r`(?:parcel|package|courier|consignment|shipment)(?: \S+){0,8} (?:drugs?|mdma|narcotics?|ganja|cocaine|heroin|lsd|passports?|fake (?:passports?|ids?|cards?)|illegal (?:items?|goods)|contraband|weapons?)`,
      r`(?:drugs?|mdma|narcotics?) (?:found|seized|recovered)|parcel(?: \S+){0,8} (?:drugs|ganja|nasha)|पार्सल(?: \S+){0,8} (?:ड्रग्स|नशीले|नशीला|अवैध)`,
    ],
  },
  rules: [
    {
      id: 'da.agency_threat', cat: 'digital_arrest', w: 45, all: ['da_agency|da_police', 'da_legal'], not: 'awareness',
      en: ['Threat of arrest or a police case', 'Police, CBI or ED never threaten arrest over a phone or video call and never settle cases for money.'],
      hi: ['गिरफ़्तारी या पुलिस केस की धमकी', 'पुलिस, CBI या ED फ़ोन या वीडियो कॉल पर गिरफ़्तारी की धमकी नहीं देते, न पैसे लेकर केस ख़त्म करते हैं।'],
    },
    {
      id: 'da.legal_words', cat: 'digital_arrest', w: 20, all: ['da_legal'], not: 'da_agency|da_police|awareness',
      en: ['Talks about a criminal case', 'Words like money laundering, warrant or illegal parcel are used to frighten you.'],
      hi: ['आपराधिक केस की बात', 'मनी लॉन्ड्रिंग, वारंट या अवैध पार्सल जैसे शब्द डराने के लिए इस्तेमाल होते हैं।'],
    },
    {
      id: 'da.term', cat: 'digital_arrest', w: 40, all: ['da_term'], not: 'awareness',
      en: ["Says you are under 'digital arrest'", "There is no such thing as a digital arrest in Indian law. It is always a scam."],
      hi: ["'डिजिटल अरेस्ट' की बात", 'भारतीय क़ानून में डिजिटल अरेस्ट जैसी कोई चीज़ नहीं है। यह हमेशा ठगी होती है।'],
    },
    {
      id: 'da.video_custody', cat: 'digital_arrest', w: 40, all: ['da_video', 'da_agency|da_police|da_legal|da_aadhaar'], not: 'awareness',
      en: ['Officials on a video call', 'No agency questions or arrests anyone over Skype or WhatsApp video, or asks you to stay on camera.'],
      hi: ['वीडियो कॉल पर "अधिकारी"', 'कोई एजेंसी Skype या WhatsApp वीडियो पर पूछताछ या गिरफ़्तारी नहीं करती, न कैमरे के सामने बैठे रहने को कहती है।'],
    },
    {
      id: 'da.secrecy', cat: 'digital_arrest', w: 35, all: ['secrecy', 'da_agency|da_police|da_legal|da_aadhaar|da_term'], not: 'awareness',
      en: ['Told not to tell anyone about the case', 'Isolating you from family is the core trick of digital arrest scams.'],
      hi: ['केस के बारे में किसी को न बताने की हिदायत', 'आपको परिवार से अलग-थलग करना डिजिटल अरेस्ट ठगी की सबसे बड़ी चाल है।'],
    },
    {
      id: 'da.aadhaar_misuse', cat: 'digital_arrest', w: 25, all: ['da_aadhaar'], x: 'da_aadhaar',
      en: ['Claims your Aadhaar or name was misused', 'Scammers say your Aadhaar was used for SIMs, accounts or parcels to make you panic.'],
      hi: ['आपके आधार या नाम के ग़लत इस्तेमाल का दावा', 'ठग कहते हैं कि आपके आधार से सिम, खाते या पार्सल लिए गए, ताकि आप घबरा जाएं।'],
    },
    {
      id: 'da.aadhaar_case', cat: 'digital_arrest', w: 35, all: ['da_aadhaar', 'da_legal|da_agency|da_police'], x: 'da_aadhaar',
      en: ['Your Aadhaar is linked to a "case"', 'Real investigations never start with a call about your Aadhaar being used in a crime.'],
      hi: ['आपके आधार को किसी "केस" से जोड़ा गया', 'असली जांच कभी इस कॉल से शुरू नहीं होती कि आपका आधार किसी अपराध में इस्तेमाल हुआ है।'],
    },
    {
      id: 'da.money_verification', cat: 'digital_arrest', w: 55, all: ['da_transfer'],
      en: ["Asks you to move money for 'verification'", "There is no RBI or government 'safe account'. Money sent for verification is gone."],
      hi: ["'वेरिफ़िकेशन' के लिए पैसे भेजने को कहा", "RBI या सरकार का कोई 'सेफ़ अकाउंट' नहीं होता। वेरिफ़िकेशन के नाम पर भेजा पैसा वापस नहीं आता।"],
    },
    {
      id: 'da.parcel_agency', cat: 'digital_arrest', w: 40, all: ['da_contraband', 'da_agency|da_police|da_legal'],
      en: ['Illegal parcel in your name, plus police', 'The classic opening of a digital arrest scam: a parcel with drugs or passports, then a call from "police".'],
      hi: ['आपके नाम का अवैध पार्सल और पुलिस', 'डिजिटल अरेस्ट की पुरानी शुरुआत: ड्रग्स या पासपोर्ट वाला पार्सल, फिर "पुलिस" का फ़ोन।'],
    },
  ],
};
