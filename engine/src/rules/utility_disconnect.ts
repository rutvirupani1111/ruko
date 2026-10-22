import { r, type RuleModule } from './types';

/** Electricity / gas disconnection scams: "power cut tonight at 9:30, call the officer". */
export const utilityDisconnect: RuleModule = {
  cues: {
    utility: [
      r`electric(?:ity)?(?: \S+)? (?:bill|connection|board|office|department|supply|meter|officer)|electricity|power (?:supply|connection|cut)|bijli|bijlee|light (?:bill|connection)|बिजली|विद्युत`,
      r`gas (?:connection|bill|cylinder|booking)|lpg|water (?:connection|bill|supply)|(?:prepaid |smart )?meter`,
      r`msedcl|mseb|mahavitaran|bescom|tata power|adani electricity|torrent power|tneb|tangedco|bses|uppcl|pspcl|kseb|wbsedcl|dhbvn|uhbvn|jvvnl|avvnl|jdvvnl|tsspdcl|apspdcl|cesc|discom|indane|hp gas|bharat gas`,
    ],
    disconnect: [
      r`disconnect(?:ed|ion)?|(?:will|shall) be (?:cut|stopped|discontinued|switched off|turned off)|power cut|cut (?:off )?(?:tonight|today)`,
      r`kat (?:jayega|jaega|jayegi|jaegi|di jayegi|diya jayega)|kaat (?:di|diya|dee) (?:jayegi|jayega|jaegi|jaega)|katt? jayegi|band (?:ho|kar) (?:jayegi|jayega|di jayegi|diya jayega)`,
      r`काट (?:दी|दिया) जाएगी|काट दिया जाएगा|काटी जाएगी|कट जाएगी|कट जाएगा|बंद कर दी जाएगी|बंद हो जाएगी`,
    ],
    tonight: [
      r`tonight|to-?night|today (?:at|by|before) \d|(?:at|by|before) \d{1,2}(?:[:.]\d{2})? ?(?:pm|am|baje)|\d{1,2}[:.]30 ?(?:pm|baje)`,
      r`aaj raat|aaj rat|आज रात|रात (?:को )?\d|\d{1,2}[:.]30 बजे|साढे नौ`,
    ],
    not_updated: [
      r`(?:bill|payment|last bill|previous bill)(?: \S+){0,3} (?:is |was |has |have )?(?:not|wasn't|isn't|hasn't|has not been|was not) (?:been )?(?:updated|paid|received|uploaded|update|clear(?:ed)?)`,
      r`previous (?:month|months?)(?:'s)? (?:bill|payment)|last month(?:'s)? (?:bill|payment)|(?:pichhle|pichle|pichhla|pichla) (?:mahine|month) (?:ka )?bill|bill update (?:nahi|nhi|nahin)`,
      r`बिल (?:अपडेट|जमा) नहीं|पिछले (?:महीने|माह) का बिल`,
    ],
    officer: [
      r`(?:electricity |bijli |power |electric )?(?:officer|adhikari|lineman)|contact (?:our |the )?(?:electricity )?(?:officer|department|office)`,
      r`अधिकारी|बिजली विभाग|bijli (?:vibhag|office|adhikari)`,
    ],
  },
  rules: [
    {
      id: 'util.disconnect_tonight', cat: 'utility_disconnect', w: 50, all: ['utility', 'disconnect', 'tonight'],
      en: ['Power will be cut "tonight"', 'Power companies give written notice. A same-night disconnection SMS is a scam script.'],
      hi: ['"आज रात" बिजली कटने की बात', 'बिजली कंपनियाँ लिखित नोटिस देती हैं। उसी रात कनेक्शन काटने वाला SMS ठगी की स्क्रिप्ट है।'],
    },
    {
      id: 'util.not_updated', cat: 'utility_disconnect', w: 40, all: ['not_updated', 'utility|disconnect'],
      en: ['"Your last bill was not updated"', 'This phrase is copied word for word in electricity bill scams.'],
      hi: ['"पिछला बिल अपडेट नहीं हुआ"', 'बिजली बिल ठगी में यही लाइन हूबहू इस्तेमाल होती है।'],
    },
    {
      id: 'util.officer_call', cat: 'utility_disconnect', w: 45, all: ['utility|disconnect', 'officer|call_cta', '@mobile'],
      en: ["Call an 'electricity officer' on a mobile", "Discoms don't ask you to call an officer's personal number. The 'officer' will ask you to install an app."],
      hi: ["मोबाइल पर 'बिजली अधिकारी' को कॉल", "बिजली कंपनियाँ किसी अधिकारी के निजी नंबर पर कॉल नहीं करवातीं। यह 'अधिकारी' आपसे ऐप डलवाएगा।"],
    },
    {
      id: 'util.app', cat: 'utility_disconnect', w: 35, all: ['utility', 'disconnect', 'install_app|apk_word|remote_app|@ulink'],
      en: ['App or link to avoid disconnection', 'Pay bills only in the official discom app or a payment app you already use.'],
      hi: ['कनेक्शन बचाने के लिए ऐप या लिंक', 'बिल सिर्फ़ बिजली कंपनी के आधिकारिक ऐप या अपने पेमेंट ऐप से भरें।'],
    },
  ],
};
