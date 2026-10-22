import type { ScamCategory } from '@ruko/engine';
import type { Locale } from '@/i18n/core';

/**
 * Spot the scam: 21 hand-written scenarios (14 scams, 7 genuine) in three
 * levels, each in English and Hindi. Phone numbers are dummies (98765 43210,
 * the UK fiction range 7700 900xxx and similar) and no link is real.
 *
 * Every flag phrase must appear verbatim in that language's content (a unit
 * test checks this). Flags with `on: 'sender'` point at the sender shown in the
 * app header; `on: 'pay'` points at the Pay button of a payment request.
 */

export type Channel = 'whatsapp' | 'sms' | 'email' | 'call' | 'payment';

export interface Flag {
  phrase: string;
  why: string;
  on?: 'content' | 'sender' | 'pay';
}

export type ChatMessage =
  | { type: 'text'; text: string; me?: boolean; author?: string }
  | { type: 'receipt'; title: string; amount: string; me?: boolean }
  | { type: 'file'; name: string; size: string; me?: boolean };

export interface CallLine {
  who: 'caller' | 'you';
  text: string;
}

export interface ScenarioContent {
  /** Name shown in the app header (overrides sender.display). */
  senderName?: string;
  senderSub?: string;
  messages?: ChatMessage[];
  subject?: string;
  body?: string[];
  cta?: string;
  lines?: CallLine[];
  note?: string;
  flags: Flag[];
  explain: string;
  tip: string;
}

export interface Scenario {
  id: string;
  level: 1 | 2 | 3;
  channel: Channel;
  isScam: boolean;
  category?: ScamCategory;
  time: string;
  sender: {
    display: string;
    /** Saved contact (no "not a contact" banner). */
    contact?: boolean;
    /** WhatsApp profile name shown next to an unknown number. */
    profile?: string;
    email?: string;
    vpa?: string;
    group?: boolean;
  };
  amount?: number;
  en: ScenarioContent;
  hi: ScenarioContent;
}

export const LEVELS = [1, 2, 3] as const;
export type Level = (typeof LEVELS)[number];

