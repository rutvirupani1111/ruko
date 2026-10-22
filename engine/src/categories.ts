/**
 * The scam encyclopedia that powers the Learn pages: what each scam is, how it
 * works, its red flags and what to do, in English and Hindi.
 */
import type { CategoryInfo, ScamCategory, Severity } from './types';
import { SHORT } from './shorts';

type Row = {
  id: ScamCategory;
  severity: Severity;
  name: [string, string];
  how: Array<[string, string]>;
  flags: Array<[string, string]>;
  todo: Array<[string, string]>;
};

const ROWS: Row[] = [
  {
    id: 'digital_arrest',
    severity: 'critical',
    name: ['Digital arrest', 'डिजिटल अरेस्ट'],
    how: [
      ["You get a call or recorded message from 'FedEx', 'TRAI' or 'customs' saying a parcel or SIM in your name is linked to a crime.", "आपके पास 'FedEx', 'TRAI' या 'कस्टम' के नाम से कॉल या रिकॉर्डेड मैसेज आता है कि आपके नाम का कोई पार्सल या सिम किसी अपराध से जुड़ा है।"],
      ['The call is passed to a fake police, CBI, ED or NCB officer, often on Skype or WhatsApp video, sometimes from a set that looks like a police station.', 'फिर कॉल किसी नकली पुलिस, CBI, ED या NCB अधिकारी को दे दी जाती है, अक्सर Skype या WhatsApp वीडियो पर, कभी-कभी थाने जैसे दिखने वाले सेट से।'],
      ["They show fake warrants and ID cards, say you are under 'digital arrest', and order you to stay on camera and tell no one.", "वे नकली वारंट और ID कार्ड दिखाते हैं, कहते हैं कि आप 'डिजिटल अरेस्ट' में हैं, और कैमरे के सामने बैठे रहने व किसी को न बताने का हुक्म देते हैं।"],
      ["To 'clear your name' you are told to move your savings to a 'safe' or 'RBI verification' account. The money is gone within minutes.", "'नाम साफ़ करने' के लिए आपसे अपनी जमा-पूँजी किसी 'सेफ़' या 'RBI वेरिफ़िकेशन' खाते में भेजने को कहा जाता है। पैसा मिनटों में ग़ायब हो जाता है।"],
    ],
    flags: [
      ['Police, CBI or customs calling about a parcel, SIM or Aadhaar in your name', 'आपके नाम के पार्सल, सिम या आधार को लेकर पुलिस, CBI या कस्टम का फ़ोन'],
      ["The words 'digital arrest' (it does not exist in Indian law)", "'डिजिटल अरेस्ट' शब्द (भारतीय क़ानून में ऐसा कुछ होता ही नहीं)"],
      ['Being told to stay on a video call and not disconnect', 'वीडियो कॉल पर बने रहने और कॉल न काटने का हुक्म'],
      ['Being told not to tell your family or anyone else', 'परिवार या किसी और को न बताने की हिदायत'],
      ['Fake arrest warrants or court orders sent on WhatsApp', 'WhatsApp पर भेजे गए नकली गिरफ़्तारी वारंट या कोर्ट ऑर्डर'],
      ["A request to transfer money for 'verification' or 'bail'", "'वेरिफ़िकेशन' या 'ज़मानत' के नाम पर पैसे ट्रांसफ़र करने की माँग"],
    ],
    todo: [
      ['Hang up. Real police never arrest or question anyone over a video call.', 'फ़ोन काट दें। असली पुलिस वीडियो कॉल पर न गिरफ़्तार करती है, न पूछताछ।'],
      ['Talk to a family member or friend right away. Scammers depend on you staying alone.', 'तुरंत परिवार के किसी सदस्य या दोस्त से बात करें। ठग इसी भरोसे पर चलते हैं कि आप अकेले रहें।'],
      ["Never transfer money to any 'safe' or 'verification' account.", "किसी भी 'सेफ़' या 'वेरिफ़िकेशन' खाते में पैसे कभी न भेजें।"],
      ['Call 1930 and report at cybercrime.gov.in, even if you have not paid.', '1930 पर कॉल करें और cybercrime.gov.in पर शिकायत करें, भले ही आपने पैसे न दिए हों।'],
      ['Report the number on Chakshu at sancharsaathi.gov.in.', 'नंबर की शिकायत sancharsaathi.gov.in पर चक्षु में करें।'],
    ],
  },
  {
    id: 'kyc_update',
    severity: 'high',
    name: ['Fake KYC update', 'फ़र्ज़ी KYC अपडेट'],
    how: [
      ['An SMS or WhatsApp message says your bank KYC, PAN or Aadhaar link has expired and your account will be blocked today.', 'SMS या WhatsApp पर मैसेज आता है कि आपका बैंक KYC, PAN या आधार लिंक एक्सपायर हो गया है और आज खाता बंद हो जाएगा।'],
      ["The link opens a page that copies your bank's login screen, or asks you to install an app or call a number.", 'लिंक खोलने पर बैंक के लॉगिन पेज जैसा नकली पेज खुलता है, या कोई ऐप डालने या किसी नंबर पर कॉल करने को कहा जाता है।'],
      ['You enter your login, card details and OTP, and the scammer empties your account within minutes.', 'आप लॉगिन, कार्ड की जानकारी और OTP डालते हैं, और ठग मिनटों में खाता खाली कर देता है।'],
    ],
    flags: [
      ["'Your account will be blocked today' or a deadline in hours", "'आज आपका खाता बंद हो जाएगा' या कुछ घंटों की समय-सीमा"],
      ['A link to update KYC, PAN or Aadhaar', 'KYC, PAN या आधार अपडेट करने का लिंक'],
      ["A link that is not your bank's official website, or a short link", 'ऐसा लिंक जो बैंक की आधिकारिक वेबसाइट का न हो, या छोटा किया हुआ लिंक'],
      ["A message from a 10-digit mobile number instead of a bank header like VM-SBIBNK", 'VM-SBIBNK जैसे बैंक हेडर की जगह 10 अंकों वाले मोबाइल नंबर से मैसेज'],
      ['Requests to install an app or share an OTP for KYC', 'KYC के लिए ऐप डालने या OTP बताने की माँग'],
    ],
    todo: [
      ["Don't click. Open your bank's app or visit the branch to check your KYC status.", 'क्लिक न करें। KYC की स्थिति बैंक के ऐप में या ब्रांच जाकर देखें।'],
      ["Remember: banks don't block accounts through SMS links.", 'याद रखें: बैंक SMS के लिंक से खाते बंद नहीं करते।'],
      ['If you entered details, call your bank to block cards and net banking, then call 1930.', 'अगर जानकारी डाल दी है तो बैंक को कॉल करके कार्ड और नेट बैंकिंग बंद करवाएं, फिर 1930 पर कॉल करें।'],
      ['Report the SMS on Chakshu at sancharsaathi.gov.in.', 'SMS की शिकायत sancharsaathi.gov.in पर चक्षु में करें।'],
    ],
  },
  {
    id: 'upi_collect',
    severity: 'high',
    name: ['UPI collect request scam', 'UPI कलेक्ट रिक्वेस्ट स्कैम'],
    how: [
      ["A 'buyer', 'customer care agent' or 'cashback offer' sends you a UPI collect request.", "कोई 'ख़रीदार', 'कस्टमर केयर एजेंट' या 'कैशबैक ऑफ़र' आपको UPI कलेक्ट रिक्वेस्ट भेजता है।"],
      ['The request is labelled as a refund, a prize or payment for something you are selling.', 'रिक्वेस्ट पर लिखा होता है कि यह रिफ़ंड, इनाम या आपके बेचे सामान का पेमेंट है।'],
      ["You are told to approve it and enter your UPI PIN to 'receive' the money. Entering the PIN pays the scammer.", "आपसे कहा जाता है कि पैसे 'पाने' के लिए इसे मंज़ूर करें और UPI PIN डालें। PIN डालते ही पैसे ठग को चले जाते हैं।"],
    ],
    flags: [
      ['Being asked to enter your UPI PIN to receive money', 'पैसे पाने के लिए UPI PIN डालने को कहना'],
      ["A collect request you didn't start", 'ऐसी कलेक्ट रिक्वेस्ट जो आपने शुरू ही नहीं की'],
      ["'Accept to get your refund or cashback'", "'रिफ़ंड या कैशबैक पाने के लिए Accept करें'"],
      ['A stranger in a hurry, often a buyer from OLX or Facebook Marketplace', 'जल्दबाज़ी में कोई अनजान, अक्सर OLX या Facebook Marketplace का ख़रीदार'],
      ["Requests to send ₹1 or ₹10 to 'verify' before they pay you", "पैसे देने से पहले 'वेरिफ़ाई' करने के लिए ₹1 या ₹10 भेजने की माँग"],
    ],
    todo: [
      ['Decline the request. You never need a PIN to receive money.', 'रिक्वेस्ट रिजेक्ट करें। पैसे पाने के लिए कभी PIN नहीं लगता।'],
      ['Only approve requests you started yourself, for something you are buying.', 'सिर्फ़ वही रिक्वेस्ट मंज़ूर करें जो आपने ख़ुद कुछ ख़रीदने के लिए शुरू की हो।'],
      ['If money was taken, call 1930 at once and report at cybercrime.gov.in.', 'अगर पैसे कट गए हैं तो तुरंत 1930 पर कॉल करें और cybercrime.gov.in पर शिकायत करें।'],
      ['Tell your bank so it can try to hold the transaction.', 'बैंक को बताएं ताकि वह ट्रांज़ैक्शन रोकने की कोशिश कर सके।'],
    ],
  },
  {
    id: 'qr_receive',
    severity: 'high',
    name: ["'Scan to receive' QR scam", "'स्कैन करो, पैसे पाओ' QR स्कैम"],
    how: [
      ['You are selling something online, or expecting a refund or a prize.', 'आप ऑनलाइन कुछ बेच रहे होते हैं, या किसी रिफ़ंड या इनाम का इंतज़ार कर रहे होते हैं।'],
      ["The 'buyer' or 'agent' sends a QR code and says scanning it will put money into your account.", "'ख़रीदार' या 'एजेंट' एक QR कोड भेजता है और कहता है कि इसे स्कैन करते ही आपके खाते में पैसे आ जाएंगे।"],
      ['When you scan and enter your PIN, money leaves your account instead.', 'स्कैन करके PIN डालते ही पैसे आने के बजाय आपके खाते से निकल जाते हैं।'],
    ],
    flags: [
      ["'Scan this QR to receive the payment'", "'पेमेंट पाने के लिए यह QR स्कैन करें'"],
      ['A QR code or payment link sent by a buyer', 'ख़रीदार की तरफ़ से भेजा गया QR या पेमेंट लिंक'],
      ['Being asked to enter your PIN after scanning', 'स्कैन के बाद PIN डालने को कहना'],
      ["Notes like 'refund', 'cashback' or 'prize' on the payment screen", "पेमेंट स्क्रीन पर 'रिफ़ंड', 'कैशबैक' या 'इनाम' जैसे नोट"],
    ],
    todo: [
      ['Never scan a QR to receive money. QR codes are only for paying.', 'पैसे पाने के लिए कभी QR स्कैन न करें। QR सिर्फ़ पैसे देने के लिए होता है।'],
      ['Ask the buyer to pay directly to your UPI ID or number instead.', 'ख़रीदार से कहें कि सीधे आपकी UPI ID या नंबर पर पैसे भेजे।'],
      ['Look at the payment screen: if it shows an amount to pay, cancel.', 'पेमेंट स्क्रीन देखें: अगर उसमें पैसे देने की रक़म दिख रही है, तो कैंसिल करें।'],
      ['If you lost money, call 1930 and report at cybercrime.gov.in.', 'अगर पैसे गए हैं तो 1930 पर कॉल करें और cybercrime.gov.in पर शिकायत करें।'],
    ],
  },
  {
    id: 'fake_refund',
    severity: 'medium',
    name: ['Fake refund and "sent by mistake"', 'फ़र्ज़ी रिफ़ंड और "ग़लती से भेजे पैसे"'],
    how: [
      ["A fake SMS that looks like a bank credit alert is followed by a call: 'I sent money to you by mistake, please return it.'", "पहले बैंक के क्रेडिट अलर्ट जैसा नकली SMS आता है, फिर कॉल: 'ग़लती से आपको पैसे भेज दिए, प्लीज़ वापस कर दीजिए।'"],
      ["Or a 'refund team' contacts you about a cancelled order and asks you to fill a form, install an app or approve a request.", "या कोई 'रिफ़ंड टीम' कैंसिल ऑर्डर के बारे में संपर्क करके फ़ॉर्म भरवाती है, ऐप डलवाती है या रिक्वेस्ट मंज़ूर करवाती है।"],
      ['There was never any money. Whatever you send or approve goes to the scammer.', 'असल में पैसे कभी आए ही नहीं थे। आप जो भेजते या मंज़ूर करते हैं, वह ठग के पास चला जाता है।'],
    ],
    flags: [
      ["'Sent by mistake, please return' right after a credit SMS", "क्रेडिट SMS के ठीक बाद 'ग़लती से भेज दिए, वापस कर दो'"],
      ["A credit SMS from a 10-digit number instead of your bank's header", 'बैंक हेडर की जगह 10 अंकों वाले नंबर से आया क्रेडिट SMS'],
      ['Emotional stories about hospital bills or exam fees', 'अस्पताल के बिल या परीक्षा की फ़ीस जैसी भावुक कहानियाँ'],
      ['A refund that needs a link, an app, your PIN or a call to a mobile number', 'ऐसा रिफ़ंड जिसके लिए लिंक, ऐप, PIN या मोबाइल नंबर पर कॉल चाहिए'],
    ],
    todo: [
      ['Check your balance in your bank app, not the SMS.', 'SMS नहीं, अपने बैंक ऐप में बैलेंस देखें।'],
      ["If money really arrived by mistake, tell the sender to contact their bank. Don't send it yourself.", 'अगर सच में ग़लती से पैसे आए हैं तो भेजने वाले से कहें कि अपने बैंक से संपर्क करे। ख़ुद पैसे न भेजें।'],
      ['Real refunds come back automatically to the way you paid.', 'असली रिफ़ंड अपने आप उसी तरीक़े से वापस आता है जिससे आपने पेमेंट किया था।'],
      ['Report the number on Chakshu and at cybercrime.gov.in.', 'नंबर की शिकायत चक्षु पर और cybercrime.gov.in पर करें।'],
    ],
  },
  {
    id: 'job_task',
    severity: 'high',
    name: ['Task and part-time job scam', 'टास्क और पार्ट-टाइम नौकरी स्कैम'],
    how: [
      ["A 'recruiter' messages you on WhatsApp or Telegram about a part-time job: like YouTube videos, rate hotels or review products.", "कोई 'रिक्रूटर' WhatsApp या Telegram पर पार्ट-टाइम नौकरी का मैसेज भेजता है: यूट्यूब वीडियो लाइक करो, होटल को रेटिंग दो या प्रोडक्ट का रिव्यू लिखो।"],
      ['You get small payments for the first few tasks, so it feels real.', 'पहले कुछ टास्क के थोड़े-थोड़े पैसे मिलते हैं, ताकि सब असली लगे।'],
      ["Then come 'prepaid' or 'merchant' tasks where you must deposit money to earn more. Your 'earnings' grow on screen.", "फिर 'प्रीपेड' या 'मर्चेंट' टास्क आते हैं, जिनमें ज़्यादा कमाने के लिए पैसे जमा करने पड़ते हैं। स्क्रीन पर आपकी 'कमाई' बढ़ती दिखती है।"],
      ["When you try to withdraw, you are asked for 'tax', a 'fee' or another deposit. The money never comes out.", "पैसे निकालने की कोशिश करते ही 'टैक्स', 'फ़ीस' या एक और डिपॉज़िट माँगा जाता है। पैसे कभी नहीं निकलते।"],
    ],
    flags: [
      ['Job offers on WhatsApp or Telegram you never applied for, often from foreign numbers', 'WhatsApp या Telegram पर बिना आवेदन किए नौकरी का ऑफ़र, अक्सर विदेशी नंबरों से'],
      ['₹3,000 to ₹10,000 a day for liking videos or giving ratings', 'वीडियो लाइक करने या रेटिंग देने के लिए रोज़ ₹3,000 से ₹10,000'],
      ["Being added to a Telegram group with a 'receptionist' or 'mentor'", "Telegram ग्रुप में जोड़ा जाना जहाँ कोई 'रिसेप्शनिस्ट' या 'मेंटर' हो"],
      ["Any deposit, recharge or 'prepaid task' to earn more", "ज़्यादा कमाने के लिए कोई डिपॉज़िट, रिचार्ज या 'प्रीपेड टास्क'"],
      ['Withdrawals blocked until you pay a fee', 'फ़ीस भरे बिना पैसे न निकल पाना'],
    ],
    todo: [
      ['Never pay to get or keep a job. Real employers pay you.', 'नौकरी पाने या बनाए रखने के लिए कभी पैसे न दें। असली कंपनियाँ आपको पैसे देती हैं।'],
      ['Stop as soon as a deposit is mentioned, even if you were paid earlier.', 'जैसे ही डिपॉज़िट की बात हो, रुक जाएं, भले ही पहले कुछ पैसे मिल चुके हों।'],
      ["Don't send more money to 'unlock' a withdrawal. It only grows the loss.", "पैसे 'अनलॉक' करवाने के लिए और पैसे न भेजें। इससे नुक़सान सिर्फ़ बढ़ता है।"],
      ['Report the numbers and groups at cybercrime.gov.in, and call 1930 if you paid.', 'नंबरों और ग्रुप की शिकायत cybercrime.gov.in पर करें, और पैसे दिए हैं तो 1930 पर कॉल करें।'],
    ],
  },
  {
    id: 'investment',
    severity: 'high',
    name: ['Investment and trading scam', 'निवेश और ट्रेडिंग स्कैम'],
    how: [
      ["You are added to a WhatsApp or Telegram 'VIP stock tips' group, or meet an 'expert' online.", "आपको WhatsApp या Telegram के 'VIP स्टॉक टिप्स' ग्रुप में जोड़ा जाता है, या ऑनलाइन कोई 'एक्सपर्ट' मिलता है।"],
      ["The group shares screenshots of big profits and a 'SEBI registered' badge, and offers IPO allotments or institutional trading.", "ग्रुप में बड़े मुनाफ़े के स्क्रीनशॉट और 'SEBI रजिस्टर्ड' का बैज दिखाया जाता है, और IPO अलॉटमेंट या इंस्टीट्यूशनल ट्रेडिंग का ऑफ़र दिया जाता है।"],
      ['You use their trading app or website. Your balance rises fast on screen.', 'आप उनका ट्रेडिंग ऐप या वेबसाइट इस्तेमाल करते हैं। स्क्रीन पर बैलेंस तेज़ी से बढ़ता दिखता है।'],
      ['When you try to withdraw, they ask for taxes or fees, then disappear.', 'पैसे निकालने पर टैक्स या फ़ीस माँगी जाती है, और फिर वे ग़ायब हो जाते हैं।'],
    ],
    flags: [
      ['Guaranteed, fixed or double returns', 'पक्का, फ़िक्स्ड या दोगुना रिटर्न'],
      ["VIP groups, insider tips, 'operator stocks' or sure-shot calls", "VIP ग्रुप, अंदर की टिप्स, 'ऑपरेटर स्टॉक' या पक्की कॉल"],
      ["Guaranteed IPO allotment or a special 'institutional account'", "IPO अलॉटमेंट की गारंटी या ख़ास 'इंस्टीट्यूशनल अकाउंट'"],
      ["A trading app sent as a link instead of a known broker's app", 'जाने-माने ब्रोकर के ऐप की जगह लिंक से भेजा गया ट्रेडिंग ऐप'],
      ['Fees or taxes demanded before you can withdraw', 'पैसे निकालने से पहले फ़ीस या टैक्स की माँग'],
    ],
    todo: [
      ["Check any adviser's registration yourself on sebi.gov.in.", 'किसी भी सलाहकार का रजिस्ट्रेशन ख़ुद sebi.gov.in पर जाँचें।'],
      ["Invest only through registered brokers' official apps from the Play Store.", 'सिर्फ़ रजिस्टर्ड ब्रोकर के आधिकारिक ऐप से निवेश करें, जिसे आपने Play Store से डाउनलोड किया हो।'],
      ['Never send money to a personal account or UPI ID to invest.', 'निवेश के लिए किसी निजी खाते या UPI ID पर कभी पैसे न भेजें।'],
      ['If you paid, call 1930 and report at cybercrime.gov.in with the app name and transaction IDs.', 'पैसे दिए हैं तो 1930 पर कॉल करें और ऐप के नाम व ट्रांज़ैक्शन ID के साथ cybercrime.gov.in पर शिकायत करें।'],
    ],
  },
  {
    id: 'lottery_prize',
    severity: 'high',
    name: ['Lottery and prize scam', 'लॉटरी और इनाम का झांसा'],
    how: [
      ['A message or call says your number won a KBC, Jio or WhatsApp lucky draw worth lakhs, or a car or an iPhone.', 'मैसेज या कॉल आती है कि आपके नंबर ने KBC, Jio या WhatsApp के लकी ड्रा में लाखों रुपये, कार या iPhone जीता है।'],
      ["You are asked to contact a 'manager' on WhatsApp, often with a celebrity photo or a lottery certificate.", "WhatsApp पर किसी 'मैनेजर' से संपर्क करने को कहा जाता है, अक्सर किसी मशहूर हस्ती की फ़ोटो या लॉटरी सर्टिफ़िकेट के साथ।"],
      ['To release the prize you must pay a processing fee, GST or tax. Then come more fees, and no prize.', 'इनाम पाने के लिए प्रोसेसिंग फ़ीस, GST या टैक्स भरने को कहा जाता है। फिर और फ़ीस आती है, पर इनाम कभी नहीं।'],
    ],
    flags: [
      ['You won a lottery you never entered', 'ऐसी लॉटरी जीतना जिसमें आपने हिस्सा ही नहीं लिया'],
      ["A KBC, Jio, Airtel or WhatsApp 'lucky draw'", "KBC, Jio, Airtel या WhatsApp का 'लकी ड्रा'"],
      ['A fee, tax or GST to claim the prize', 'इनाम पाने के लिए फ़ीस, टैक्स या GST'],
      ["Prize 'managers' on WhatsApp or foreign numbers", "WhatsApp या विदेशी नंबरों पर इनाम के 'मैनेजर'"],
    ],
    todo: [
      ['Ignore it. There is no prize.', 'इसे नज़रअंदाज़ करें। कोई इनाम नहीं है।'],
      ['Never pay any fee or tax to receive a prize.', 'इनाम पाने के लिए कभी कोई फ़ीस या टैक्स न भरें।'],
      ['Block the number and report it on Chakshu.', 'नंबर ब्लॉक करें और चक्षु पर उसकी शिकायत करें।'],
      ['If you paid, call 1930 and report at cybercrime.gov.in.', 'पैसे दिए हैं तो 1930 पर कॉल करें और cybercrime.gov.in पर शिकायत करें।'],
    ],
  },
  {
    id: 'loan_app',
    severity: 'high',
    name: ['Instant loan app scam', 'इंस्टेंट लोन ऐप स्कैम'],
    how: [
      ['An ad or message offers an instant loan with no documents or credit check, through an app link.', 'किसी विज्ञापन या मैसेज में ऐप के लिंक के साथ बिना दस्तावेज़ और बिना सिबिल जाँच के तुरंत लोन का ऑफ़र होता है।'],
      ['The app asks for access to your contacts, photos and location.', 'ऐप आपके कॉन्टैक्ट, फ़ोटो और लोकेशन की अनुमति माँगता है।'],
      ["You get a small loan with huge hidden charges, or pay a 'processing fee' and get nothing.", "भारी छिपे चार्ज के साथ छोटा-सा लोन मिलता है, या 'प्रोसेसिंग फ़ीस' भरवाकर कुछ भी नहीं मिलता।"],
      ['Recovery agents then threaten you and send morphed photos to your contacts to make you pay again and again.', 'फिर रिकवरी एजेंट धमकाते हैं और आपकी बदली हुई फ़ोटो कॉन्टैक्ट्स को भेजकर बार-बार पैसे वसूलते हैं।'],
    ],
    flags: [
      ['Instant loans with no documents or CIBIL check', 'बिना दस्तावेज़ या सिबिल जाँच के तुरंत लोन'],
      ['Loan apps from links instead of the Play Store, or with no RBI-registered lender named', 'Play Store की जगह लिंक से आया लोन ऐप, या जिसमें RBI रजिस्टर्ड संस्था का नाम न हो'],
      ['A fee to be paid before the loan is released', 'लोन मिलने से पहले फ़ीस भरने की माँग'],
      ['Requests for access to contacts and photos', 'कॉन्टैक्ट और फ़ोटो की अनुमति माँगना'],
      ['Threats to message your contacts or post your photos', 'आपके कॉन्टैक्ट्स को मैसेज करने या फ़ोटो वायरल करने की धमकी'],
    ],
    todo: [
      ['Borrow only from banks or NBFCs listed on the RBI website.', 'लोन सिर्फ़ बैंक या RBI की वेबसाइट पर दर्ज NBFC से लें।'],
      ['Never pay a fee before a loan is disbursed.', 'लोन मिलने से पहले कभी कोई फ़ीस न दें।'],
      ["If you are being harassed, don't pay more. Report the app and numbers at cybercrime.gov.in and to the police.", 'अगर परेशान किया जा रहा है तो और पैसे न दें। ऐप और नंबरों की शिकायत cybercrime.gov.in और पुलिस में करें।'],
      ['Warn your contacts that messages about you are fake, and report the app on the Play Store.', 'अपने कॉन्टैक्ट्स को बता दें कि आपके बारे में आने वाले मैसेज झूठे हैं, और Play Store पर ऐप की शिकायत करें।'],
    ],
  },
  {
    id: 'sextortion',
    severity: 'critical',
    name: ['Sextortion', 'सेक्सटॉर्शन (वीडियो से ब्लैकमेल)'],
    how: [
      ['A stranger, often with an attractive profile, video calls you and records the call, sometimes mixing in obscene content.', 'कोई अनजान, अक्सर आकर्षक प्रोफ़ाइल वाला, आपको वीडियो कॉल करता है और कॉल रिकॉर्ड कर लेता है, कभी-कभी उसमें अश्लील कंटेंट मिला देता है।'],
      ['Soon you get the recording with a threat: pay, or it goes to your family, friends and social media.', 'थोड़ी देर बाद रिकॉर्डिंग के साथ धमकी आती है: पैसे दो, वरना यह परिवार, दोस्तों और सोशल मीडिया पर जाएगी।'],
      ["Some gangs follow up as fake police or 'YouTube officers' who demand money to delete the video or close a case.", "कुछ गिरोह फिर नकली पुलिस या 'YouTube अधिकारी' बनकर वीडियो हटाने या केस बंद करने के पैसे माँगते हैं।"],
    ],
    flags: [
      ["Video calls from unknown numbers or new online 'friends'", "अनजान नंबरों या नए ऑनलाइन 'दोस्तों' की वीडियो कॉल"],
      ['Threats to send a video to your contacts', 'वीडियो आपके कॉन्टैक्ट्स को भेजने की धमकी'],
      ['Demands for money to delete content', 'कंटेंट हटाने के लिए पैसों की माँग'],
      ["'Police' or 'cyber cell' calling about an obscene video complaint", "अश्लील वीडियो की शिकायत को लेकर 'पुलिस' या 'साइबर सेल' का फ़ोन"],
    ],
    todo: [
      ["Don't pay. Paying only leads to more demands.", 'पैसे न दें। पैसे देने से माँगें और बढ़ती हैं।'],
      ['Stop replying, but save screenshots and numbers as evidence.', 'जवाब देना बंद करें, पर स्क्रीनशॉट और नंबर सबूत के तौर पर संभालकर रखें।'],
      ['Report at cybercrime.gov.in or call 1930.', 'cybercrime.gov.in पर शिकायत करें या 1930 पर कॉल करें।'],
      ['Ask the platform to take the content down. You are not at fault.', 'प्लेटफ़ॉर्म से कंटेंट हटाने को कहें। इसमें आपकी कोई ग़लती नहीं है।'],
    ],
  },
  {
    id: 'otp_theft',
    severity: 'critical',
    name: ['OTP theft', 'OTP चोरी'],
    how: [
      ['Someone calls or messages as your bank, a delivery company, your telecom operator or even a relative.', 'कोई बैंक, डिलीवरी कंपनी, टेलीकॉम कंपनी या रिश्तेदार बनकर कॉल या मैसेज करता है।'],
      ['They trigger an OTP to your phone for a payment, a login or a WhatsApp registration.', 'वह आपके फ़ोन पर किसी पेमेंट, लॉगिन या WhatsApp रजिस्ट्रेशन का OTP भिजवाता है।'],
      ["Then they ask you to read out or forward 'the code you just got'. With it they move money or take over your account.", "फिर कहता है कि 'अभी जो कोड आया है' वह बता दें या भेज दें। उसी से वह पैसे निकालता है या अकाउंट हथिया लेता है।"],
    ],
    flags: [
      ['Anyone asking for an OTP, for any reason', 'किसी भी वजह से OTP माँगने वाला कोई भी व्यक्ति'],
      ["'A code was sent to your number by mistake, please send it to me'", "'ग़लती से आपके नंबर पर कोड चला गया, मुझे भेज दो'"],
      ["A 'bank officer' calling to block, unblock or verify your card", "कार्ड ब्लॉक, अनब्लॉक या वेरिफ़ाई करने के लिए 'बैंक अधिकारी' का फ़ोन"],
      ["OTP messages for something you didn't start", 'ऐसे काम का OTP जो आपने शुरू ही नहीं किया'],
    ],
    todo: [
      ['Never share an OTP, not even with bank staff.', 'OTP कभी किसी को न बताएं, बैंक वालों को भी नहीं।'],
      ["Read the OTP SMS: it says what it is for. If you didn't start it, ignore it.", 'OTP वाला SMS पढ़ें, उसमें लिखा होता है कि यह किस काम का है। अगर वह काम आपने शुरू नहीं किया, तो उसे छोड़ दें।'],
      ['If you shared one, call your bank at once to block cards and UPI, then call 1930.', 'अगर बता दिया है तो तुरंत बैंक को कॉल करके कार्ड और UPI बंद करवाएं, फिर 1930 पर कॉल करें।'],
      ['Turn on two-step verification in WhatsApp.', 'WhatsApp में टू-स्टेप वेरिफ़िकेशन चालू करें।'],
    ],
  },
  {
    id: 'fake_support',
    severity: 'high',
    name: ['Fake customer care', 'फ़र्ज़ी कस्टमर केयर'],
    how: [
      ["You search online for a company's helpline and find a fake one, or a fake 'support executive' contacts you about a complaint.", "आप इंटरनेट पर किसी कंपनी का हेल्पलाइन नंबर खोजते हैं और नकली नंबर मिल जाता है, या कोई नकली 'सपोर्ट एग्ज़ीक्यूटिव' किसी शिकायत के बारे में ख़ुद संपर्क करता है।"],
      ["The 'agent' sounds helpful and offers a refund or a quick fix.", "'एजेंट' बड़ी मदद करता हुआ लगता है और रिफ़ंड या जल्दी हल का वादा करता है।"],
      ['You are asked to install AnyDesk, fill a form, share an OTP or pay a small amount, and your account is emptied.', 'फिर AnyDesk डलवाता है, फ़ॉर्म भरवाता है, OTP माँगता है या छोटा पेमेंट करवाता है, और खाता खाली हो जाता है।'],
    ],
    flags: [
      ['A customer care number that is a 10-digit mobile', 'कस्टमर केयर के नाम पर 10 अंकों वाला मोबाइल नंबर'],
      ['Numbers from search results, map listings or social media comments', 'सर्च रिज़ल्ट, मैप लिस्टिंग या सोशल मीडिया कमेंट में मिले नंबर'],
      ["Support that needs a screen-sharing app, your PIN or a 'small fee'", "ऐसा सपोर्ट जिसमें स्क्रीन शेयर ऐप, PIN या 'छोटी फ़ीस' चाहिए"],
      ['Refunds that need you to send money first', 'ऐसा रिफ़ंड जिसके लिए पहले आपको पैसे भेजने पड़ें'],
    ],
    todo: [
      ["Get support numbers only from the company's official app or website.", 'सपोर्ट नंबर सिर्फ़ कंपनी के आधिकारिक ऐप या वेबसाइट से लें।'],
      ['Never install remote access apps or share OTPs with support agents.', 'सपोर्ट एजेंट के कहने पर कभी रिमोट एक्सेस ऐप न डालें, न OTP बताएं।'],
      ['If you shared details, call your bank and 1930 right away.', 'अगर जानकारी दे दी है तो तुरंत बैंक और 1930 पर कॉल करें।'],
      ['Report fake numbers on Chakshu and at cybercrime.gov.in.', 'नकली नंबरों की शिकायत चक्षु और cybercrime.gov.in पर करें।'],
    ],
  },
  {
    id: 'courier_parcel',
    severity: 'high',
    name: ['Courier and parcel scam', 'कूरियर और पार्सल स्कैम'],
    how: [
      ['An SMS says your India Post, DHL or Blue Dart parcel is held because of an incomplete address or unpaid duty.', 'SMS आता है कि आपका इंडिया पोस्ट, DHL या ब्लू डार्ट का पार्सल अधूरे पते या बकाया ड्यूटी की वजह से रुका है।'],
      ['The link asks you to update your address and pay a small fee, which captures your card details and OTP.', 'लिंक पर पता अपडेट करने और छोटी फ़ीस भरने को कहा जाता है, जिससे आपके कार्ड की जानकारी और OTP चुरा लिए जाते हैं।'],
      ['In a bigger version, a recorded call says a parcel in your name has drugs or fake passports, and hands you to fake police (see digital arrest).', 'बड़े रूप में, रिकॉर्डेड कॉल कहती है कि आपके नाम के पार्सल में ड्रग्स या नकली पासपोर्ट हैं, और आपको नकली पुलिस से जोड़ दिया जाता है (डिजिटल अरेस्ट देखें)।'],
    ],
    flags: [
      ["A parcel you weren't expecting", 'ऐसा पार्सल जिसकी आपको उम्मीद ही नहीं थी'],
      ["Links to 'update address' that aren't the courier's official site", "'पता अपडेट' करने के ऐसे लिंक जो कूरियर की आधिकारिक साइट के न हों"],
      ['Small redelivery, customs or address-correction fees', 'री-डिलीवरी, कस्टम या पता सुधारने की छोटी-छोटी फ़ीस'],
      ['Recorded calls asking you to press 1 or 9 about a parcel', 'पार्सल के बारे में 1 या 9 दबाने को कहने वाली रिकॉर्डेड कॉल'],
      ["Drugs, passports or illegal items 'found' in a parcel in your name", "आपके नाम के पार्सल में ड्रग्स, पासपोर्ट या अवैध सामान 'मिलने' की बात"],
    ],
    todo: [
      ["Track parcels only on the courier's official website or app with your tracking number.", 'पार्सल को सिर्फ़ कूरियर की आधिकारिक वेबसाइट या ऐप पर अपने ट्रैकिंग नंबर से ट्रैक करें।'],
      ['Never pay small fees through links in SMS.', 'SMS के लिंक से कभी छोटी-मोटी फ़ीस न भरें।'],
      ["Hang up on 'press 1' calls about parcels.", "पार्सल के बारे में '1 दबाएं' वाली कॉल तुरंत काट दें।"],
      ['Report the SMS or call on Chakshu, and call 1930 if you paid.', 'SMS या कॉल की शिकायत चक्षु पर करें, और पैसे दिए हैं तो 1930 पर कॉल करें।'],
    ],
  },
  {
    id: 'utility_disconnect',
    severity: 'high',
    name: ['Electricity disconnection scam', 'बिजली कनेक्शन कटने का झांसा'],
    how: [
      ["An SMS says your electricity will be cut tonight at 9:30 because last month's bill was not updated.", 'SMS आता है कि पिछले महीने का बिल अपडेट नहीं हुआ, इसलिए आज रात 9:30 बजे आपकी बिजली काट दी जाएगी।'],
      ["It gives an 'electricity officer' mobile number to call.", "उसमें किसी 'बिजली अधिकारी' का मोबाइल नंबर दिया होता है।"],
      ["The 'officer' asks you to pay a small amount through a link or to install an app such as AnyDesk, and then empties your account.", "वह 'अधिकारी' लिंक से छोटा पेमेंट करवाता है या AnyDesk जैसा ऐप डलवाता है, और फिर खाता खाली कर देता है।"],
    ],
    flags: [
      ["Disconnection 'tonight' or at a specific hour", "'आज रात' या किसी तय समय पर कनेक्शन काटने की बात"],
      ["'Your previous bill was not updated'", "'आपका पिछला बिल अपडेट नहीं हुआ'"],
      ["An officer's personal mobile number", 'किसी अधिकारी का निजी मोबाइल नंबर'],
      ["A link or app to pay instead of your discom's official app", 'बिजली कंपनी के आधिकारिक ऐप की जगह कोई लिंक या ऐप'],
    ],
    todo: [
      ["Check your bill status in the discom's official app or website.", 'बिल की स्थिति बिजली कंपनी के आधिकारिक ऐप या वेबसाइट पर देखें।'],
      ["Don't call numbers from the SMS. Use the helpline printed on your bill.", 'SMS में दिए नंबर पर कॉल न करें। अपने बिल पर छपी हेल्पलाइन इस्तेमाल करें।'],
      ['Never install apps or share OTPs to pay a bill.', 'बिल भरने के लिए कभी कोई ऐप न डालें, न OTP बताएं।'],
      ['Report the SMS on Chakshu, and call 1930 if you paid.', 'SMS की शिकायत चक्षु पर करें, और पैसे दिए हैं तो 1930 पर कॉल करें।'],
    ],
  },
  {
    id: 'reward_points',
    severity: 'high',
    name: ['Reward points scam', 'रिवॉर्ड पॉइंट्स स्कैम'],
    how: [
      ['An SMS says your credit card reward points worth thousands of rupees expire today.', 'SMS आता है कि आपके क्रेडिट कार्ड के हज़ारों रुपये के रिवॉर्ड पॉइंट आज ख़त्म हो रहे हैं।'],
      ['A link or an APK file promises to convert them to cash.', 'एक लिंक या APK फ़ाइल उन्हें कैश में बदलने का वादा करती है।'],
      ['The fake page or app collects your card number, CVV and OTP, or reads your SMS directly.', 'नकली पेज या ऐप आपका कार्ड नंबर, CVV और OTP ले लेता है, या सीधे आपके SMS पढ़ लेता है।'],
    ],
    flags: [
      ["Points 'expiring today' with a cash value", "नक़द क़ीमत के साथ 'आज ख़त्म हो रहे' पॉइंट"],
      ['Redemption through an SMS link or an APK file', 'SMS लिंक या APK फ़ाइल से रिडीम करने की बात'],
      ['Requests for CVV, expiry date or OTP to redeem', 'रिडीम करने के लिए CVV, एक्सपायरी डेट या OTP की माँग'],
    ],
    todo: [
      ["Check points only in your bank's app or on its official rewards site.", 'पॉइंट सिर्फ़ बैंक के ऐप या उसकी आधिकारिक रिवॉर्ड साइट पर देखें।'],
      ['Never install APK files sent in messages.', 'मैसेज में आई APK फ़ाइल कभी इंस्टॉल न करें।'],
      ['If you entered card details, block the card in your bank app and call 1930.', 'अगर कार्ड की जानकारी डाल दी है तो बैंक ऐप से कार्ड ब्लॉक करें और 1930 पर कॉल करें।'],
    ],
  },
  {
    id: 'tax_refund',
    severity: 'high',
    name: ['Income tax refund scam', 'इनकम टैक्स रिफ़ंड स्कैम'],
    how: [
      ['A message or email that looks like it is from the Income Tax Department says a refund has been approved for you.', 'आयकर विभाग जैसा दिखने वाला मैसेज या ईमेल आता है कि आपका रिफ़ंड मंज़ूर हो गया है।'],
      ["To get it, you must click a link and 'verify' your bank account or card.", "उसे पाने के लिए लिंक पर क्लिक करके बैंक खाता या कार्ड 'वेरिफ़ाई' करने को कहा जाता है।"],
      ['The fake site collects your net banking login, card details and OTP.', 'नकली साइट आपकी नेट बैंकिंग लॉगिन, कार्ड की जानकारी और OTP ले लेती है।'],
    ],
    flags: [
      ['A refund that needs you to click a link', 'ऐसा रिफ़ंड जिसके लिए लिंक पर क्लिक करना पड़े'],
      ["Requests for card details or an OTP to 'receive' a refund", "रिफ़ंड 'पाने' के लिए कार्ड की जानकारी या OTP की माँग"],
      ["Links or email addresses that don't end in incometax.gov.in", 'ऐसा लिंक या ईमेल पता जो incometax.gov.in पर ख़त्म न हो'],
    ],
    todo: [
      ['Check refund status by logging in yourself at incometax.gov.in.', 'रिफ़ंड की स्थिति ख़ुद incometax.gov.in पर लॉगिन करके देखें।'],
      ['Refunds reach your pre-validated bank account automatically.', 'रिफ़ंड अपने आप पहले से वेरिफ़ाइड बैंक खाते में आता है।'],
      ['Report such messages at cybercrime.gov.in.', 'ऐसे मैसेज की शिकायत cybercrime.gov.in पर करें।'],
      ['If you entered details, call your bank and 1930.', 'अगर जानकारी डाल दी है तो बैंक और 1930 पर कॉल करें।'],
    ],
  },
  {
    id: 'govt_scheme',
    severity: 'medium',
    name: ['Fake government scheme', 'फ़र्ज़ी सरकारी योजना'],
    how: [
      ['A WhatsApp forward or SMS promises PM-Kisan money, a free laptop, free recharge, ration or a subsidy.', 'WhatsApp फ़ॉरवर्ड या SMS में पीएम किसान के पैसे, मुफ़्त लैपटॉप, मुफ़्त रिचार्ज, राशन या सब्सिडी का वादा होता है।'],
      ['You are asked to register on a link, share Aadhaar and bank details, or pay a small registration fee.', 'लिंक पर रजिस्टर करने, आधार और बैंक की जानकारी देने, या छोटी रजिस्ट्रेशन फ़ीस भरने को कहा जाता है।'],
      ['Your data is misused and the fee is lost. Often you are also asked to forward the message to more groups.', 'जानकारी का ग़लत इस्तेमाल होता है और फ़ीस डूब जाती है। अक्सर मैसेज को और ग्रुप में भेजने को भी कहा जाता है।'],
    ],
    flags: [
      ['A registration or processing fee for a government scheme', 'सरकारी योजना के लिए रजिस्ट्रेशन या प्रोसेसिंग फ़ीस'],
      ["Links that don't end in .gov.in or .nic.in", 'ऐसे लिंक जो .gov.in या .nic.in पर ख़त्म न हों'],
      ["'Free' offers from the 'government' in forwarded messages", "फ़ॉरवर्ड मैसेज में 'सरकार' की तरफ़ से 'मुफ़्त' ऑफ़र"],
      ['Requests to forward the message to 10 groups', 'मैसेज को 10 ग्रुप में भेजने की माँग'],
      ["APK files named after schemes, like 'PM Kisan.apk'", "योजनाओं के नाम वाली APK फ़ाइलें, जैसे 'PM Kisan.apk'"],
    ],
    todo: [
      ['Check schemes on the official portal (for example pmkisan.gov.in) or at a Common Service Centre.', 'योजनाओं की जानकारी आधिकारिक पोर्टल (जैसे pmkisan.gov.in) या कॉमन सर्विस सेंटर से लें।'],
      ['Never pay fees or share Aadhaar and bank details through forwarded links.', 'फ़ॉरवर्ड हुए लिंक से कभी फ़ीस न भरें, न आधार और बैंक की जानकारी दें।'],
      ["Don't forward such messages; report them instead.", 'ऐसे मैसेज आगे न भेजें, उनकी शिकायत करें।'],
      ['If you paid or installed an app, call your bank and 1930.', 'पैसे दिए हैं या ऐप डाल लिया है तो बैंक और 1930 पर कॉल करें।'],
    ],
  },
  {
    id: 'malicious_app',
    severity: 'critical',
    name: ['Malicious app (APK)', 'ख़तरनाक ऐप (APK)'],
    how: [
      ['You get an APK file on WhatsApp or SMS named like a wedding invitation, PM Kisan, an electricity bill, a traffic challan or bank rewards.', 'WhatsApp या SMS पर शादी के कार्ड, पीएम किसान, बिजली बिल, ट्रैफ़िक चालान या बैंक रिवॉर्ड के नाम से APK फ़ाइल आती है।'],
      ['Installing it asks for permission to read your SMS, notifications and contacts.', 'इंस्टॉल करते ही यह SMS, नोटिफ़िकेशन और कॉन्टैक्ट पढ़ने की अनुमति माँगती है।'],
      ['The app forwards your OTPs to the scammer and often sends the same file to your contacts.', 'फिर ऐप आपके OTP ठग को भेज देता है और अक्सर वही फ़ाइल आपके कॉन्टैक्ट्स को भी भेज देता है।'],
    ],
    flags: [
      ['Any file ending in .apk sent in a chat or SMS', 'चैट या SMS में आई .apk पर ख़त्म होने वाली कोई भी फ़ाइल'],
      ["'Install this app' to sort out KYC, rewards, bills or schemes", "KYC, रिवॉर्ड, बिल या योजना के लिए 'यह ऐप इंस्टॉल करें'"],
      ['Apps that ask to read your SMS or become your default SMS app', 'ऐसे ऐप जो आपके SMS पढ़ने या डिफ़ॉल्ट SMS ऐप बनने की अनुमति माँगें'],
      ['Invitations or documents that open as apps', 'निमंत्रण या दस्तावेज़ जो ऐप की तरह खुलें'],
    ],
    todo: [
      ["Don't open the file. Delete it.", 'फ़ाइल न खोलें। उसे डिलीट कर दें।'],
      ['If you installed it: turn on flight mode, uninstall the app, and call your bank from another phone.', 'अगर इंस्टॉल कर लिया है: फ़ोन फ़्लाइट मोड पर करें, ऐप हटाएं, और दूसरे फ़ोन से बैंक को कॉल करें।'],
      ['Change your UPI PIN and passwords, and call 1930 if money was taken.', 'UPI PIN और पासवर्ड बदलें, और पैसे कटे हैं तो 1930 पर कॉल करें।'],
      ['Keep Google Play Protect turned on.', 'Google Play Protect चालू रखें।'],
    ],
  },
  {
    id: 'remote_access',
    severity: 'critical',
    name: ['Remote access scam', 'रिमोट एक्सेस स्कैम'],
    how: [
      ["A fake support agent, bank officer or electricity officer asks you to install AnyDesk, TeamViewer or a similar app to 'help' you.", "कोई नकली सपोर्ट एजेंट, बैंक अधिकारी या बिजली अधिकारी 'मदद' के नाम पर AnyDesk, TeamViewer जैसा ऐप डलवाता है।"],
      ['Once it is installed, you share a code that lets them see and control your screen.', 'ऐप डालने के बाद आप एक कोड बताते हैं, जिससे वे आपकी स्क्रीन देख और चला सकते हैं।'],
      ["They watch you open your banking app and enter your PIN, or ask you to make a 'test' payment.", "फिर वे आपको बैंकिंग ऐप खोलते और PIN डालते देखते हैं, या 'टेस्ट' पेमेंट करवाते हैं।"],
    ],
    flags: [
      ['Any caller asking you to install AnyDesk, TeamViewer, QuickSupport or RustDesk', 'AnyDesk, TeamViewer, QuickSupport या RustDesk डालने को कहने वाला कोई भी कॉलर'],
      ['Requests to share a 9- or 10-digit app code', 'ऐप का 9 या 10 अंकों वाला कोड बताने की माँग'],
      ['Being asked to open your banking app while on the call', 'कॉल पर रहते हुए बैंकिंग ऐप खोलने को कहना'],
    ],
    todo: [
      ['Hang up and uninstall the app.', 'कॉल काटें और ऐप हटा दें।'],
      ['Change your UPI PIN, net banking password and card PIN.', 'UPI PIN, नेट बैंकिंग पासवर्ड और कार्ड PIN बदलें।'],
      ['Call your bank to check for unknown transactions, and call 1930 if money was taken.', 'बैंक को कॉल करके अनजान ट्रांज़ैक्शन देखें, और पैसे कटे हैं तो 1930 पर कॉल करें।'],
    ],
  },
  {
    id: 'impersonation',
    severity: 'high',
    name: ['Impersonation', 'किसी और बनकर ठगी'],
    how: [
      ["A message comes from a new number with a relative's or friend's photo: 'My phone broke, this is my new number, I need money urgently.'", "नए नंबर से किसी रिश्तेदार या दोस्त की फ़ोटो के साथ मैसेज आता है: 'फ़ोन टूट गया, यह मेरा नया नंबर है, तुरंत पैसे चाहिए।'"],
      ["Or your 'boss' or 'CEO' asks you to quietly buy gift cards for a client.", "या आपका 'बॉस' या 'CEO' चुपचाप किसी क्लाइंट के लिए गिफ़्ट कार्ड ख़रीदने को कहता है।"],
      ["On OLX and Marketplace, an 'army officer' offers to buy or sell, then sends a QR or asks for a 'verification' payment.", "OLX और Marketplace पर कोई 'आर्मी अफ़सर' सामान ख़रीदने या बेचने की बात करता है, फिर QR भेजता है या 'वेरिफ़िकेशन' पेमेंट माँगता है।"],
      ['Some callers say a family member has been arrested or is in hospital and money is needed at once.', 'कुछ कॉल करने वाले कहते हैं कि परिवार का कोई सदस्य पकड़ा गया है या अस्पताल में है और तुरंत पैसे चाहिए।'],
    ],
    flags: [
      ["A 'new number' asking for money", "'नए नंबर' से पैसों की माँग"],
      ['Requests for gift cards or voucher codes', 'गिफ़्ट कार्ड या वाउचर कोड की माँग'],
      ["Urgency plus secrecy: 'I'm in a meeting, don't call'", "जल्दबाज़ी और राज़दारी: 'मीटिंग में हूँ, कॉल मत करना'"],
      ['Army officer buyers or sellers who insist on QR codes or advance payment', 'QR या एडवांस पेमेंट पर अड़े आर्मी अफ़सर ख़रीदार या विक्रेता'],
      ["A relative 'arrested' and money needed to settle the case", "किसी रिश्तेदार के 'गिरफ़्तार' होने और मामला निपटाने के लिए पैसे"],
    ],
    todo: [
      ['Call the person on the number you already have before doing anything.', 'कुछ भी करने से पहले उस व्यक्ति को उनके पुराने नंबर पर फ़ोन करें।'],
      ['Ask a question only the real person would know.', 'ऐसा सवाल पूछें जिसका जवाब सिर्फ़ असली व्यक्ति जानता हो।'],
      ["Never pay in gift cards, and never scan a buyer's QR.", 'कभी गिफ़्ट कार्ड से पेमेंट न करें, और ख़रीदार का भेजा QR कभी स्कैन न करें।'],
      ['Report the number on Chakshu, and call 1930 if you paid.', 'नंबर की शिकायत चक्षु पर करें, और पैसे दिए हैं तो 1930 पर कॉल करें।'],
    ],
  },
  {
    id: 'romance',
    severity: 'high',
    name: ['Romance and gift scam', 'प्यार और गिफ़्ट का झांसा'],
    how: [
      ['Someone friendly contacts you on Instagram, Facebook, a dating app or a matrimony site, often claiming to live abroad.', 'Instagram, Facebook, डेटिंग ऐप या मैट्रिमोनी साइट पर कोई दोस्ताना व्यक्ति संपर्क करता है, अक्सर विदेश में रहने का दावा करता है।'],
      ['Over weeks they build a close relationship and talk about marriage or visiting you.', 'हफ़्तों में गहरा रिश्ता बनाता है और शादी या मिलने आने की बातें करता है।'],
      ["Then a crisis: a gift stuck at customs, a ticket to India, a medical bill. A 'customs officer' or 'courier agent' asks you to pay.", "फिर कोई मुसीबत आती है: कस्टम में अटका गिफ़्ट, भारत का टिकट, इलाज का बिल। कोई 'कस्टम अधिकारी' या 'कूरियर एजेंट' पैसे भरने को कहता है।"],
    ],
    flags: [
      ["An online partner you've never met in person", 'ऑनलाइन साथी जिससे आप कभी आमने-सामने नहीं मिले'],
      ['Expensive gifts or cash sent from abroad', 'विदेश से भेजे गए महँगे गिफ़्ट या नक़दी'],
      ["Customs, clearance or 'anti-money laundering' fees for a gift", "गिफ़्ट के लिए कस्टम, क्लीयरेंस या 'एंटी मनी लॉन्ड्रिंग' फ़ीस"],
      ['Requests for money for tickets, visas or emergencies', 'टिकट, वीज़ा या किसी मुसीबत के नाम पर पैसों की माँग'],
    ],
    todo: [
      ["Never send money to someone you haven't met in person.", 'जिनसे आमने-सामने कभी नहीं मिले, उन्हें कभी पैसे न भेजें।'],
      ["Talk to a friend or family member before paying any 'customs' fee.", "कोई भी 'कस्टम' फ़ीस भरने से पहले किसी दोस्त या घरवाले से बात करें।"],
      ['Reverse-search their photos; scammers use stolen pictures.', 'उनकी फ़ोटो रिवर्स सर्च करके देखें; ठग चुराई हुई तस्वीरें इस्तेमाल करते हैं।'],
      ['Report the profile, and call 1930 if you paid.', 'प्रोफ़ाइल की शिकायत करें, और पैसे दिए हैं तो 1930 पर कॉल करें।'],
    ],
  },
  {
    id: 'sim_swap',
    severity: 'critical',
    name: ['SIM swap and eSIM scam', 'सिम स्वैप और eSIM स्कैम'],
    how: [
      ["A call or SMS says your SIM will be blocked within hours over incomplete KYC or 'illegal activity', or offers a free eSIM or 5G upgrade.", "कॉल या SMS आता है कि अधूरी KYC या 'अवैध गतिविधि' की वजह से कुछ घंटों में आपका सिम बंद हो जाएगा, या मुफ़्त eSIM या 5G अपग्रेड का ऑफ़र दिया जाता है।"],
      ["You are told to send an SMS such as 'ESIM <email>' to your operator, share a code, or scan a QR.", "आपसे ऑपरेटर को 'ESIM <ईमेल>' जैसा SMS भेजने, कोई कोड बताने या QR स्कैन करने को कहा जाता है।"],
      ["That moves your number to the scammer's phone. Yours loses network, and your bank OTPs go to them.", 'इससे आपका नंबर ठग के फ़ोन पर चला जाता है। आपके फ़ोन का नेटवर्क चला जाता है और बैंक के OTP उनके पास पहुँचने लगते हैं।'],
    ],
    flags: [
      ['Threats that your SIM or number will be blocked', 'आपका सिम या नंबर बंद करने की धमकी'],
      ["eSIM or 5G 'upgrade' requests you didn't ask for", "बिना माँगे eSIM या 5G 'अपग्रेड' की रिक्वेस्ट"],
      ['Calls claiming to be from TRAI or the Department of Telecommunications', 'TRAI या दूरसंचार विभाग से होने का दावा करने वाली कॉल'],
      ["Your phone suddenly showing 'No service'", "फ़ोन में अचानक 'No service' दिखना"],
    ],
    todo: [
      ["Never send SIM-related SMS, codes or eSIM QR codes on someone's instructions.", 'किसी के कहने पर सिम से जुड़ा SMS, कोड या eSIM का QR कभी न भेजें।'],
      ['Contact your operator only through its official app or store.', 'अपने ऑपरेटर से सिर्फ़ उसके आधिकारिक ऐप या स्टोर के ज़रिए संपर्क करें।'],
      ['If your network suddenly vanishes, call your operator and bank from another phone at once.', 'अगर नेटवर्क अचानक चला जाए तो दूसरे फ़ोन से तुरंत ऑपरेटर और बैंक को कॉल करें।'],
      ['Report the call on Chakshu. TRAI does not disconnect individual numbers.', 'कॉल की शिकायत चक्षु पर करें। TRAI किसी एक व्यक्ति का नंबर बंद नहीं करता।'],
    ],
  },
  {
    id: 'phishing_link',
    severity: 'high',
    name: ['Phishing link', 'फ़िशिंग लिंक'],
    how: [
      ['A message gives you a reason to click: a blocked account, a pending challan, a reward, a refund or a delivery problem.', 'मैसेज क्लिक करने की कोई वजह बनाता है: बंद खाता, बकाया चालान, इनाम, रिफ़ंड या डिलीवरी की दिक़्क़त।'],
      ['The link opens a page that copies a real login or payment screen.', 'लिंक एक ऐसा पेज खोलता है जो असली लॉगिन या पेमेंट स्क्रीन की नकल होता है।'],
      ['Whatever you type, from passwords to card numbers and OTPs, goes straight to the scammer.', 'आप जो भी डालते हैं, पासवर्ड से लेकर कार्ड नंबर और OTP तक, सीधे ठग के पास चला जाता है।'],
    ],
    flags: [
      ['Short links (bit.ly and similar) in messages about money', 'पैसों से जुड़े मैसेज में छोटे लिंक (bit.ly जैसे)'],
      ['Domains with extra words, like sbi-kyc-update.in', 'फ़ालतू शब्दों वाले डोमेन, जैसे sbi-kyc-update.in'],
      ['Unusual endings like .top, .xyz or .icu', 'असामान्य एंडिंग, जैसे .top, .xyz या .icu'],
      ['Pages that ask for an OTP right after you log in', 'लॉगिन के तुरंत बाद OTP माँगने वाले पेज'],
    ],
    todo: [
      ["Don't open links in unexpected messages. Type the official address yourself.", 'अनचाहे मैसेज के लिंक न खोलें। आधिकारिक पता ख़ुद टाइप करें।'],
      ['Check the full domain name before you enter anything.', 'कुछ भी डालने से पहले पूरा डोमेन नाम ध्यान से देखें।'],
      ['If you entered details, change passwords, block cards and call 1930.', 'अगर जानकारी डाल दी है तो पासवर्ड बदलें, कार्ड ब्लॉक करें और 1930 पर कॉल करें।'],
      ['Report the message on Chakshu.', 'मैसेज की शिकायत चक्षु पर करें।'],
    ],
  },
  {
    id: 'lookalike_domain',
    severity: 'critical',
    name: ['Lookalike website', 'नकली मिलती-जुलती वेबसाइट'],
    how: [
      ['Scammers register addresses that look almost exactly like real ones: hdfcbnak.com, sbi.co.in.kyc-update.top, or names with look-alike letters from other alphabets.', 'ठग ऐसे पते रजिस्टर करते हैं जो लगभग असली जैसे दिखते हैं: hdfcbnak.com, sbi.co.in.kyc-update.top, या दूसरी लिपि के मिलते-जुलते अक्षरों वाले नाम।'],
      ['The page copies the real logo and design.', 'पेज पर असली लोगो और डिज़ाइन हूबहू कॉपी होता है।'],
      ['Links are sent by SMS or shown in search ads, and people log in without noticing the difference.', 'लिंक SMS से भेजे जाते हैं या सर्च विज्ञापनों में दिखते हैं, और लोग फ़र्क़ देखे बिना लॉगिन कर लेते हैं।'],
    ],
    flags: [
      ['Misspellings or swapped letters in the brand name', 'ब्रांड के नाम में ग़लत स्पेलिंग या अदला-बदली किए अक्षर'],
      ['The real brand name followed by extra words or another domain', 'असली ब्रांड के नाम के बाद फ़ालतू शब्द या कोई दूसरा डोमेन'],
      ['A different ending, like .co instead of .com', 'अलग एंडिंग, जैसे .com की जगह .co'],
      ["Free-hosting sites (web.app, vercel.app, github.io) using a bank's name", 'मुफ़्त होस्टिंग (web.app, vercel.app, github.io) पर बैंक के नाम वाली वेबसाइटें'],
    ],
    todo: [
      ['Close the page and type the official address yourself, or use the official app.', 'पेज बंद करें और आधिकारिक पता ख़ुद टाइप करें, या आधिकारिक ऐप इस्तेमाल करें।'],
      ["Bookmark your bank's real website.", 'अपने बैंक की असली वेबसाइट को बुकमार्क कर लें।'],
      ['If you logged in, change your password and call your bank and 1930.', 'अगर लॉगिन कर लिया है तो पासवर्ड बदलें और बैंक व 1930 पर कॉल करें।'],
      ['Report the site at cybercrime.gov.in.', 'वेबसाइट की शिकायत cybercrime.gov.in पर करें।'],
    ],
  },
  {
    id: 'other',
    severity: 'medium',
    name: ['Other suspicious messages', 'अन्य संदिग्ध मैसेज'],
    how: [
      ['Scams keep changing, but they share a pattern: an unexpected message, a story that creates fear or greed, and a push to act fast.', 'ठगी के तरीक़े बदलते रहते हैं, पर पैटर्न एक जैसा होता है: अचानक आया मैसेज, डर या लालच पैदा करने वाली कहानी, और जल्दी कुछ करने का दबाव।'],
      ['The goal is always the same: your money, your OTP, or control of your phone or account.', 'मक़सद हमेशा एक होता है: आपके पैसे, आपका OTP, या आपके फ़ोन या अकाउंट पर क़ब्ज़ा।'],
    ],
    flags: [
      ['Urgency and threats', 'जल्दबाज़ी और धमकी'],
      ['Requests for money, OTPs or personal details', 'पैसे, OTP या निजी जानकारी की माँग'],
      ["Links, apps or numbers you weren't expecting", 'ऐसे लिंक, ऐप या नंबर जिनकी आपको उम्मीद नहीं थी'],
      ['Requests to keep it secret', 'बात राज़ रखने को कहना'],
    ],
    todo: [
      ['Pause and check with the official source before you act.', 'कुछ भी करने से पहले रुकें और आधिकारिक स्रोत से पुष्टि करें।'],
      ['Never share OTPs, PINs or passwords.', 'OTP, PIN या पासवर्ड कभी किसी को न बताएं।'],
      ['If you lost money, call 1930 within the first hour and report at cybercrime.gov.in.', 'अगर पैसे गए हैं तो पहले घंटे के अंदर 1930 पर कॉल करें और cybercrime.gov.in पर शिकायत करें।'],
    ],
  },
];

function build(): Record<ScamCategory, CategoryInfo> {
  const out = {} as Record<ScamCategory, CategoryInfo>;
  for (const row of ROWS) {
    const short = SHORT[row.id];
    out[row.id] = {
      id: row.id,
      name: row.name[0],
      nameHi: row.name[1],
      short: short[0],
      shortHi: short[1],
      howItWorks: row.how.map((p) => p[0]),
      howItWorksHi: row.how.map((p) => p[1]),
      redFlags: row.flags.map((p) => p[0]),
      redFlagsHi: row.flags.map((p) => p[1]),
      whatToDo: row.todo.map((p) => p[0]),
      whatToDoHi: row.todo.map((p) => p[1]),
      severity: row.severity,
    };
  }
  return out;
}

/** Scam encyclopedia keyed by category id (every ScamCategory, including 'other'). */
export const CATEGORIES: Record<ScamCategory, CategoryInfo> = /* @__PURE__ */ build();

/** Category ids in display order. */
export const CATEGORY_IDS: ScamCategory[] = /* @__PURE__ */ ROWS.map((r) => r.id);

/** Look up one category. */
export function getCategory(id: ScamCategory): CategoryInfo {
  return CATEGORIES[id];
}
