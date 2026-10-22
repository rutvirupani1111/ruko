/**
 * One-line description of each scam type, [English, Hindi]. Used in verdict
 * summaries and as CATEGORIES[].short / shortHi. Kept apart from the i18n
 * tables so the encyclopedia (`@ruko/engine/categories`) stays independent
 * of the analyser's strings.
 */
import type { ScamCategory } from './types';

export const SHORT: Record<ScamCategory, readonly [string, string]> = {
  digital_arrest: [
    "Fake police or CBI officers say you're linked to a crime and keep you on a video call until you pay.",
    'नकली पुलिस या CBI अधिकारी आपको किसी अपराध से जुड़ा बताकर वीडियो कॉल पर तब तक रोके रखते हैं, जब तक आप पैसे न दे दें।',
  ],
  kyc_update: [
    'A fake bank alert says your KYC has expired and pushes you to a link or app that steals your details.',
    'नकली बैंक अलर्ट में KYC एक्सपायर होने की बात कहकर आपको ऐसे लिंक या ऐप पर भेजा जाता है जो आपकी जानकारी चुरा ले।',
  ],
  upi_collect: [
    "Scammers send a UPI collect request and tell you to enter your PIN to 'receive' money. The PIN pays them.",
    "ठग UPI कलेक्ट रिक्वेस्ट भेजकर पैसे 'पाने' के लिए PIN डालने को कहते हैं। PIN डालते ही पैसे उन्हें चले जाते हैं।",
  ],
  qr_receive: [
    "You are sent a QR code to 'receive' money. Scanning it and entering your PIN sends money to the scammer.",
    "पैसे 'पाने' के लिए QR कोड भेजा जाता है। स्कैन करके PIN डालते ही पैसे ठग के पास चले जाते हैं।",
  ],
  fake_refund: [
    "A fake 'money credited' message or refund offer tricks you into sending money or sharing details.",
    "नकली 'पैसे आ गए' वाले मैसेज या रिफ़ंड के बहाने आपसे पैसे भिजवाए जाते हैं या जानकारी ली जाती है।",
  ],
  job_task: [
    "Easy online 'jobs' pay a little at first, then demand deposits for 'prepaid tasks' that you never get back.",
    "आसान ऑनलाइन 'नौकरी' में पहले थोड़े पैसे मिलते हैं, फिर 'प्रीपेड टास्क' के नाम पर पैसे जमा करवाए जाते हैं जो कभी वापस नहीं मिलते।",
  ],
  investment: [
    'Fake advisers promise guaranteed or double returns and move you to a trading app where you can never withdraw.',
    'नकली सलाहकार पक्के या दोगुने मुनाफ़े का वादा करके ऐसे ट्रेडिंग ऐप पर ले जाते हैं जहाँ से पैसा कभी नहीं निकलता।',
  ],
  lottery_prize: [
    "You're told you won a lottery or prize, but must first pay a 'fee' or 'tax' to claim it.",
    "आपको बताया जाता है कि आपने लॉटरी या इनाम जीता है, पर उसे पाने से पहले 'फ़ीस' या 'टैक्स' भरना होगा।",
  ],
  loan_app: [
    'Instant loan apps with no checks steal your contacts and photos, then harass and blackmail you.',
    'बिना जाँच वाले इंस्टेंट लोन ऐप आपके कॉन्टैक्ट और फ़ोटो चुराकर परेशान और ब्लैकमेल करते हैं।',
  ],
  sextortion: [
    'Someone records or fakes an intimate video and threatens to send it to your contacts unless you pay.',
    'कोई निजी वीडियो रिकॉर्ड करके या नकली बनाकर धमकी देता है कि पैसे न दिए तो उसे आपके जान-पहचान वालों को भेज देगा।',
  ],
  otp_theft: [
    'Someone posing as your bank or a company asks for the OTP sent to your phone and uses it to take your money or account.',
    'बैंक या कंपनी के नाम पर कोई आपके फ़ोन पर आया OTP माँगता है और उससे आपके पैसे या अकाउंट हथिया लेता है।',
  ],
  fake_support: [
    "Fake helpline numbers posing as customer care steal money through 'refunds', apps or OTPs.",
    "कस्टमर केयर बनकर नकली हेल्पलाइन नंबर 'रिफ़ंड', ऐप या OTP के बहाने पैसे चुराते हैं।",
  ],
  courier_parcel: [
    'A message says your parcel is held or contains illegal items, and asks for a fee, your details or a call.',
    'मैसेज में कहा जाता है कि आपका पार्सल अटका है या उसमें अवैध सामान है, और फ़ीस, आपकी जानकारी या कॉल माँगी जाती है।',
  ],
  utility_disconnect: [
    "A fake notice says your power will be cut tonight and asks you to call an 'officer' who then takes your money.",
    "नकली नोटिस में कहा जाता है कि आज रात बिजली कट जाएगी और किसी 'अधिकारी' को कॉल करने को कहा जाता है, जो फिर पैसे ऐंठता है।",
  ],
  reward_points: [
    "A message says your card reward points are expiring and sends you to a fake page or app to 'redeem' them.",
    "कार्ड के रिवॉर्ड पॉइंट ख़त्म होने की बात कहकर उन्हें 'रिडीम' करने के लिए नकली पेज या ऐप पर भेजा जाता है।",
  ],
  tax_refund: [
    'A fake income tax message promises a refund and asks you to verify your bank or card details.',
    "आयकर के नाम पर नकली मैसेज रिफ़ंड का वादा करके बैंक या कार्ड की जानकारी 'वेरिफ़ाई' करवाता है।",
  ],
  govt_scheme: [
    'Fake government schemes promise subsidies or free items but ask for a registration fee or your details.',
    'नकली सरकारी योजनाएं सब्सिडी या मुफ़्त सामान का वादा करके रजिस्ट्रेशन फ़ीस या आपकी जानकारी माँगती हैं।',
  ],
  malicious_app: [
    'An app file (.apk) disguised as an invitation, bill or reward takes over your phone and reads your OTPs.',
    'निमंत्रण, बिल या रिवॉर्ड के नाम पर भेजी गई ऐप फ़ाइल (.apk) आपके फ़ोन पर क़ब्ज़ा करके OTP पढ़ लेती है।',
  ],
  remote_access: [
    'A caller gets you to install AnyDesk or a similar app, then watches your screen and drains your account.',
    'कॉल करने वाला AnyDesk जैसा ऐप डलवाकर आपकी स्क्रीन देखता है और खाता खाली कर देता है।',
  ],
  impersonation: [
    'Someone pretends to be a relative, your boss or an officer and asks for urgent money or gift cards.',
    'कोई रिश्तेदार, बॉस या अफ़सर बनकर तुरंत पैसे या गिफ़्ट कार्ड माँगता है।',
  ],
  romance: [
    "An online 'partner' builds trust, then needs money for customs, a ticket or an emergency.",
    "ऑनलाइन मिला 'साथी' भरोसा जीतकर कस्टम, टिकट या किसी मुसीबत के नाम पर पैसे माँगता है।",
  ],
  sim_swap: [
    "Scammers threaten to block your SIM or offer an eSIM 'upgrade' to move your number, and your OTPs, to their phone.",
    "ठग सिम बंद करने की धमकी देकर या eSIM 'अपग्रेड' के बहाने आपका नंबर, और उसके साथ आपके OTP, अपने फ़ोन पर ले लेते हैं।",
  ],
  phishing_link: [
    'A link leads to a fake page that steals passwords, card details or OTPs.',
    'लिंक एक नकली पेज पर ले जाता है जो पासवर्ड, कार्ड की जानकारी या OTP चुराता है।',
  ],
  lookalike_domain: [
    'A website copies the name and look of a real brand to fool you into logging in or paying.',
    'कोई वेबसाइट असली ब्रांड का नाम और रूप-रंग कॉपी करके आपसे लॉगिन या पेमेंट करवाती है।',
  ],
  other: [
    'This message has several signs commonly seen in scams.',
    'इस मैसेज में ऐसे कई संकेत हैं जो अक्सर ठगी में दिखते हैं।',
  ],
};
