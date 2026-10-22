import { r, type RuleModule } from './types';

/** Malicious APKs: "wedding invitation.apk", "PM Kisan.apk", "SBI Rewards.apk", "install this app". */
export function maliciousApp(): RuleModule {
  return {
    cues: {
      apk_word: { free: true, p: [r`\.(?:apk|apks|xapk)(?![a-z])|\bapk (?:file|download|link)|एपीके`] },
      install_app: [
        r`(?:download|install|instal)(?: \S+){0,3} (?:app|application|apk|software)|app (?:download|install) (?:kar|karo|karein|karen|kare|kijiye|kariye|karna)`,
        r`(?:ऐप|एप|एप्लीकेशन) (?:डाउनलोड|इंस्टॉल|इंस्टाल)|(?:डाउनलोड|इंस्टॉल) (?:करें|करे|कीजिए)(?: \S+){0,3} (?:ऐप|एप)`,
      ],
      invite: [r`wedding (?:card|invitation|invite)|marriage (?:card|invitation)|shaadi (?:ka )?(?:card|nimantran|invitation)|शादी (?:का )?(?:कार्ड|निमंत्रण)|invitation card|e-?invite|nimantran patra|निमंत्रण पत्र`],
      app_bait: [r`kyc|reward|points|refund|bill|electricity|challan|bank|support|customer care|scheme|yojana|kisan|loan|cashback|bonus|income tax|aadhaa?r|pan card|बिजली|बैंक|रिफंड|योजना|चालान`],
    },
    rules: [
      {
        id: 'app.apk', cat: 'malicious_app', w: 70, all: ['apk_word'],
        en: ['An Android app file (.apk) sent in a message', 'APK files from messages can read your SMS and OTPs and take over your phone. Never open them.'],
        hi: ['मैसेज में Android ऐप फ़ाइल (.apk)', 'मैसेज में आई APK फ़ाइल आपके SMS और OTP पढ़कर फ़ोन पर क़ब्ज़ा कर सकती है। इसे कभी न खोलें।'],
      },
      {
        id: 'app.install_link', cat: 'malicious_app', w: 40, all: ['install_app', '@ulink'], not: 'playstore|@olink',
        en: ['Install an app from a link', 'Apps from links skip Play Store checks and are often spyware.'],
        hi: ['लिंक से ऐप इंस्टॉल करने को कहा', 'लिंक से आए ऐप Play Store की जाँच से नहीं गुज़रते और अक्सर जासूसी करते हैं।'],
      },
      {
        id: 'app.install_bait', cat: 'malicious_app', w: 30, all: ['install_app', 'app_bait'], not: 'playstore|@olink',
        en: ['Asked to install an app for a bank, bill or reward issue', 'No bank, discom or government office asks you to install an app sent in a message.'],
        hi: ['बैंक, बिल या रिवॉर्ड के लिए ऐप डालने को कहा', 'कोई बैंक, बिजली कंपनी या सरकारी दफ़्तर मैसेज में भेजा ऐप डालने को नहीं कहता।'],
      },
      {
        id: 'app.invite', cat: 'malicious_app', w: 45, all: ['invite', 'apk_word|install_app|@ulink|file_word'],
        en: ['"Wedding invitation" file to open', 'Fake invitation files are malware that steals bank details.'],
        hi: ['खोलने के लिए "शादी का कार्ड" फ़ाइल', 'नकली निमंत्रण फ़ाइलें मैलवेयर होती हैं जो बैंक की जानकारी चुराती हैं।'],
      },
      {
        id: 'app.hidden_name', cat: 'malicious_app', w: 50, all: ['@bidi'],
        en: ['Hidden characters that fake a file name', 'Invisible right-to-left characters can make "evil.apk" look like a PDF or photo.'],
        hi: ['फ़ाइल का नाम छिपाने वाले अदृश्य अक्षर', 'अदृश्य अक्षरों से "evil.apk" जैसी फ़ाइल PDF या फ़ोटो जैसी दिख सकती है।'],
      },
    ],
  };
}
