import { r, type RuleModule } from './types';

/** Courier and parcel scams: parcel held, address update fee, contraband in your name. */
export function courierParcel(): RuleModule {
  return {
    cues: {
      parcel: [r`parcels?|packages?|shipments?|courier|consignments?|deliver(?:y|ies)|awb|tracking (?:id|number)|पार्सल|कूरियर|पैकेज|शिपमेंट|parsal|डिलीवरी`],
      courier_brand: [r`fedex|fed ex|dhl|blue ?dart|dtdc|delhivery|india ?post|speed ?post|ekart|xpressbees|ecom express|shadowfax|aramex|ups|usps|इंडिया पोस्ट|स्पीड पोस्ट`],
      held: [
        r`(?:on )?hold|held (?:at|by|up|in)|(?:has been |was |is )?(?:seized|detained|stopped|stuck|confiscated)`,
        r`(?:could not|couldn't|cannot|can't|unable to|failed to|was not|could not be) (?:be )?deliver(?:ed)?|undeliver(?:ed|able)|delivery (?:failed|attempt (?:failed|unsuccessful)|unsuccessful|exception|suspended)`,
        r`returned to (?:sender|warehouse|origin)|(?:pending|waiting) (?:at|in) (?:the )?(?:customs|warehouse|hub)|incomplete (?:address|information|details)|(?:address|details) (?:is |are |was )?(?:incomplete|incorrect|invalid|wrong|unclear|missing)`,
        r`rok (?:diya|liya) gaya|ruka (?:hua|hai)|atka (?:hua|hai)|pakda (?:gaya|hai)|रोक (?:लिया|दिया) गया|रुका (?:हुआ|है)|अटका|जब्त|पता (?:अधूरा|गलत)`,
      ],
      addr_update: [
        r`(?:update|confirm|verify|re-?enter|correct|provide) (?:your |the )?(?:delivery |shipping |correct |full |complete )?(?:address|details|information|pin ?code)|re-?schedule (?:your |the )?delivery|redeliver(?:y)? (?:request|schedule|booking)`,
        r`पता (?:अपडेट|सही) (?:करें|कीजिए)|address (?:update|confirm|sahi) (?:karo|karein|kare|karna)`,
      ],
      small_fee: {
        free: true,
        p: [
          r`\b(?:re-?delivery|delivery|customs|clearance|shipping|handling|address (?:correction|update)|storage|warehouse|holding|import|duty|courier|postage) (?:fee|fees|charges?|amount|duty|tax)\b`,
          r`\b(?:pay|payment of) (?:a )?(?:small |nominal )?(?:fee|amount|charge)\b`,
          r`(?:₹|\brs\.? ?|\binr ?)(?:[1-9]|[1-9]\d|1\d\d)(?:\.\d{1,2})?(?![\d,])`,
          r`शुल्क (?:₹|रु)`,
        ],
      },
      customs: [r`customs|custom (?:duty|department|office|clearance)|कस्टम`],
    },
    rules: [
      {
        id: 'cour.held_link', cat: 'courier_parcel', w: 50, all: ['parcel|courier_brand', 'held|addr_update', '@ulink|@mobile|install_app'],
        en: ['Parcel "held" with a link or number to fix it', 'Couriers show delivery problems in their own app or site. Links in such messages steal card details.'],
        hi: ['पार्सल "अटका" है, ठीक करने के लिए लिंक या नंबर', 'कूरियर डिलीवरी की दिक़्क़त अपने ऐप या साइट पर दिखाते हैं। ऐसे मैसेज के लिंक कार्ड की जानकारी चुराते हैं।'],
      },
      {
        id: 'cour.small_fee', cat: 'courier_parcel', w: 45, all: ['parcel|courier_brand|customs', 'small_fee'],
        en: ['Small fee to release a parcel', 'A "₹25 redelivery fee" is bait to collect your card details.'],
        hi: ['पार्सल छुड़ाने के लिए छोटी फ़ीस', '"₹25 री-डिलीवरी फ़ीस" आपके कार्ड की जानकारी हासिल करने का चारा है।'],
      },
      {
        id: 'cour.contraband', cat: 'courier_parcel', w: 45, all: ['da_contraband'],
        en: ['Parcel in your name with drugs or passports', 'This is the first step of a digital arrest scam. No real courier calls you about this.'],
        hi: ['आपके नाम के पार्सल में ड्रग्स या पासपोर्ट', 'यह डिजिटल अरेस्ट ठगी का पहला क़दम है। कोई असली कूरियर इस बारे में फ़ोन नहीं करता।'],
      },
      {
        id: 'cour.press_digit', cat: 'courier_parcel', w: 40, all: ['press', 'parcel|courier_brand|customs'],
        en: ['Automated call: "press 1" about a parcel', 'Recorded calls about parcels that ask you to press a key connect you to scammers.'],
        hi: ['ऑटोमेटेड कॉल: पार्सल के लिए "1 दबाएं"', 'पार्सल के बारे में रिकॉर्डेड कॉल जो बटन दबाने को कहे, सीधे ठगों से जोड़ती है।'],
      },
      {
        id: 'cour.customs_pay', cat: 'courier_parcel', w: 40, all: ['customs', 'parcel|gift_parcel', 'money_req|fee|fee_pay|small_fee'],
        en: ['Customs duty to be paid to a person', 'Customs duty is never paid to an individual or by UPI to a personal ID.'],
        hi: ['किसी व्यक्ति को कस्टम ड्यूटी देने को कहा', 'कस्टम ड्यूटी कभी किसी व्यक्ति को या निजी UPI ID पर नहीं दी जाती।'],
      },
      {
        id: 'cour.held', cat: 'courier_parcel', w: 15, all: ['parcel|courier_brand', 'held'], x: 'cour_held',
        en: ['Parcel said to be held', 'Check the status yourself in the courier app before doing anything.'],
        hi: ['पार्सल रुकने की बात', 'कुछ भी करने से पहले कूरियर के ऐप में ख़ुद स्टेटस देखें।'],
      },
    ],
  };
}