export const SCENARIOS: Scenario[] = [
  // ---------------------------------------------------------------- Level 1
  {
    id: 'job-task-youtube',
    level: 1,
    channel: 'whatsapp',
    isScam: true,
    category: 'job_task',
    time: '10:14',
    sender: { display: '+84 912 345 678', profile: 'Priya HR' },
    en: {
      messages: [
        { type: 'text', text: 'Hello, I am Priya from Amazon HR team. We are hiring part time staff, work from home 😊' },
        { type: 'text', text: 'Just like YouTube videos and earn ₹50 per like. Daily income ₹3,000 to ₹8,000.' },
        {
          type: 'text',
          text: 'No experience needed. To start, join our Telegram group t.me/amz_task_hr and complete a small prepaid task of ₹1,000. You will get ₹1,500 back.',
        },
      ],
      flags: [
        { on: 'sender', phrase: '+84 912 345 678', why: 'A +84 (Vietnam) number claiming to be Amazon HR in India. Real companies hire through their own websites.' },
        { phrase: 'earn ₹50 per like', why: 'Nobody pays you to like videos. This is the hook of the task scam.' },
        { phrase: 'Telegram group', why: 'Moving you to Telegram, where scammers run fake task dashboards.' },
        { phrase: 'prepaid task of ₹1,000', why: 'The moment you must pay to earn, it is a scam. The "tasks" will keep asking for more.' },
      ],
      explain: 'A classic task scam. Small payouts at first build trust, then the "prepaid tasks" grow until your money is stuck.',
      tip: 'Real jobs never ask you to pay. Block and report the number.',
    },
    hi: {
      messages: [
        { type: 'text', text: 'नमस्ते, मैं Amazon HR टीम से प्रिया बोल रही हूँ। हमें पार्ट टाइम स्टाफ चाहिए, घर बैठे काम 😊' },
        { type: 'text', text: 'बस YouTube वीडियो लाइक करें और हर लाइक पर ₹50 कमाएँ। रोज़ की कमाई ₹3,000 से ₹8,000।' },
        {
          type: 'text',
          text: 'किसी अनुभव की ज़रूरत नहीं। शुरू करने के लिए हमारे Telegram ग्रुप t.me/amz_task_hr से जुड़ें और ₹1,000 का छोटा प्रीपेड टास्क पूरा करें। आपको ₹1,500 वापस मिलेंगे।',
        },
      ],
      flags: [
        { on: 'sender', phrase: '+84 912 345 678', why: '+84 (वियतनाम) का नंबर, जो भारत में Amazon HR होने का दावा कर रहा है। असली कंपनियाँ अपनी वेबसाइट से भर्ती करती हैं।' },
        { phrase: 'हर लाइक पर ₹50 कमाएँ', why: 'वीडियो लाइक करने के कोई पैसे नहीं देता। टास्क स्कैम का यही चारा है।' },
        { phrase: 'Telegram ग्रुप', why: 'आपको Telegram पर ले जाया जा रहा है, जहाँ ठग नकली टास्क डैशबोर्ड चलाते हैं।' },
        { phrase: '₹1,000 का छोटा प्रीपेड टास्क', why: 'कमाने के लिए पहले पैसे माँगे जाएँ, तो समझिए स्कैम है। "टास्क" बार-बार और पैसे माँगेंगे।' },
      ],
      explain: 'यह क्लासिक टास्क स्कैम है। शुरुआत में छोटी कमाई से भरोसा जीता जाता है, फिर "प्रीपेड टास्क" बड़े होते जाते हैं और आपके पैसे फँस जाते हैं।',
      tip: 'असली नौकरी में कभी पैसे नहीं देने पड़ते। नंबर ब्लॉक करें और रिपोर्ट करें।',
    },
  },
  {
    id: 'kyc-sbi-sms',
    level: 1,
    channel: 'sms',
    isScam: true,
    category: 'kyc_update',
    time: '09:02',
    sender: { display: '+91 98765 43210' },
    en: {
      messages: [
        {
          type: 'text',
          text: 'Dear SBI user, your YONO account will be blocked today as your PAN card is not updated. Update now to avoid suspension: http://sbi-yono-kyc.top/update',
        },
      ],
      flags: [
        { on: 'sender', phrase: '+91 98765 43210', why: 'Banks send SMS from registered headers like VM-SBIBNK, not from a personal mobile number.' },
        { phrase: 'blocked today', why: 'Pressure and a deadline: scammers want you to act before you think.' },
        { phrase: 'PAN card is not updated', why: 'KYC and PAN updates happen in the official app or at the branch, never through an SMS link.' },
        { phrase: 'http://sbi-yono-kyc.top/update', why: 'Not SBI. SBI uses onlinesbi.sbi and sbi.co.in. A .top address with "sbi" in it is fake.' },
      ],
      explain: 'A fake KYC message. The link opens a copy of the bank login page that steals your username, password and OTP.',
      tip: 'Never update KYC from a link. Open your bank app yourself.',
    },
    hi: {
      messages: [
        {
          type: 'text',
          text: 'प्रिय SBI ग्राहक, आपका PAN कार्ड अपडेट न होने के कारण आपका YONO खाता आज ब्लॉक हो जाएगा। खाता बंद होने से बचाने के लिए अभी अपडेट करें: http://sbi-yono-kyc.top/update',
        },
      ],
      flags: [
        { on: 'sender', phrase: '+91 98765 43210', why: 'बैंक VM-SBIBNK जैसे रजिस्टर्ड हेडर से SMS भेजते हैं, किसी निजी मोबाइल नंबर से नहीं।' },
        { phrase: 'आज ब्लॉक हो जाएगा', why: 'डराना और जल्दबाज़ी करवाना: ठग चाहते हैं कि आप सोचने से पहले कदम उठा लें।' },
        { phrase: 'PAN कार्ड अपडेट न होने', why: 'KYC और PAN अपडेट बैंक के ऑफ़िशियल ऐप या ब्रांच में होते हैं, SMS के लिंक से कभी नहीं।' },
        { phrase: 'http://sbi-yono-kyc.top/update', why: 'यह SBI नहीं है। SBI की साइट onlinesbi.sbi और sbi.co.in हैं। "sbi" लिखा .top पता नकली है।' },
      ],
      explain: 'यह नकली KYC मैसेज है। लिंक बैंक के लॉगिन पेज जैसी नकली साइट खोलता है, जो आपका यूज़रनेम, पासवर्ड और OTP चुरा लेती है।',
      tip: 'किसी लिंक से कभी KYC अपडेट न करें। बैंक का ऐप खुद खोलें।',
    },
  },
  {
    id: 'otp-genuine',
    level: 1,
    channel: 'sms',
    isScam: false,
    time: '13:41',
    sender: { display: 'VM-HDFCBK' },
    en: {
      messages: [
        {
          type: 'text',
          text: '482913 is the OTP for your transaction of Rs 1,499.00 at SWIGGY on HDFC Bank Credit Card xx4321. Valid for 10 mins. Do not share this OTP with anyone. -HDFC Bank',
        },
      ],
      flags: [
        { on: 'sender', phrase: 'VM-HDFCBK', why: 'A registered bank header (VM-HDFCBK), the kind real banks use.' },
        { phrase: 'Do not share this OTP with anyone', why: 'Genuine OTP messages always warn you not to share them.' },
        { phrase: 'at SWIGGY', why: 'It names a purchase you actually made. If you did not, do not use the OTP and call your bank.' },
      ],
      explain: 'A normal OTP for a purchase you started. It has no link and asks nothing of you except to use it yourself.',
      tip: 'An OTP is only for you to type. Anyone who asks for it, even "from the bank", is a scammer.',
    },
    hi: {
      messages: [
        {
          type: 'text',
          text: '482913 आपके HDFC Bank क्रेडिट कार्ड xx4321 से SWIGGY पर Rs 1,499.00 के लेन-देन का OTP है। 10 मिनट तक मान्य। यह OTP किसी के साथ साझा न करें। -HDFC Bank',
        },
      ],
      flags: [
        { on: 'sender', phrase: 'VM-HDFCBK', why: 'रजिस्टर्ड बैंक हेडर (VM-HDFCBK), जैसा असली बैंक इस्तेमाल करते हैं।' },
        { phrase: 'यह OTP किसी के साथ साझा न करें', why: 'असली OTP मैसेज हमेशा चेतावनी देते हैं कि इसे किसी को न बताएँ।' },
        { phrase: 'SWIGGY पर', why: 'इसमें वही खरीदारी लिखी है जो आपने की। अगर आपने नहीं की, तो OTP इस्तेमाल न करें और बैंक को कॉल करें।' },
      ],
      explain: 'यह आपकी शुरू की हुई खरीदारी का सामान्य OTP है। इसमें कोई लिंक नहीं है और यह आपसे कुछ भी नहीं माँगता, सिवाय खुद इस्तेमाल करने के।',
      tip: 'OTP सिर्फ़ आपके टाइप करने के लिए होता है। जो भी इसे माँगे, चाहे "बैंक से" होने का दावा करे, वह ठग है।',
    },
  },
  {
    id: 'collect-cashback',
    level: 1,
    channel: 'payment',
    isScam: true,
    category: 'upi_collect',
    time: '18:20',
    sender: { display: 'Cashback Rewards', vpa: 'cashback.reward@ybl' },
    amount: 4999,
    en: {
      note: 'Congratulations! You won cashback. Enter UPI PIN to receive ₹4,999',
      flags: [
        { phrase: 'Enter UPI PIN to receive', why: 'You never need your UPI PIN to receive money. Entering it here SENDS ₹4,999 from your account.' },
        { on: 'sender', phrase: 'cashback.reward@ybl', why: 'Unknown "cashback" or "reward" UPI IDs are a scam favourite. Real cashback lands in your account by itself.' },
        { phrase: 'You won cashback', why: 'A prize you never entered, from someone you do not know.' },
        { on: 'pay', phrase: 'Pay', why: 'This is a request to PAY. The button says Pay because money leaves your account.' },
      ],
      explain: 'A collect request disguised as cashback. Any payment request with a PIN prompt takes money out of your account.',
      tip: 'Receiving money never needs a PIN, a QR scan or an approval. Decline and block.',
    },
    hi: {
      note: 'बधाई हो! आपने कैशबैक जीता है। ₹4,999 पाने के लिए UPI PIN डालें',
      flags: [
        { phrase: 'पाने के लिए UPI PIN डालें', why: 'पैसे पाने के लिए UPI PIN की कभी ज़रूरत नहीं होती। यहाँ PIN डालते ही आपके खाते से ₹4,999 चले जाएँगे।' },
        { on: 'sender', phrase: 'cashback.reward@ybl', why: '"cashback" या "reward" वाली अनजान UPI आईडी ठगों की पसंदीदा है। असली कैशबैक अपने आप खाते में आता है।' },
        { phrase: 'आपने कैशबैक जीता है', why: 'ऐसा इनाम जिसके लिए आपने कभी हिस्सा नहीं लिया, किसी अनजान से।' },
        { on: 'pay', phrase: 'Pay', why: 'यह पैसे भेजने की रिक्वेस्ट है। बटन पर "भुगतान करें" लिखा है, क्योंकि पैसे आपके खाते से जाएँगे।' },
      ],
      explain: 'कैशबैक के नाम पर पैसे माँगने की रिक्वेस्ट। PIN माँगने वाली हर पेमेंट रिक्वेस्ट आपके खाते से पैसे निकालती है।',
      tip: 'पैसे पाने के लिए कभी PIN, QR स्कैन या मंज़ूरी की ज़रूरत नहीं होती। Decline करें और ब्लॉक करें।',
    },
  },
  {
    id: 'family-chat',
    level: 1,
    channel: 'whatsapp',
    isScam: false,
    time: '19:05',
    sender: { display: 'Ananya', contact: true },
    en: {
      messages: [
        { type: 'text', text: 'Reached home? 🙂' },
        { type: 'text', text: 'Mom says dinner at 8. Can you pick up the cake from Kamal Bakery on the way?' },
        { type: 'text', text: 'I already paid them on UPI, just tell them it is the order for Ananya.' },
      ],
      flags: [
        { on: 'sender', phrase: 'Ananya', why: 'A saved contact you know, chatting the way she always does.' },
        { phrase: 'I already paid them', why: 'Nobody is asking you for money, a code or a link.' },
        { phrase: 'Kamal Bakery', why: 'Everyday plans with a real place you recognise.' },
      ],
      explain: 'A normal family chat. No urgency, no money request, no links.',
      tip: 'If a "family member" ever writes from a new number asking for money, call their old number first.',
    },
    hi: {
      senderName: 'अनन्या',
      messages: [
        { type: 'text', text: 'घर पहुँच गए? 🙂' },
        { type: 'text', text: 'मम्मी कह रही हैं डिनर 8 बजे है। रास्ते में कमल बेकरी से केक ले आओगे?' },
        { type: 'text', text: 'मैंने उन्हें UPI से पैसे दे दिए हैं, बस बोल देना कि अनन्या का ऑर्डर है।' },
      ],
      flags: [
        { on: 'sender', phrase: 'अनन्या', why: 'आपका सेव किया हुआ जाना-पहचाना कॉन्टैक्ट, रोज़ जैसी बातचीत।' },
        { phrase: 'मैंने उन्हें UPI से पैसे दे दिए हैं', why: 'कोई आपसे पैसे, कोड या लिंक नहीं माँग रहा।' },
        { phrase: 'कमल बेकरी', why: 'रोज़मर्रा की योजना, जानी-पहचानी जगह के साथ।' },
      ],
      explain: 'यह सामान्य पारिवारिक बातचीत है। न जल्दबाज़ी, न पैसों की माँग, न कोई लिंक।',
      tip: 'अगर कभी "परिवार का कोई सदस्य" नए नंबर से पैसे माँगे, तो पहले उनके पुराने नंबर पर कॉल करें।',
    },
  },
  {
    id: 'kbc-lottery-email',
    level: 1,
    channel: 'email',
    isScam: true,
    category: 'lottery_prize',
    time: '11:47',
    sender: { display: 'KBC Lucky Draw Department', email: 'kbc.lottery.winner2026@gmail.com' },
    en: {
      subject: 'Congratulations! You have won ₹25,00,000 in KBC Lucky Draw',
      body: [
        'Dear Winner,',
        'Your mobile number has been selected in the KBC Jio Lucky Draw 2026 and you have won ₹25,00,000 (Twenty Five Lakh Rupees).',
        'To release your prize, pay a processing fee of ₹12,500 to our account within 24 hours. Contact our manager Mr. Rana Pratap on WhatsApp: +92 300 1234567',
        'Do not share this with anyone or your prize will be cancelled.',
      ],
      cta: 'Claim your prize',
      flags: [
        { on: 'sender', phrase: 'kbc.lottery.winner2026@gmail.com', why: 'A free Gmail address, not an official domain. KBC never runs lotteries by email.' },
        { phrase: 'you have won ₹25,00,000', why: 'You cannot win a lottery you never entered.' },
        { phrase: 'pay a processing fee of ₹12,500', why: 'Real prizes never ask you to pay first. The "fee" is the scam.' },
        { phrase: '+92 300 1234567', why: '+92 is Pakistan. Many KBC lottery scams use such numbers.' },
        { phrase: 'Do not share this with anyone', why: 'Secrecy stops you from asking family, who would spot the scam.' },
      ],
      explain: 'The famous KBC lottery scam. After the first "fee" come taxes, transfer charges and more, until you stop paying.',
      tip: 'No fee, no prize, no lottery. Delete it.',
    },
    hi: {
      senderName: 'KBC लकी ड्रॉ विभाग',
      subject: 'बधाई हो! आपने KBC लकी ड्रॉ में ₹25,00,000 जीते हैं',
      body: [
        'प्रिय विजेता,',
        'KBC Jio लकी ड्रॉ 2026 में आपका मोबाइल नंबर चुना गया है और आपने ₹25,00,000 (पच्चीस लाख रुपये) जीते हैं।',
        'इनाम पाने के लिए 24 घंटे के अंदर हमारे खाते में ₹12,500 की प्रोसेसिंग फ़ीस जमा करें। हमारे मैनेजर श्री राणा प्रताप से WhatsApp पर संपर्क करें: +92 300 1234567',
        'यह बात किसी को न बताएँ, वरना आपका इनाम रद्द हो जाएगा।',
      ],
      cta: 'अपना इनाम लें',
      flags: [
        { on: 'sender', phrase: 'kbc.lottery.winner2026@gmail.com', why: 'यह मुफ़्त Gmail पता है, कोई ऑफ़िशियल डोमेन नहीं। KBC ईमेल से लॉटरी नहीं चलाता।' },
        { phrase: 'आपने ₹25,00,000 (पच्चीस लाख रुपये) जीते हैं', why: 'जिस लॉटरी में आपने हिस्सा ही नहीं लिया, उसे आप जीत नहीं सकते।' },
        { phrase: '₹12,500 की प्रोसेसिंग फ़ीस', why: 'असली इनाम के लिए पहले पैसे कभी नहीं देने पड़ते। यही "फ़ीस" असली ठगी है।' },
        { phrase: '+92 300 1234567', why: '+92 पाकिस्तान का कोड है। KBC लॉटरी के कई स्कैम ऐसे नंबरों से होते हैं।' },
        { phrase: 'यह बात किसी को न बताएँ', why: 'राज़ रखने को इसलिए कहा जाता है ताकि आप परिवार से न पूछें, जो तुरंत ठगी पहचान लेते।' },
      ],
      explain: 'यह मशहूर KBC लॉटरी स्कैम है। पहली "फ़ीस" के बाद टैक्स, ट्रांसफ़र चार्ज और न जाने क्या-क्या माँगा जाता है, जब तक आप पैसे देना बंद न कर दें।',
      tip: 'न फ़ीस, न इनाम, न लॉटरी। इसे डिलीट कर दें।',
    },
  },
  {
    id: 'delivery-genuine',
    level: 1,
    channel: 'sms',
    isScam: false,
    time: '08:31',
    sender: { display: 'AX-AMAZON' },
    en: {
      messages: [
        {
          type: 'text',
          text: 'Arriving today: Your Amazon order #407-1234567-1234567 is out for delivery. Track it in the Amazon app or at amazon.in/your-orders. Pay on delivery: ₹499.',
        },
      ],
      flags: [
        { on: 'sender', phrase: 'AX-AMAZON', why: 'A registered business header, not a random number.' },
        { phrase: 'amazon.in/your-orders', why: 'The link goes to amazon.in, Amazon’s real website.' },
        { phrase: 'Track it in the Amazon app', why: 'It points you to the app you already use, not to a new app or a form.' },
      ],
      explain: 'A normal delivery update for an order you placed. It asks for no fee, no details and no new app.',
      tip: 'If you did not order anything, ignore delivery messages. Parcel scams start with "your parcel is held".',
    },
    hi: {
      messages: [
        {
          type: 'text',
          text: 'आज पहुँचेगा: आपका Amazon ऑर्डर #407-1234567-1234567 डिलीवरी के लिए निकल चुका है। Amazon ऐप में या amazon.in/your-orders पर ट्रैक करें। डिलीवरी पर भुगतान: ₹499।',
        },
      ],
      flags: [
        { on: 'sender', phrase: 'AX-AMAZON', why: 'रजिस्टर्ड बिज़नेस हेडर, कोई अनजान नंबर नहीं।' },
        { phrase: 'amazon.in/your-orders', why: 'लिंक Amazon की असली वेबसाइट amazon.in पर जाता है।' },
        { phrase: 'Amazon ऐप में', why: 'यह आपको उसी ऐप पर भेजता है जो आप पहले से इस्तेमाल करते हैं, किसी नए ऐप या फ़ॉर्म पर नहीं।' },
      ],
      explain: 'आपके किए ऑर्डर का सामान्य डिलीवरी अपडेट। इसमें न कोई फ़ीस माँगी गई है, न कोई जानकारी, न कोई नया ऐप।',
      tip: 'अगर आपने कुछ ऑर्डर नहीं किया, तो डिलीवरी मैसेज अनदेखा करें। पार्सल स्कैम "आपका पार्सल रुका है" से शुरू होते हैं।',
    },
  },

  // ---------------------------------------------------------------- Level 2
  {
    id: 'digital-arrest-call',
    level: 2,
    channel: 'call',
    isScam: true,
    category: 'digital_arrest',
    time: '15:12',
    sender: { display: '+44 7700 900123' },
    en: {
      senderSub: 'Unknown caller · 06:42',
      lines: [
        { who: 'caller', text: 'Hello, this is Inspector Vikram Singh from Mumbai Cyber Crime Branch.' },
        { who: 'caller', text: 'A FedEx parcel with 200 grams of MDMA and five fake passports was seized. It was booked with your Aadhaar number.' },
        { who: 'you', text: 'What? I did not send any parcel.' },
        {
          who: 'caller',
          text: 'Your Aadhaar is also linked to a money laundering case. An arrest warrant is ready. To clear your name, join a Skype video call with the CBI officer now.',
        },
        { who: 'caller', text: 'Stay on camera, do not disconnect and do not tell anyone, not even your family. This is a confidential matter.' },
        { who: 'caller', text: 'To verify your funds, transfer your savings to the RBI safe account we give you. It will be returned in 24 hours.' },
      ],
      flags: [
        { on: 'sender', phrase: '+44 7700 900123', why: 'A foreign number for an Indian police case.' },
        { phrase: 'Inspector Vikram Singh from Mumbai Cyber Crime Branch', why: 'Police do not call about cases like this, and no officer questions you over Skype or WhatsApp.' },
        { phrase: 'booked with your Aadhaar number', why: 'A scary story built around your Aadhaar so it feels personal.' },
        { phrase: 'join a Skype video call', why: 'There is no "digital arrest" in Indian law. Nobody can arrest you on a video call.' },
        { phrase: 'do not tell anyone', why: 'Isolation is the key trick. Talking to family breaks the spell.' },
        { phrase: 'transfer your savings to the RBI safe account', why: 'No agency asks you to move money to "verify" it. This is where the money is stolen.' },
      ],
      explain: 'This is a "digital arrest" scam, one of India’s costliest. Victims are kept on video calls for hours, scared into transferring money.',
      tip: 'Hang up. Real police never arrest anyone on a video call or ask for money. Report the number on Chakshu, and call 1930 if you paid.',
    },
    hi: {
      senderSub: 'अनजान कॉलर · 06:42',
      lines: [
        { who: 'caller', text: 'हैलो, मैं मुंबई साइबर क्राइम ब्रांच से इंस्पेक्टर विक्रम सिंह बोल रहा हूँ।' },
        { who: 'caller', text: '200 ग्राम MDMA और पाँच नकली पासपोर्ट वाला एक FedEx पार्सल पकड़ा गया है। यह आपके आधार नंबर से बुक हुआ था।' },
        { who: 'you', text: 'क्या? मैंने तो कोई पार्सल नहीं भेजा।' },
        {
          who: 'caller',
          text: 'आपका आधार मनी लॉन्ड्रिंग केस से भी जुड़ा है। अरेस्ट वारंट तैयार है। अपना नाम साफ़ करने के लिए अभी CBI अफ़सर के साथ स्काइप वीडियो कॉल पर जुड़िए।',
        },
        { who: 'caller', text: 'कैमरे के सामने रहिए, कॉल मत काटिए और किसी को मत बताइए, परिवार को भी नहीं। यह गोपनीय मामला है।' },
        { who: 'caller', text: 'अपने पैसों की जाँच के लिए अपनी बचत हमारे दिए RBI सेफ़ अकाउंट में ट्रांसफ़र कीजिए। 24 घंटे में वापस मिल जाएगी।' },
      ],
      flags: [
        { on: 'sender', phrase: '+44 7700 900123', why: 'भारतीय पुलिस केस के लिए विदेशी नंबर।' },
        { phrase: 'मुंबई साइबर क्राइम ब्रांच से इंस्पेक्टर विक्रम सिंह', why: 'पुलिस ऐसे मामलों में फ़ोन नहीं करती, और कोई अफ़सर स्काइप या WhatsApp पर पूछताछ नहीं करता।' },
        { phrase: 'आपके आधार नंबर से बुक हुआ था', why: 'आपके आधार के नाम पर डराने वाली कहानी, ताकि बात निजी लगे।' },
        { phrase: 'स्काइप वीडियो कॉल पर जुड़िए', why: 'भारतीय कानून में "डिजिटल अरेस्ट" जैसा कुछ नहीं है। वीडियो कॉल पर कोई गिरफ़्तार नहीं कर सकता।' },
        { phrase: 'किसी को मत बताइए', why: 'अकेला कर देना ही असली चाल है। परिवार से बात करते ही जाल टूट जाता है।' },
        { phrase: 'RBI सेफ़ अकाउंट में ट्रांसफ़र कीजिए', why: 'कोई एजेंसी पैसों की "जाँच" के लिए उन्हें ट्रांसफ़र करने को नहीं कहती। यहीं पैसा चोरी होता है।' },
      ],
      explain: 'यह "डिजिटल अरेस्ट" स्कैम है, भारत के सबसे महँगे स्कैम में से एक। लोगों को घंटों वीडियो कॉल पर डराकर रखा जाता है, जब तक वे पैसे ट्रांसफ़र न कर दें।',
      tip: 'फ़ोन काट दें। असली पुलिस कभी वीडियो कॉल पर गिरफ़्तार नहीं करती और न पैसे माँगती है। नंबर की रिपोर्ट चक्षु पर करें, और पैसे गए हों तो 1930 पर कॉल करें।',
    },
  },
  {
    id: 'india-post-parcel',
    level: 2,
    channel: 'sms',
    isScam: true,
    category: 'courier_parcel',
    time: '20:48',
    sender: { display: '+91 81234 56789' },
    en: {
      messages: [
        {
          type: 'text',
          text: 'India Post: Your parcel is held at our warehouse due to an incomplete address. Update your address within 12 hours or it will be returned: https://indiapost-redelivery.in/track A small fee of ₹25 applies.',
        },
      ],
      flags: [
        { on: 'sender', phrase: '+91 81234 56789', why: 'India Post does not text from personal mobile numbers.' },
        { phrase: 'Your parcel is held', why: 'The hook of the parcel scam: you wonder which parcel, and tap.' },
        { phrase: 'within 12 hours', why: 'A rush to stop you from checking.' },
        { phrase: 'https://indiapost-redelivery.in/track', why: 'India Post’s site is indiapost.gov.in. This copycat domain collects card details.' },
        { phrase: 'A small fee of ₹25', why: 'The tiny fee is a trick to get your card number and OTP.' },
      ],
      explain: 'A fake India Post redelivery message. The "₹25 fee" page steals card details and OTPs, then much larger amounts are taken.',
      tip: 'Track parcels only on the official site or app, with the tracking number from the seller.',
    },
    hi: {
      messages: [
        {
          type: 'text',
          text: 'इंडिया पोस्ट: अधूरे पते की वजह से आपका पार्सल हमारे गोदाम में रुका हुआ है। 12 घंटे के अंदर पता अपडेट करें वरना पार्सल वापस भेज दिया जाएगा: https://indiapost-redelivery.in/track ₹25 का छोटा शुल्क लगेगा।',
        },
      ],
      flags: [
        { on: 'sender', phrase: '+91 81234 56789', why: 'इंडिया पोस्ट निजी मोबाइल नंबरों से SMS नहीं भेजता।' },
        { phrase: 'आपका पार्सल हमारे गोदाम में रुका हुआ है', why: 'पार्सल स्कैम का चारा: आप सोचते हैं कौन-सा पार्सल, और टैप कर देते हैं।' },
        { phrase: '12 घंटे के अंदर', why: 'जल्दबाज़ी, ताकि आप जाँच न करें।' },
        { phrase: 'https://indiapost-redelivery.in/track', why: 'इंडिया पोस्ट की साइट indiapost.gov.in है। यह नकली डोमेन कार्ड की जानकारी चुराता है।' },
        { phrase: '₹25 का छोटा शुल्क', why: 'छोटी-सी फ़ीस आपके कार्ड नंबर और OTP पाने की चाल है।' },
      ],
      explain: 'इंडिया पोस्ट के नाम पर नकली रीडिलीवरी मैसेज। "₹25 फ़ीस" वाला पेज कार्ड की जानकारी और OTP चुराता है, फिर कहीं बड़ी रकम निकाल ली जाती है।',
      tip: 'पार्सल सिर्फ़ ऑफ़िशियल साइट या ऐप पर ट्रैक करें, विक्रेता से मिले ट्रैकिंग नंबर से।',
    },
  },
  {
    id: 'mistake-refund',
    level: 2,
    channel: 'whatsapp',
    isScam: true,
    category: 'fake_refund',
    time: '16:33',
    sender: { display: '+91 98765 43210', profile: 'Rahul' },
    en: {
      messages: [
        { type: 'text', text: 'Hello ji, sorry to disturb. I sent ₹5,000 to your number by mistake while paying my brother 🙏' },
        { type: 'receipt', title: 'Payment successful', amount: '₹5,000' },
        {
          type: 'text',
          text: 'Please return it, my mother is in hospital. I have sent a request from refund.rahul@ybl, just approve it and enter your PIN.',
        },
      ],
      flags: [
        { phrase: 'I sent ₹5,000 to your number by mistake', why: 'The "sent by mistake" story. Check your bank app yourself: the money almost never arrived.' },
        { phrase: 'Payment successful', why: 'A screenshot proves nothing. It is easy to fake.' },
        { phrase: 'my mother is in hospital', why: 'An emotional story to rush you.' },
        { phrase: 'approve it and enter your PIN', why: 'Approving a request with your PIN sends money. You would be paying the scammer.' },
      ],
      explain: 'The fake refund trick. There was no ₹5,000. The request you are asked to approve takes your money.',
      tip: 'If someone says they paid you by mistake, check your balance yourself. If it really arrived, your bank can reverse it. Never approve a collect request.',
    },
    hi: {
      messages: [
        { type: 'text', text: 'नमस्ते जी, परेशान करने के लिए माफ़ी। भाई को पैसे भेजते वक़्त गलती से ₹5,000 आपके नंबर पर चले गए 🙏' },
        { type: 'receipt', title: 'पेमेंट सफल', amount: '₹5,000' },
        {
          type: 'text',
          text: 'प्लीज़ लौटा दीजिए, मेरी माँ अस्पताल में हैं। मैंने refund.rahul@ybl से रिक्वेस्ट भेजी है, बस उसे approve करके अपना PIN डाल दीजिए।',
        },
      ],
      flags: [
        { phrase: 'गलती से ₹5,000 आपके नंबर पर चले गए', why: '"गलती से भेज दिए" वाली कहानी। अपना बैंक ऐप खुद देखिए: पैसे लगभग कभी आए ही नहीं होते।' },
        { phrase: 'पेमेंट सफल', why: 'स्क्रीनशॉट से कुछ साबित नहीं होता। इसे नकली बनाना आसान है।' },
        { phrase: 'मेरी माँ अस्पताल में हैं', why: 'भावनात्मक कहानी, ताकि आप जल्दी करें।' },
        { phrase: 'approve करके अपना PIN डाल दीजिए', why: 'PIN डालकर रिक्वेस्ट approve करने से पैसे भेजे जाते हैं। आप ठग को पैसे दे देंगे।' },
      ],
      explain: 'यह नकली रिफ़ंड की चाल है। कोई ₹5,000 आए ही नहीं थे। जिस रिक्वेस्ट को approve करने को कहा जा रहा है, वह आपके पैसे ले जाएगी।',
      tip: 'कोई कहे कि गलती से पैसे भेज दिए, तो अपना बैलेंस खुद देखें। पैसे सच में आए हों, तो बैंक उन्हें लौटा सकता है। कलेक्ट रिक्वेस्ट कभी approve न करें।',
    },
  },
  {
    id: 'electricity-cut',
    level: 2,
    channel: 'sms',
    isScam: true,
    category: 'utility_disconnect',
    time: '18:02',
    sender: { display: '+91 90876 54321' },
    en: {
      messages: [
        {
          type: 'text',
          text: 'Dear Consumer, your electricity power will be disconnected tonight at 9:30 PM from the electricity office because your previous month bill was not updated. Please immediately contact our electricity officer 9087654321. Thank you.',
        },
      ],
      flags: [
        { on: 'sender', phrase: '+91 90876 54321', why: 'Electricity boards do not send disconnection notices from personal numbers.' },
        { phrase: 'disconnected tonight at 9:30 PM', why: 'A precise, scary deadline to make you call right away.' },
        { phrase: 'bill was not updated', why: 'Vague and wrong. Your power company bills you from its own header and app.' },
        { phrase: 'contact our electricity officer 9087654321', why: 'The "officer" will ask you to install an app or pay a small amount, then empty your account.' },
      ],
      explain: 'The electricity bill scam. The "officer" usually makes you install a screen sharing app or pay ₹10 through a link, then takes control.',
      tip: 'Check your bill in your electricity company’s official app or website. Never call numbers from such SMS.',
    },
    hi: {
      messages: [
        {
          type: 'text',
          text: 'प्रिय उपभोक्ता, आपका पिछले महीने का बिल अपडेट नहीं हुआ है, इसलिए आज रात 9:30 बजे बिजली दफ़्तर से आपकी बिजली काट दी जाएगी। कृपया तुरंत हमारे बिजली अधिकारी से 9087654321 पर संपर्क करें। धन्यवाद।',
        },
      ],
      flags: [
        { on: 'sender', phrase: '+91 90876 54321', why: 'बिजली बोर्ड निजी नंबरों से बिजली काटने का नोटिस नहीं भेजते।' },
        { phrase: 'आज रात 9:30 बजे', why: 'डराने वाली तय समय-सीमा, ताकि आप तुरंत कॉल करें।' },
        { phrase: 'बिल अपडेट नहीं हुआ है', why: 'धुंधली और गलत बात। बिजली कंपनी बिल अपने हेडर और ऐप से भेजती है।' },
        { phrase: 'बिजली अधिकारी से 9087654321 पर संपर्क करें', why: '"अधिकारी" आपसे कोई ऐप डलवाएगा या छोटी रकम भरवाएगा, फिर खाता खाली कर देगा।' },
      ],
      explain: 'यह बिजली बिल स्कैम है। "अधिकारी" आमतौर पर स्क्रीन शेयर करने वाला ऐप डलवाता है या लिंक से ₹10 भरवाता है, फिर फ़ोन पर कब्ज़ा कर लेता है।',
      tip: 'अपना बिल बिजली कंपनी के ऑफ़िशियल ऐप या वेबसाइट पर देखें। ऐसे SMS में दिए नंबरों पर कभी कॉल न करें।',
    },
  },
  {
    id: 'irctc-genuine',
    level: 2,
    channel: 'email',
    isScam: false,
    time: '22:10',
    sender: { display: 'IRCTC', email: 'ticketadmin@irctc.co.in' },
    en: {
      subject: 'Booking Confirmation: PNR 4521367890',
      body: [
        'Dear Passenger,',
        'Your e-ticket is booked. PNR: 4521367890, Train 12951 Mumbai Rajdhani, 15-Nov-2026, Class 3A, Status CNF/B4/23.',
        'You can view or cancel your ticket by logging in at www.irctc.co.in or in the IRCTC Rail Connect app.',
        'IRCTC never asks for your password, OTP or card details over phone or email.',
      ],
      flags: [
        { on: 'sender', phrase: 'ticketadmin@irctc.co.in', why: 'Sent from irctc.co.in, IRCTC’s official domain.' },
        { phrase: 'PNR: 4521367890', why: 'It matches a ticket you booked, and you can check the PNR yourself.' },
        { phrase: 'www.irctc.co.in', why: 'It points to the official website you already use.' },
        { phrase: 'IRCTC never asks for your password, OTP or card details', why: 'A genuine safety note, and it asks nothing of you.' },
      ],
      explain: 'A normal booking confirmation. No payment request, no urgent action, and an official domain.',
      tip: 'When in doubt, open the official app yourself and check the PNR there.',
    },
    hi: {
      subject: 'बुकिंग की पुष्टि: PNR 4521367890',
      body: [
        'प्रिय यात्री,',
        'आपका ई-टिकट बुक हो गया है। PNR: 4521367890, ट्रेन 12951 मुंबई राजधानी, 15-नवंबर-2026, क्लास 3A, स्टेटस CNF/B4/23।',
        'आप www.irctc.co.in पर लॉग इन करके या IRCTC Rail Connect ऐप में अपना टिकट देख या रद्द कर सकते हैं।',
        'IRCTC कभी फ़ोन या ईमेल पर आपका पासवर्ड, OTP या कार्ड की जानकारी नहीं माँगता।',
      ],
      flags: [
        { on: 'sender', phrase: 'ticketadmin@irctc.co.in', why: 'irctc.co.in से भेजा गया, जो IRCTC का ऑफ़िशियल डोमेन है।' },
        { phrase: 'PNR: 4521367890', why: 'यह आपके बुक किए टिकट से मेल खाता है, और PNR आप खुद जाँच सकते हैं।' },
        { phrase: 'www.irctc.co.in', why: 'यह उसी ऑफ़िशियल वेबसाइट पर भेजता है जो आप पहले से इस्तेमाल करते हैं।' },
        { phrase: 'IRCTC कभी फ़ोन या ईमेल पर आपका पासवर्ड, OTP या कार्ड की जानकारी नहीं माँगता', why: 'असली सुरक्षा चेतावनी, और आपसे कुछ भी नहीं माँगा गया।' },
      ],
      explain: 'यह सामान्य बुकिंग कन्फ़र्मेशन है। न पैसों की माँग, न जल्दबाज़ी, और ऑफ़िशियल डोमेन।',
      tip: 'शक हो तो ऑफ़िशियल ऐप खुद खोलें और वहाँ PNR जाँचें।',
    },
  },
  {
    id: 'bank-1600-call',
    level: 2,
    channel: 'call',
    isScam: false,
    time: '14:26',
    sender: { display: '1600 2104 567' },
    en: {
      senderSub: 'HDFC Bank · 01:12',
      lines: [
        { who: 'caller', text: 'Good afternoon, this is Meera calling from HDFC Bank credit card services.' },
        { who: 'caller', text: 'This is a reminder that your card bill of ₹8,240 is due on 5 November.' },
        { who: 'you', text: 'Okay. Do I need to share anything?' },
        {
          who: 'caller',
          text: 'No. Please don’t share any OTP, PIN or card number with anyone, including me. You can pay in the HDFC Bank app or through net banking.',
        },
        { who: 'caller', text: 'Thank you for your time. Have a good day.' },
      ],
      flags: [
        { on: 'sender', phrase: '1600 2104 567', why: 'Banks now call from the 1600 series that TRAI reserves for financial services.' },
        { phrase: 'don’t share any OTP, PIN or card number', why: 'A real bank tells you not to share secrets.' },
        { phrase: 'You can pay in the HDFC Bank app', why: 'It sends you to the official app, not to a link or a new number.' },
        { phrase: 'This is a reminder', why: 'Just information. No threat, no deadline pressure, no payment over the phone.' },
      ],
      explain: 'A routine bill reminder. It asks for nothing and points to the official app.',
      tip: 'Even on a genuine-looking call, never share an OTP or PIN. If unsure, hang up and call the number on the back of your card.',
    },
    hi: {
      senderSub: 'HDFC Bank · 01:12',
      lines: [
        { who: 'caller', text: 'नमस्ते, मैं HDFC Bank क्रेडिट कार्ड सर्विसेज़ से मीरा बोल रही हूँ।' },
        { who: 'caller', text: 'आपको याद दिलाना था कि आपके कार्ड का ₹8,240 का बिल 5 नवंबर को देय है।' },
        { who: 'you', text: 'ठीक है। क्या मुझे कुछ बताना होगा?' },
        {
          who: 'caller',
          text: 'नहीं। कृपया अपना OTP, PIN या कार्ड नंबर किसी को न बताएँ, मुझे भी नहीं। आप HDFC Bank ऐप या नेट बैंकिंग से भुगतान कर सकते हैं।',
        },
        { who: 'caller', text: 'समय देने के लिए धन्यवाद। आपका दिन शुभ हो।' },
      ],
      flags: [
        { on: 'sender', phrase: '1600 2104 567', why: 'बैंक अब 1600 सीरीज़ से कॉल करते हैं, जिसे TRAI ने वित्तीय सेवाओं के लिए तय किया है।' },
        { phrase: 'अपना OTP, PIN या कार्ड नंबर किसी को न बताएँ', why: 'असली बैंक आपसे गोपनीय जानकारी न बताने को कहता है।' },
        { phrase: 'आप HDFC Bank ऐप या नेट बैंकिंग से भुगतान कर सकते हैं', why: 'यह आपको ऑफ़िशियल ऐप पर भेजता है, किसी लिंक या नए नंबर पर नहीं।' },
        { phrase: 'आपको याद दिलाना था', why: 'सिर्फ़ जानकारी। न धमकी, न डेडलाइन का दबाव, न फ़ोन पर भुगतान।' },
      ],
      explain: 'यह बिल का सामान्य रिमाइंडर है। इसमें कुछ नहीं माँगा गया और ऑफ़िशियल ऐप पर भेजा गया है।',
      tip: 'असली लगने वाली कॉल पर भी कभी OTP या PIN न बताएँ। शक हो तो फ़ोन काटें और कार्ड के पीछे लिखे नंबर पर कॉल करें।',
    },
  },
  {
    id: 'tax-refund-email',
    level: 2,
    channel: 'email',
    isScam: true,
    category: 'tax_refund',
    time: '07:55',
    sender: { display: 'Income Tax Department', email: 'refund-alert@itd-refunds.in' },
    en: {
      subject: 'Income Tax Refund of ₹15,490 approved',
      body: [
        'Dear Taxpayer,',
        'After the last annual calculation of your fiscal activity, you are eligible to receive a tax refund of ₹15,490.',
        'Please verify your bank account within 48 hours to receive the refund. Enter your net banking details and the OTP you receive.',
        'Verify now: https://incometax-refund.web.app/verify',
      ],
      cta: 'Verify bank account',
      flags: [
        { on: 'sender', phrase: 'refund-alert@itd-refunds.in', why: 'The Income Tax Department uses incometax.gov.in. This look-alike domain is fake.' },
        { phrase: 'within 48 hours', why: 'A deadline to rush you.' },
        { phrase: 'Enter your net banking details and the OTP', why: 'No department needs your net banking password or OTP to pay a refund.' },
        { phrase: 'https://incometax-refund.web.app/verify', why: 'A free web.app site pretending to be the tax department.' },
      ],
      explain: 'A tax refund phishing email. Real refunds go straight to your pre-validated bank account with no action needed.',
      tip: 'Check refund status only by logging in at incometax.gov.in yourself.',
    },
    hi: {
      senderName: 'आयकर विभाग',
      subject: '₹15,490 का इनकम टैक्स रिफ़ंड मंज़ूर',
      body: [
        'प्रिय करदाता,',
        'आपकी वित्तीय गतिविधि की पिछली सालाना गणना के बाद, आप ₹15,490 का टैक्स रिफ़ंड पाने के हक़दार हैं।',
        'रिफ़ंड पाने के लिए 48 घंटे के अंदर अपना बैंक खाता वेरिफ़ाई करें। अपनी नेट बैंकिंग की जानकारी और मिलने वाला OTP डालें।',
        'अभी वेरिफ़ाई करें: https://incometax-refund.web.app/verify',
      ],
      cta: 'बैंक खाता वेरिफ़ाई करें',
      flags: [
        { on: 'sender', phrase: 'refund-alert@itd-refunds.in', why: 'आयकर विभाग incometax.gov.in इस्तेमाल करता है। यह मिलता-जुलता डोमेन नकली है।' },
        { phrase: '48 घंटे के अंदर', why: 'जल्दबाज़ी करवाने के लिए डेडलाइन।' },
        { phrase: 'अपनी नेट बैंकिंग की जानकारी और मिलने वाला OTP डालें', why: 'रिफ़ंड देने के लिए किसी विभाग को आपके नेट बैंकिंग पासवर्ड या OTP की ज़रूरत नहीं होती।' },
        { phrase: 'https://incometax-refund.web.app/verify', why: 'मुफ़्त web.app साइट, जो टैक्स विभाग होने का दिखावा कर रही है।' },
      ],
      explain: 'यह टैक्स रिफ़ंड के नाम पर फ़िशिंग ईमेल है। असली रिफ़ंड बिना कुछ किए सीधे आपके पहले से वेरिफ़ाइड बैंक खाते में आता है।',
      tip: 'रिफ़ंड का स्टेटस सिर्फ़ incometax.gov.in पर खुद लॉग इन करके देखें।',
    },
  },

  // ---------------------------------------------------------------- Level 3
  {
    id: 'investment-vip-group',
    level: 3,
    channel: 'whatsapp',
    isScam: true,
    category: 'investment',
    time: '07:30',
    sender: { display: 'NSE Wealth Club VIP', group: true },
    en: {
      senderSub: 'Prof. Anand Mehta, You and 482 others',
      messages: [
        { type: 'text', author: 'Prof. Anand Mehta', text: 'Good morning family! Yesterday our members made 18% profit on just one IPO allotment 🚀' },
        { type: 'text', author: 'Prof. Anand Mehta', text: 'We are a SEBI registered advisory. Our institutional trading app gives guaranteed 300% returns in 30 days.' },
        {
          type: 'text',
          author: 'Prof. Anand Mehta',
          text: 'Only 20 VIP slots left today. Download our app: nsewealth-pro.com/app and start with just ₹10,000. Withdrawals are instant.',
        },
      ],
      flags: [
        { phrase: 'guaranteed 300% returns', why: 'No real investment guarantees returns, let alone 300% in a month.' },
        { phrase: 'SEBI registered advisory', why: 'Anyone can claim it. Check the name on sebi.gov.in yourself. Real advisers never promise fixed profits.' },
        { phrase: 'institutional trading app', why: 'Fake trading apps show fake profits. You can deposit, but you will never withdraw.' },
        { phrase: 'Only 20 VIP slots left today', why: 'False scarcity to make you hurry.' },
        { phrase: 'IPO allotment', why: 'Promises of sure IPO allotment are a common hook in these groups.' },
      ],
      explain: 'An investment group scam. Early "profits" appear on screen, then withdrawals are blocked with fees and "taxes" until you give up.',
      tip: 'Invest only through SEBI-registered brokers you open yourself. Leave and report such groups.',
    },
    hi: {
      senderSub: 'प्रो. आनंद मेहता, आप और 482 अन्य',
      messages: [
        { type: 'text', author: 'प्रो. आनंद मेहता', text: 'सुप्रभात परिवार! कल हमारे सदस्यों ने सिर्फ़ एक IPO allotment पर 18% मुनाफ़ा कमाया 🚀' },
        { type: 'text', author: 'प्रो. आनंद मेहता', text: 'हम SEBI रजिस्टर्ड एडवाइज़री हैं। हमारा इंस्टिट्यूशनल ट्रेडिंग ऐप 30 दिन में 300% पक्का रिटर्न देता है।' },
        {
          type: 'text',
          author: 'प्रो. आनंद मेहता',
          text: 'आज सिर्फ़ 20 VIP स्लॉट बचे हैं। हमारा ऐप डाउनलोड करें: nsewealth-pro.com/app और सिर्फ़ ₹10,000 से शुरू करें। पैसे निकालना तुरंत।',
        },
      ],
      flags: [
        { phrase: '300% पक्का रिटर्न', why: 'कोई भी असली निवेश पक्के रिटर्न की गारंटी नहीं देता, एक महीने में 300% तो बिल्कुल नहीं।' },
        { phrase: 'SEBI रजिस्टर्ड एडवाइज़री', why: 'यह दावा कोई भी कर सकता है। नाम खुद sebi.gov.in पर जाँचें। असली सलाहकार तय मुनाफ़े का वादा नहीं करते।' },
        { phrase: 'इंस्टिट्यूशनल ट्रेडिंग ऐप', why: 'नकली ट्रेडिंग ऐप नकली मुनाफ़ा दिखाते हैं। पैसे डाल सकते हैं, पर कभी निकाल नहीं पाएँगे।' },
        { phrase: 'आज सिर्फ़ 20 VIP स्लॉट बचे हैं', why: 'झूठी कमी, ताकि आप जल्दी करें।' },
        { phrase: 'IPO allotment', why: 'पक्के IPO allotment का वादा ऐसे ग्रुप्स का आम चारा है।' },
      ],
      explain: 'यह निवेश ग्रुप स्कैम है। शुरू में स्क्रीन पर "मुनाफ़ा" दिखता है, फिर पैसे निकालने पर फ़ीस और "टैक्स" के नाम पर रोक लगती है, जब तक आप हार न मान लें।',
      tip: 'सिर्फ़ उन्हीं SEBI-रजिस्टर्ड ब्रोकर्स से निवेश करें जिन्हें आप खुद चुनें। ऐसे ग्रुप छोड़ें और रिपोर्ट करें।',
    },
  },
  {
    id: 'reward-points',
    level: 3,
    channel: 'sms',
    isScam: true,
    category: 'reward_points',
    time: '12:18',
    sender: { display: '+91 74288 31122' },
    en: {
      messages: [
        {
          type: 'text',
          text: 'HDFC Bank: Your credit card reward points worth Rs 7,850 will expire today. Redeem them now as cash in your account: https://hdfcbank-rewardz.in/redeem',
        },
      ],
      flags: [
        { on: 'sender', phrase: '+91 74288 31122', why: 'Banks do not send reward alerts from personal numbers.' },
        { phrase: 'will expire today', why: 'Expiry pressure. Points never need to be "redeemed as cash" through a link.' },
        { phrase: 'Redeem them now as cash', why: 'The page will ask for card number, expiry, CVV and OTP. That is all a scammer needs.' },
        { phrase: 'https://hdfcbank-rewardz.in/redeem', why: 'Not HDFC Bank’s site (hdfcbank.com). The extra "z" and different domain mark a look-alike.' },
      ],
      explain: 'A reward points phishing SMS. The fake redemption page captures your full card details.',
      tip: 'Check reward points only in your bank app or the official website you type yourself.',
    },
    hi: {
      messages: [
        {
          type: 'text',
          text: 'HDFC Bank: आपके क्रेडिट कार्ड के Rs 7,850 के रिवॉर्ड पॉइंट आज खत्म हो जाएँगे। अभी इन्हें कैश के रूप में अपने खाते में रिडीम करें: https://hdfcbank-rewardz.in/redeem',
        },
      ],
      flags: [
        { on: 'sender', phrase: '+91 74288 31122', why: 'बैंक निजी नंबरों से रिवॉर्ड अलर्ट नहीं भेजते।' },
        { phrase: 'आज खत्म हो जाएँगे', why: 'खत्म होने का दबाव। रिवॉर्ड पॉइंट कभी लिंक से "कैश में रिडीम" नहीं करने पड़ते।' },
        { phrase: 'कैश के रूप में अपने खाते में रिडीम करें', why: 'पेज आपसे कार्ड नंबर, एक्सपायरी, CVV और OTP माँगेगा। ठग को बस इतना ही चाहिए।' },
        { phrase: 'https://hdfcbank-rewardz.in/redeem', why: 'यह HDFC Bank की साइट (hdfcbank.com) नहीं है। अतिरिक्त "z" और अलग डोमेन नकली होने का निशान है।' },
      ],
      explain: 'यह रिवॉर्ड पॉइंट के नाम पर फ़िशिंग SMS है। नकली रिडेम्पशन पेज आपके कार्ड की पूरी जानकारी ले लेता है।',
      tip: 'रिवॉर्ड पॉइंट सिर्फ़ बैंक के ऐप या खुद टाइप की हुई ऑफ़िशियल वेबसाइट पर देखें।',
    },
  },
  {
    id: 'hi-mom',
    level: 3,
    channel: 'whatsapp',
    isScam: true,
    category: 'impersonation',
    time: '13:07',
    sender: { display: '+91 99887 76655', profile: 'Rohan' },
    en: {
      messages: [
        { type: 'text', text: 'Mumma it’s me Rohan, this is my new number. My phone fell in water 😥' },
        { type: 'text', text: 'I have to pay my exam fee today, the portal closes at 5 pm. Can you send ₹15,000 urgently? I will return it tonight.' },
        { type: 'text', text: 'Send to this UPI: rohan.fees2026@okaxis. Please don’t call, my mic is not working, just send fast.' },
      ],
      flags: [
        { on: 'sender', phrase: '+91 99887 76655', why: 'An unknown number claiming to be your son.' },
        { phrase: 'this is my new number', why: 'The classic opener of "family in trouble" scams.' },
        { phrase: 'send ₹15,000 urgently', why: 'An urgent money request with a deadline.' },
        { phrase: 'Please don’t call', why: 'The scammer cannot let you hear the voice. Call the old number before paying.' },
        { phrase: 'rohan.fees2026@okaxis', why: 'A payment ID you have never used for your child.' },
      ],
      explain: 'An impersonation scam. Scammers pose as a child, relative or boss with a "new number" and a sudden emergency.',
      tip: 'Always call the person on their old number, or ask a question only they would know.',
    },
    hi: {
      messages: [
        { type: 'text', text: 'मम्मी मैं रोहन, यह मेरा नया नंबर है। मेरा फ़ोन पानी में गिर गया 😥' },
        { type: 'text', text: 'आज मुझे परीक्षा की फ़ीस भरनी है, पोर्टल शाम 5 बजे बंद हो जाएगा। क्या तुम ₹15,000 तुरंत भेज सकती हो? आज रात लौटा दूँगा।' },
        { type: 'text', text: 'इस UPI पर भेज दो: rohan.fees2026@okaxis प्लीज़ कॉल मत करना, मेरा माइक नहीं चल रहा, बस जल्दी भेज दो।' },
      ],
      flags: [
        { on: 'sender', phrase: '+91 99887 76655', why: 'अनजान नंबर, जो आपका बेटा होने का दावा कर रहा है।' },
        { phrase: 'यह मेरा नया नंबर है', why: '"परिवार मुसीबत में है" वाले स्कैम की यही पहचान है।' },
        { phrase: '₹15,000 तुरंत भेज सकती हो', why: 'जल्दबाज़ी में पैसों की माँग, साथ में डेडलाइन।' },
        { phrase: 'प्लीज़ कॉल मत करना', why: 'ठग नहीं चाहता कि आप आवाज़ सुनें। पैसे भेजने से पहले पुराने नंबर पर कॉल करें।' },
        { phrase: 'rohan.fees2026@okaxis', why: 'ऐसी पेमेंट आईडी जिस पर आपने अपने बच्चे को कभी पैसे नहीं भेजे।' },
      ],
      explain: 'यह पहचान बदलकर ठगने का स्कैम है। ठग "नए नंबर" और अचानक आई मुसीबत के बहाने बच्चा, रिश्तेदार या बॉस बनकर पैसे माँगते हैं।',
      tip: 'हमेशा उस व्यक्ति के पुराने नंबर पर कॉल करें, या ऐसा सवाल पूछें जिसका जवाब सिर्फ़ वही जानता हो।',
    },
  },
  {
    id: 'anydesk-support-call',
    level: 3,
    channel: 'call',
    isScam: true,
    category: 'remote_access',
    time: '11:20',
    sender: { display: '+91 70004 55667' },
    en: {
      senderSub: 'Unknown caller · 04:18',
      lines: [
        { who: 'caller', text: 'Hello sir, I am calling from Amazon customer care. Your refund of ₹2,999 for the cancelled order is pending.' },
        { who: 'you', text: 'Oh, okay. What do I need to do?' },
        { who: 'caller', text: 'To process it quickly, please install the AnyDesk app from Play Store. It is our secure refund app.' },
        { who: 'caller', text: 'Now tell me the 9-digit code shown on your screen, and open your UPI app so I can guide you.' },
        { who: 'caller', text: 'Enter ₹2,999 and your PIN to receive the refund. Don’t worry, I can see your screen.' },
      ],
      flags: [
        { on: 'sender', phrase: '+91 70004 55667', why: 'A random mobile number posing as customer care.' },
        { phrase: 'calling from Amazon customer care', why: 'Companies do not call about refunds from mobile numbers. Refunds come back by themselves.' },
        { phrase: 'install the AnyDesk app', why: 'AnyDesk, TeamViewer and QuickSupport let a stranger see and control your phone.' },
        { phrase: 'tell me the 9-digit code', why: 'That code opens your screen to them, bank apps included.' },
        { phrase: 'your PIN to receive the refund', why: 'Entering a PIN always sends money. You never need it to receive a refund.' },
      ],
      explain: 'A fake customer care scam using a screen sharing app. Once connected, they watch you type PINs and OTPs.',
      tip: 'Find customer care only inside the official app or website. If you installed AnyDesk for a caller, uninstall it now and call your bank.',
    },
    hi: {
      senderSub: 'अनजान कॉलर · 04:18',
      lines: [
        { who: 'caller', text: 'हैलो सर, मैं Amazon कस्टमर केयर से बोल रहा हूँ। कैंसल हुए ऑर्डर का आपका ₹2,999 का रिफ़ंड पेंडिंग है।' },
        { who: 'you', text: 'अच्छा, ठीक है। मुझे क्या करना होगा?' },
        { who: 'caller', text: 'जल्दी प्रोसेस करने के लिए प्ले स्टोर से AnyDesk ऐप इंस्टॉल कर लीजिए। यह हमारा सुरक्षित रिफ़ंड ऐप है।' },
        { who: 'caller', text: 'अब स्क्रीन पर दिख रहा 9 अंकों का कोड बताइए, और अपना UPI ऐप खोलिए ताकि मैं आपको गाइड कर सकूँ।' },
        { who: 'caller', text: 'रिफ़ंड पाने के लिए ₹2,999 और अपना PIN डालिए। चिंता मत कीजिए, मैं आपकी स्क्रीन देख पा रहा हूँ।' },
      ],
      flags: [
        { on: 'sender', phrase: '+91 70004 55667', why: 'कस्टमर केयर बनकर आया अनजान मोबाइल नंबर।' },
        { phrase: 'Amazon कस्टमर केयर से बोल रहा हूँ', why: 'कंपनियाँ रिफ़ंड के लिए मोबाइल नंबरों से कॉल नहीं करतीं। रिफ़ंड अपने आप वापस आता है।' },
        { phrase: 'AnyDesk ऐप इंस्टॉल कर लीजिए', why: 'AnyDesk, TeamViewer और QuickSupport से कोई अनजान व्यक्ति आपका फ़ोन देख और चला सकता है।' },
        { phrase: '9 अंकों का कोड बताइए', why: 'यह कोड उन्हें आपकी स्क्रीन तक पहुँच देता है, बैंक ऐप समेत।' },
        { phrase: 'रिफ़ंड पाने के लिए ₹2,999 और अपना PIN डालिए', why: 'PIN डालने से हमेशा पैसे जाते हैं। रिफ़ंड पाने के लिए इसकी कभी ज़रूरत नहीं होती।' },
      ],
      explain: 'यह स्क्रीन शेयरिंग ऐप वाला नकली कस्टमर केयर स्कैम है। कनेक्ट होते ही वे आपको PIN और OTP टाइप करते देखते हैं।',
      tip: 'कस्टमर केयर का नंबर सिर्फ़ ऑफ़िशियल ऐप या वेबसाइट के अंदर देखें। किसी कॉलर के कहने पर AnyDesk डाला है, तो अभी हटाएँ और बैंक को कॉल करें।',
    },
  },
  {
    id: 'kyc-genuine-hdfc',
    level: 3,
    channel: 'sms',
    isScam: false,
    time: '10:00',
    sender: { display: 'VM-HDFCBK' },
    en: {
      messages: [
        {
          type: 'text',
          text: 'Dear Customer, as per RBI guidelines your KYC is due for periodic update. Please update it at your nearest HDFC Bank branch or through NetBanking at hdfcbank.com. HDFC Bank never asks for your OTP, PIN or password. Ignore if already updated.',
        },
      ],
      flags: [
        { on: 'sender', phrase: 'VM-HDFCBK', why: 'A registered bank header.' },
        { phrase: 'nearest HDFC Bank branch', why: 'It points to the branch or the official website, with no link to tap.' },
        { phrase: 'hdfcbank.com', why: 'HDFC Bank’s real website, written as a plain address.' },
        { phrase: 'HDFC Bank never asks for your OTP, PIN or password', why: 'A genuine safety reminder.' },
        { phrase: 'Ignore if already updated', why: 'No threat of blocking, no deadline today.' },
      ],
      explain: 'Banks do send periodic KYC reminders. This one is calm, has no link to tap, and sends you to official channels you choose yourself.',
      tip: 'Even with a real reminder, update KYC at the branch or by typing the official website yourself.',
    },
    hi: {
      messages: [
        {
          type: 'text',
          text: 'प्रिय ग्राहक, RBI के दिशानिर्देशों के अनुसार आपका KYC समय-समय पर अपडेट होना है। कृपया इसे अपनी नज़दीकी HDFC Bank शाखा में या hdfcbank.com पर NetBanking से अपडेट करें। HDFC Bank कभी आपका OTP, PIN या पासवर्ड नहीं माँगता। पहले से अपडेट है तो इसे अनदेखा करें।',
        },
      ],
      flags: [
        { on: 'sender', phrase: 'VM-HDFCBK', why: 'रजिस्टर्ड बैंक हेडर।' },
        { phrase: 'नज़दीकी HDFC Bank शाखा', why: 'यह शाखा या ऑफ़िशियल वेबसाइट पर भेजता है, टैप करने के लिए कोई लिंक नहीं।' },
        { phrase: 'hdfcbank.com', why: 'HDFC Bank की असली वेबसाइट, सादे पते के रूप में।' },
        { phrase: 'HDFC Bank कभी आपका OTP, PIN या पासवर्ड नहीं माँगता', why: 'असली सुरक्षा याद दिलाना।' },
        { phrase: 'पहले से अपडेट है तो इसे अनदेखा करें', why: 'न खाता ब्लॉक करने की धमकी, न आज की डेडलाइन।' },
      ],
      explain: 'बैंक समय-समय पर KYC के रिमाइंडर भेजते हैं। यह मैसेज शांत है, इसमें टैप करने को कोई लिंक नहीं है, और यह आपको उन ऑफ़िशियल रास्तों पर भेजता है जिन्हें आप खुद चुनते हैं।',
      tip: 'असली रिमाइंडर हो, तब भी KYC शाखा जाकर या ऑफ़िशियल वेबसाइट खुद टाइप करके ही अपडेट करें।',
    },
  },
  {
    id: 'friend-split-collect',
    level: 3,
    channel: 'payment',
    isScam: false,
    time: '21:44',
    sender: { display: 'Rahul Sharma', vpa: 'rahul.sharma@okaxis', contact: true },
    amount: 350,
    en: {
      note: 'Pizza split from Saturday',
      flags: [
        { on: 'sender', phrase: 'Rahul Sharma', why: 'A friend in your contacts, for an amount you agreed.' },
        { phrase: 'Pizza split from Saturday', why: 'You know exactly what this payment is for.' },
        { on: 'pay', phrase: 'Pay', why: 'Here paying is what you want: you owe ₹350. A collect request is always a payment from you.' },
      ],
      explain: 'A normal split-the-bill request from a friend. You are paying on purpose, for something you know.',
      tip: 'Approve a request only when you know the person and mean to pay. "Receive money" requests do not exist.',
    },
    hi: {
      note: 'शनिवार वाले पिज़्ज़ा का हिस्सा',
      flags: [
        { on: 'sender', phrase: 'Rahul Sharma', why: 'आपके कॉन्टैक्ट में मौजूद दोस्त, उतनी ही रकम जिस पर बात हुई थी।' },
        { phrase: 'शनिवार वाले पिज़्ज़ा का हिस्सा', why: 'आपको ठीक-ठीक पता है कि यह पेमेंट किसलिए है।' },
        { on: 'pay', phrase: 'Pay', why: 'यहाँ पैसे भेजना ही आपका इरादा है: आपको ₹350 देने हैं। कलेक्ट रिक्वेस्ट हमेशा आपकी तरफ़ से पेमेंट होती है।' },
      ],
      explain: 'दोस्त की तरफ़ से बिल बाँटने की सामान्य रिक्वेस्ट। आप जान-बूझकर, एक जानी हुई चीज़ के लिए पैसे दे रहे हैं।',
      tip: 'रिक्वेस्ट तभी approve करें जब आप व्यक्ति को जानते हों और सच में पैसे देना चाहते हों। "पैसे पाने" वाली रिक्वेस्ट जैसी कोई चीज़ नहीं होती।',
    },
  },
  {
    id: 'loan-apk',
    level: 3,
    channel: 'whatsapp',
    isScam: true,
    category: 'loan_app',
    time: '23:12',
    sender: { display: '+91 88776 65544', profile: 'QuickCash Loans' },
    en: {
      messages: [
        { type: 'text', text: 'Need money urgently? Get an instant loan up to ₹50,000 in 5 minutes. No documents, no CIBIL check!' },
        { type: 'file', name: 'QuickCash_Loan.apk', size: '12 MB' },
        { type: 'text', text: 'Install the app and allow access to contacts and gallery for fast approval.' },
      ],
      flags: [
        { phrase: 'No documents, no CIBIL check', why: 'Legal lenders always check identity and credit. "No checks" means an illegal loan app.' },
        { phrase: 'QuickCash_Loan.apk', why: 'An app file sent on WhatsApp, outside the Play Store. It can read your messages and OTPs.' },
        { phrase: 'allow access to contacts and gallery', why: 'Illegal loan apps use your contacts and photos to harass and blackmail you.' },
        { phrase: 'in 5 minutes', why: 'Too fast to be true, and made for people in a hurry.' },
      ],
      explain: 'An illegal loan app scam. After a small loan they demand huge "interest" and threaten to send morphed photos to your contacts.',
      tip: 'Borrow only from RBI-registered lenders, with apps from the official Play Store. Never install .apk files sent in chats.',
    },
    hi: {
      messages: [
        { type: 'text', text: 'पैसों की तुरंत ज़रूरत है? 5 मिनट में ₹50,000 तक का इंस्टेंट लोन पाएँ। न कोई दस्तावेज़, न CIBIL चेक!' },
        { type: 'file', name: 'QuickCash_Loan.apk', size: '12 MB' },
        { type: 'text', text: 'ऐप इंस्टॉल करें और जल्दी मंज़ूरी के लिए कॉन्टैक्ट्स और गैलरी का एक्सेस दें।' },
      ],
      flags: [
        { phrase: 'न कोई दस्तावेज़, न CIBIL चेक', why: 'क़ानूनी कर्ज़ देने वाले हमेशा पहचान और क्रेडिट जाँचते हैं। "कोई जाँच नहीं" का मतलब ग़ैरक़ानूनी लोन ऐप।' },
        { phrase: 'QuickCash_Loan.apk', why: 'WhatsApp पर भेजी गई ऐप फ़ाइल, प्ले स्टोर से बाहर। यह आपके मैसेज और OTP पढ़ सकती है।' },
        { phrase: 'कॉन्टैक्ट्स और गैलरी का एक्सेस दें', why: 'ग़ैरक़ानूनी लोन ऐप आपके कॉन्टैक्ट्स और फ़ोटो से आपको परेशान और ब्लैकमेल करते हैं।' },
        { phrase: '5 मिनट में', why: 'इतना तेज़ कि सच नहीं हो सकता, और जल्दी में फँसे लोगों के लिए बनाया गया।' },
      ],
      explain: 'यह ग़ैरक़ानूनी लोन ऐप स्कैम है। छोटे लोन के बाद भारी "ब्याज" माँगा जाता है और बदली हुई (मॉर्फ़्ड) फ़ोटो कॉन्टैक्ट्स को भेजने की धमकी दी जाती है।',
      tip: 'सिर्फ़ RBI-रजिस्टर्ड कर्ज़दाताओं से, ऑफ़िशियल प्ले स्टोर के ऐप से ही लोन लें। चैट में भेजी गई .apk फ़ाइल कभी इंस्टॉल न करें।',
    },
  },
];

export function scenariosForLevel(level: Level): Scenario[] {
  return SCENARIOS.filter((s) => s.level === level);
}

export function contentFor(s: Scenario, locale: Locale): ScenarioContent {
  return locale === 'hi' ? s.hi : s.en;
}

/** All searchable text of a scenario in one language (flags with on:'content' must be found here). */
export function contentText(s: Scenario, locale: Locale): string {
  const c = contentFor(s, locale);
  const parts: string[] = [];
  for (const m of c.messages ?? []) {
    if (m.type === 'text') parts.push(m.text, m.author ?? '');
    else if (m.type === 'receipt') parts.push(m.title, m.amount);
    else parts.push(m.name);
  }
  parts.push(c.subject ?? '', ...(c.body ?? []), c.cta ?? '', c.note ?? '');
  for (const l of c.lines ?? []) parts.push(l.text);
  return parts.join('\n');
}

export function senderText(s: Scenario, locale: Locale): string {
  const c = contentFor(s, locale);
  return [c.senderName ?? s.sender.display, s.sender.email ?? '', s.sender.vpa ?? '', s.sender.profile ?? ''].join('\n');
}
