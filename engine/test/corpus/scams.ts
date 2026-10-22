/**
 * Labelled scam messages, modelled on real SMS, WhatsApp, email and call
 * scripts reported in India. Phone numbers, UPI IDs and domains are made up.
 */
import type { CorpusItem } from './types';

export const SCAMS: CorpusItem[] = [
  // digital_arrest
  { id: 'da-en-1', category: 'digital_arrest', lang: 'en', source: 'call', text: 'This is Inspector Rajesh Sharma from Mumbai Cyber Crime Cell. A FedEx parcel booked with your Aadhaar contains 5 fake passports and 200 grams of MDMA. An FIR has been registered and an arrest warrant is issued against you. You must join a Skype video call for your statement right now. Do not disconnect the call and do not tell anyone, this is a confidential matter.' },
  { id: 'da-en-2', category: 'digital_arrest', lang: 'en', source: 'whatsapp', text: 'CBI NOTICE: Your Aadhaar card number has been used to open a bank account involved in a money laundering case of Rs 6.8 crore. You are under digital arrest until verification is complete. Stay on video call and keep camera on. Transfer your funds to the RBI verification account for clearance; the amount will be returned after investigation.' },
  { id: 'da-en-3', category: 'digital_arrest', lang: 'en', source: 'call', text: "Sir, I am calling from the Enforcement Directorate. Your name has come up in a hawala case. To avoid arrest you have to transfer your savings to a secure government account for verification. Don't inform your family or bank, otherwise legal action will be taken today." },
  { id: 'da-en-4', category: 'digital_arrest', lang: 'en', source: 'whatsapp', text: 'Delhi Police Crime Branch: 17 illegal SIM cards were issued on your Aadhaar and are being used for harassment and fraud. A non-bailable warrant is ready against you. Connect on WhatsApp video with DCP Verma immediately for statement recording.' },
  { id: 'da-en-5', category: 'digital_arrest', lang: 'en', source: 'call', text: 'This is an automated call from TRAI and Mumbai Police. Your mobile number is linked to money laundering and illegal activities. You will be arrested within 2 hours. Press 9 to speak to the investigating officer.' },
  { id: 'da-hi-1', category: 'digital_arrest', lang: 'hi', source: 'call', text: 'मैं सीबीआई मुख्यालय, दिल्ली से बोल रहा हूँ। आपके आधार कार्ड से एक बैंक खाता खुला है जिसमें मनी लॉन्ड्रिंग का पैसा आया है। आपके खिलाफ गिरफ्तारी वारंट जारी हो चुका है। वीडियो कॉल पर बने रहिए और यह बात किसी को मत बताइए।' },
  { id: 'da-hi-2', category: 'digital_arrest', lang: 'hi', source: 'whatsapp', text: 'मुंबई पुलिस साइबर क्राइम: आपके नाम पर भेजे गए पार्सल में ड्रग्स मिले हैं। आप डिजिटल अरेस्ट में हैं। जांच पूरी होने तक कैमरा चालू रखें और अपनी जमा राशि सत्यापन खाते में ट्रांसफर करें, जांच के बाद पैसे वापस कर दिए जाएंगे।' },
  { id: 'da-hi-3', category: 'digital_arrest', lang: 'hi', source: 'call', text: 'नारकोटिक्स विभाग से इंस्पेक्टर बात कर रहे हैं। आपके आधार से जुड़े पार्सल में 150 ग्राम एमडीएमए और नकली पासपोर्ट पकड़े गए हैं। अभी स्काइप पर आइए वरना आपको गिरफ्तार कर लिया जाएगा।' },
  { id: 'da-hl-1', category: 'digital_arrest', lang: 'hinglish', source: 'call', text: 'Main Mumbai crime branch se bol raha hu. Aapke naam se ek parcel pakda gaya hai jisme drugs mile hain. Aapke against FIR darj ho gayi hai, abhi video call par aao warna giraftar kar liya jayega. Ye baat kisi ko mat batana.' },
  { id: 'da-hl-2', category: 'digital_arrest', lang: 'hinglish', source: 'whatsapp', text: 'Aapka Aadhaar money laundering case me use hua hai. CBI officer se baat karo, aapka digital arrest ho chuka hai. Verification ke liye paise RBI account me transfer karne honge, baad me wapas mil jayenge.' },

  // kyc_update
  { id: 'kyc-en-1', category: 'kyc_update', lang: 'en', source: 'sms', sender: '+91 73192 45610', text: 'Dear customer, your SBI YONO account will be blocked today. Please update your PAN card immediately: http://sbi-yono-kyc.in/update' },
  { id: 'kyc-en-2', category: 'kyc_update', lang: 'en', source: 'sms', text: 'HDFC BANK: Dear customer your KYC has expired. Your account will be suspended within 24 hours. Update KYC now: hdfc-kyc-update.top/login' },
  { id: 'kyc-en-3', category: 'kyc_update', lang: 'en', source: 'sms', text: 'Dear ICICI user, your net banking access is temporarily blocked due to incomplete KYC. Click the link to reactivate: https://bit.ly/3xKYCicici' },
  { id: 'kyc-en-4', category: 'kyc_update', lang: 'en', source: 'sms', text: 'Your Paytm KYC is pending. Your wallet will be deactivated tonight. Complete e-KYC by calling our KYC executive at 7488123456.' },
  { id: 'kyc-en-5', category: 'kyc_update', lang: 'en', source: 'sms', text: 'Axis Bank alert: PAN card not linked with your account. Your debit card will be blocked. Link PAN now at axisbank-pan-update.com' },
  { id: 'kyc-en-6', category: 'kyc_update', lang: 'en', source: 'call', text: 'Your Kotak account KYC is due. Download the AnyDesk app and share the code with our verification officer to complete re-KYC today, otherwise your account will be frozen.' },
  { id: 'kyc-hi-1', category: 'kyc_update', lang: 'hi', source: 'sms', text: 'प्रिय ग्राहक, आपका केवाईसी अपडेट नहीं है। आपका बैंक खाता आज रात 12 बजे बंद कर दिया जाएगा। तुरंत नीचे दिए लिंक पर क्लिक करके केवाईसी अपडेट करें: http://kyc-sbi-online.xyz' },
  { id: 'kyc-hi-2', category: 'kyc_update', lang: 'hi', source: 'sms', text: 'एसबीआई: आपका पैन कार्ड लिंक नहीं है, आपका योनो खाता ब्लॉक हो जाएगा। अभी अपडेट करें: sbi-pan.in' },
  { id: 'kyc-hl-1', category: 'kyc_update', lang: 'hinglish', source: 'sms', text: 'Dear customer aapka KYC pending hai, aapka account aaj band ho jayega. Is link pe click karke KYC update karo: http://bit.ly/sbi-kyc-update' },
  { id: 'kyc-hl-2', category: 'kyc_update', lang: 'hinglish', source: 'whatsapp', text: 'Aapke bank account ki KYC expire ho gayi hai, 24 ghante me update nahi kiya to khata block ho jayega. KYC update ke liye ye app download karo: http://kyc-help.in/SBI_KYC.apk' },

  // upi_collect
  { id: 'upi-en-1', category: 'upi_collect', lang: 'en', source: 'whatsapp', text: 'Hi, I have sent you a collect request of Rs 5,000 on PhonePe for the sofa. Please approve the request and enter your UPI PIN to receive the money.' },
  { id: 'upi-en-2', category: 'upi_collect', lang: 'en', source: 'sms', text: 'Congratulations! You have received a cashback of Rs 2,999 from Google Pay. Accept the payment request and enter your UPI PIN to get the cashback in your account.' },
  { id: 'upi-en-3', category: 'upi_collect', lang: 'en', source: 'call', text: 'Flipkart Refund Team: Your refund of Rs 1,499 is ready. You will get a collect request now, approve it to receive your refund.' },
  { id: 'upi-en-4', category: 'upi_collect', lang: 'en', source: 'call', text: 'Amazon customer support: To receive your refund of Rs 3,200, please approve the UPI request sent to your number and enter your MPIN.' },
  { id: 'upi-hi-1', category: 'upi_collect', lang: 'hi', source: 'sms', text: 'आपके लिए 5000 रुपये का कैशबैक आया है। पैसे प्राप्त करने के लिए अपना यूपीआई पिन डालें।' },
  { id: 'upi-hi-2', category: 'upi_collect', lang: 'hi', source: 'whatsapp', text: 'मैंने आपको पेमेंट रिक्वेस्ट भेजी है, उसे Accept करके पिन डालिए, पैसे आपके खाते में आ जाएंगे।' },
  { id: 'upi-hl-1', category: 'upi_collect', lang: 'hinglish', source: 'whatsapp', text: 'Bhai maine collect request bheji hai, accept karke UPI PIN daal do, paise aapke account me credit ho jayenge.' },
  { id: 'upi-hl-2', category: 'upi_collect', lang: 'hinglish', source: 'call', text: 'Sir aapka refund 2,500 rs process ho gaya hai. Paise receive karne ke liye request accept karo aur pin enter karo.' },

  // qr_receive
  { id: 'qr-en-1', category: 'qr_receive', lang: 'en', source: 'whatsapp', text: 'I am interested in your bike on OLX. I am sending the full amount through QR code. Just scan this QR code and enter your PIN to receive the payment.' },
  { id: 'qr-en-2', category: 'qr_receive', lang: 'en', source: 'whatsapp', text: 'Your Swiggy refund of Rs 750 is pending. Scan the attached QR code to receive the money in your account.' },
  { id: 'qr-en-3', category: 'qr_receive', lang: 'en', source: 'qr', kind: 'upi', text: 'upi://pay?pa=refund.desk@axl&pn=Amazon%20Refund&am=5000&tn=Receive%20refund%20amount' },
  { id: 'qr-en-4', category: 'qr_receive', lang: 'en', source: 'whatsapp', text: 'Scan this QR to get your cashback of Rs 999 instantly credited to your account.' },
  { id: 'qr-en-5', category: 'qr_receive', lang: 'en', source: 'qr', text: 'upi://pay?pa=9876543210@ybl&pn=Prize%20Department&am=1&tn=lottery%20prize%20claim' },
  { id: 'qr-hi-1', category: 'qr_receive', lang: 'hi', source: 'whatsapp', text: 'पैसे पाने के लिए यह क्यूआर कोड स्कैन करें और अपना पिन डालें, रकम तुरंत आपके खाते में आ जाएगी।' },
  { id: 'qr-hl-1', category: 'qr_receive', lang: 'hinglish', source: 'whatsapp', text: 'QR code scan karo aur payment receive karo, 5000 rs advance bhej raha hu sofa ke liye.' },
  { id: 'qr-hl-2', category: 'qr_receive', lang: 'hinglish', source: 'whatsapp', text: 'Aapka inaam 10,000 rs ka hai, ye QR scan karke paise apne account me le lo.' },

  // fake_refund
  { id: 'ref-en-1', category: 'fake_refund', lang: 'en', source: 'whatsapp', text: "Hello sir, sorry, I sent Rs 5,000 to your Paytm number by mistake. It was for my son's hospital fees. Please return it, I am in urgent need." },
  { id: 'ref-en-2', category: 'fake_refund', lang: 'en', source: 'sms', text: 'Rs 10,000 has been credited to your account by mistake from my side. Please kindly send it back to this number 9123456780 on Google Pay.' },
  { id: 'ref-en-3', category: 'fake_refund', lang: 'en', source: 'sms', text: 'Your refund for the cancelled order #OD2235 is pending. To process the refund, fill the refund form: http://flipkart-refund-form.online' },
  { id: 'ref-en-4', category: 'fake_refund', lang: 'en', source: 'sms', text: 'Myntra: refund of Rs 2,349 for your returned product is on hold. Call our refund department at 8899776655 to get your refund.' },
  { id: 'ref-hi-1', category: 'fake_refund', lang: 'hi', source: 'call', text: 'भाई साहब, मैंने गलती से आपके खाते में 3000 रुपये भेज दिए हैं। कृपया वापस कर दीजिए, मेरी बेटी की परीक्षा की फीस है।' },
  { id: 'ref-hi-2', category: 'fake_refund', lang: 'hi', source: 'sms', text: 'आपके कैंसिल ऑर्डर का रिफंड लंबित है। रिफंड पाने के लिए इस नंबर पर कॉल करें 7766554433।' },
  { id: 'ref-hl-1', category: 'fake_refund', lang: 'hinglish', source: 'whatsapp', text: 'Sir galti se aapke account me 2000 transfer ho gaye, please wapas bhej dijiye, emergency hai.' },
  { id: 'ref-hl-2', category: 'fake_refund', lang: 'hinglish', source: 'call', text: 'Aapka refund pending hai, refund lene ke liye AnyDesk app download karo aur code batao.' },

  // job_task
  { id: 'job-en-1', category: 'job_task', lang: 'en', source: 'whatsapp', sender: '+1 (469) 555-0182', text: "Hello! I'm Priya from a digital marketing agency. We are hiring part-time workers. Just like YouTube videos and earn Rs 150 per like. Daily income Rs 3,000-8,000. Interested? Reply YES." },
  { id: 'job-en-2', category: 'job_task', lang: 'en', source: 'whatsapp', text: 'Work from home job! Earn 5k-10k daily by rating hotels on Google Maps. No experience needed. Contact HR on Telegram: t.me/hr_ankita_jobs' },
  { id: 'job-en-3', category: 'job_task', lang: 'en', source: 'sms', text: 'Congratulations, you are selected for an online part-time job. Complete simple tasks and earn up to Rs 25,000 per week. Join our Telegram group to start.' },
  { id: 'job-en-4', category: 'job_task', lang: 'en', source: 'whatsapp', text: 'Prepaid task available: invest Rs 1,000 and get Rs 1,450 within 30 minutes. Complete 3 merchant tasks to unlock your commission withdrawal.' },
  { id: 'job-en-5', category: 'job_task', lang: 'en', source: 'sms', text: 'Amazon is hiring for work from home data entry jobs. Registration fee Rs 499 only. Earn Rs 2,000 per day. Apply: amazon-jobs-india.online' },
  { id: 'job-en-6', category: 'job_task', lang: 'en', source: 'whatsapp', sender: '+62 812 3456 7890', text: 'Hi, I got your number from a job portal. We offer online part-time work, 30 to 60 minutes a day, salary Rs 2,000 to 5,000 per day. Can I share the details?' },
  { id: 'job-hi-1', category: 'job_task', lang: 'hi', source: 'whatsapp', text: 'घर बैठे रोज ₹3000 कमाएं! बस यूट्यूब वीडियो लाइक करें। अधिक जानकारी के लिए टेलीग्राम पर संपर्क करें।' },
  { id: 'job-hi-2', category: 'job_task', lang: 'hi', source: 'whatsapp', text: 'पार्ट टाइम नौकरी: होटल को 5 स्टार रिव्यू दें और हर रिव्यू पर ₹200 कमाएं। पहले ₹500 जमा करें और अपना टास्क शुरू करें।' },
  { id: 'job-hl-1', category: 'job_task', lang: 'hinglish', source: 'whatsapp', text: 'Ghar baithe part time job karo, roz 5000 kamao. Bas YouTube video like karna hai. Telegram pe contact karo @priya_hr' },
  { id: 'job-hl-2', category: 'job_task', lang: 'hinglish', source: 'whatsapp', text: 'Sir aapka task complete ho gaya, commission withdraw karne ke liye pehle 2000 rs deposit karna padega.' },

  // investment
  { id: 'inv-en-1', category: 'investment', lang: 'en', source: 'whatsapp', text: 'Join our VIP stock tips WhatsApp group. SEBI registered advisor. 30% guaranteed returns every month. Limited seats, join now: chat.whatsapp.com/Abc123xyz' },
  { id: 'inv-en-2', category: 'investment', lang: 'en', source: 'whatsapp', text: 'IPO allotment guaranteed through our institutional account. Invest Rs 50,000 today and get Rs 1.5 lakh in 15 days. Download our trading app: bit.ly/inst-trade' },
  { id: 'inv-en-3', category: 'investment', lang: 'en', source: 'web', text: 'Double your money in 30 days with our AI crypto trading platform. Minimum investment 100 USDT. Risk-free, 100% guaranteed profit.' },
  { id: 'inv-en-4', category: 'investment', lang: 'en', source: 'whatsapp', text: 'Dear investor, our sure-shot intraday calls gave 400% returns last month. Join our premium group for operator stock tips: t.me/nifty_jackpot_calls' },
  { id: 'inv-en-5', category: 'investment', lang: 'en', source: 'sms', text: 'Earn fixed daily returns of 3% on your deposit. Our forex trading platform is SEBI approved. Register now and get Rs 500 bonus.' },
  { id: 'inv-hi-1', category: 'investment', lang: 'hi', source: 'whatsapp', text: 'शेयर बाजार में निवेश करें और हर महीने 20% गारंटीड मुनाफा पाएं। सेबी रजिस्टर्ड सलाहकार। अभी व्हाट्सऐप ग्रुप जॉइन करें।' },
  { id: 'inv-hi-2', category: 'investment', lang: 'hi', source: 'whatsapp', text: 'सिर्फ 15 दिन में पैसा डबल! 10,000 रुपये लगाइए और 20,000 रुपये पाइए। यह पूरी तरह सुरक्षित निवेश है।' },
  { id: 'inv-hl-1', category: 'investment', lang: 'hinglish', source: 'whatsapp', text: 'Paisa double karo sirf 15 din me, guaranteed return. Bitcoin trading me invest karo, roz 5% profit milega.' },
  { id: 'inv-hl-2', category: 'investment', lang: 'hinglish', source: 'whatsapp', text: 'Bhai VIP group join kar lo, insider tips milti hain, har din 10-20% munafa pakka. Link: t.me/stockking_vip' },

  // lottery_prize
  { id: 'lot-en-1', category: 'lottery_prize', lang: 'en', source: 'whatsapp', text: 'Congratulations! Your mobile number has won Rs 25,00,000 in the KBC Lucky Draw 2026. To claim your prize, contact our manager Rana Pratap on WhatsApp +92 300 1234567 and pay Rs 15,000 processing fee.' },
  { id: 'lot-en-2', category: 'lottery_prize', lang: 'en', source: 'sms', text: 'You have won an iPhone 16 Pro in the Flipkart Big Billion lucky draw! Pay delivery charges of Rs 499 to claim your prize: flipkart-luckydraw.top' },
  { id: 'lot-en-3', category: 'lottery_prize', lang: 'en', source: 'sms', text: 'Jio Lucky Draw: your number is selected as the winner of Rs 15 lakh. Pay GST of Rs 12,500 to release the amount.' },
  { id: 'lot-en-4', category: 'lottery_prize', lang: 'en', source: 'whatsapp', text: 'WhatsApp Lottery 2026: You are the lucky winner of a cash prize of Rs 50 lakh and a Tata Nexon car. Send your name, address and bank details to claim.' },
  { id: 'lot-hi-1', category: 'lottery_prize', lang: 'hi', source: 'whatsapp', text: 'बधाई हो! आपने कौन बनेगा करोड़पति में 25 लाख रुपये जीते हैं। इनाम पाने के लिए 9876512345 पर व्हाट्सऐप करें।' },
  { id: 'lot-hi-2', category: 'lottery_prize', lang: 'hi', source: 'sms', text: 'आपका मोबाइल नंबर लकी ड्रा में चुना गया है। 10 लाख रुपये का इनाम पाने के लिए ₹8,500 टैक्स जमा करें।' },
  { id: 'lot-hl-1', category: 'lottery_prize', lang: 'hinglish', source: 'whatsapp', text: 'Badhai ho! Aapne 25 lakh ki lottery jeeti hai. Claim karne ke liye registration fee 5000 rs bhejo.' },
  { id: 'lot-hl-2', category: 'lottery_prize', lang: 'hinglish', source: 'whatsapp', text: 'Aapka number KBC lucky draw me select hua hai, 35 lakh ka inaam milega. Manager se baat karo WhatsApp pe.' },

  // loan_app
  { id: 'loan-en-1', category: 'loan_app', lang: 'en', source: 'sms', text: 'Instant personal loan up to Rs 5 lakh without documents or CIBIL check. Get money in 5 minutes. Download the app: bit.ly/quickcash-loan' },
  { id: 'loan-en-2', category: 'loan_app', lang: 'en', source: 'sms', text: 'Congratulations! Your loan of Rs 3,00,000 has been approved. Pay a processing fee of Rs 2,999 to get the amount disbursed today.' },
  { id: 'loan-en-3', category: 'loan_app', lang: 'en', source: 'whatsapp', text: "You have not repaid your loan. If you don't pay today we will send your morphed photos to all your contacts and post them on social media." },
  { id: 'loan-en-4', category: 'loan_app', lang: 'en', source: 'whatsapp', text: 'Final warning: pay your overdue amount of Rs 8,450 by 6 PM or we will call your family and friends and tell them you are a fraud.' },
  { id: 'loan-hi-1', category: 'loan_app', lang: 'hi', source: 'sms', text: 'बिना दस्तावेज तुरंत लोन पाएं! 5 मिनट में पैसा खाते में। अभी ऐप डाउनलोड करें।' },
  { id: 'loan-hi-2', category: 'loan_app', lang: 'hi', source: 'whatsapp', text: 'आपका लोन बकाया है, आज पैसा नहीं चुकाया तो आपकी फोटो वायरल कर देंगे और सभी रिश्तेदारों को भेज देंगे।' },
  { id: 'loan-hl-1', category: 'loan_app', lang: 'hinglish', source: 'whatsapp', text: 'Loan ka paisa wapas karo warna teri photo viral kar denge, sab contacts ko bhej denge.' },
  { id: 'loan-hl-2', category: 'loan_app', lang: 'hinglish', source: 'sms', text: 'Bina documents ke turant loan, CIBIL kharab hai to bhi chalega. Loan approve ho gaya hai, bas file charge 1500 rs bhejo.' },

  // sextortion
  { id: 'sex-en-1', category: 'sextortion', lang: 'en', source: 'whatsapp', text: 'I have recorded your video call. Pay Rs 50,000 or I will send this video to your wife, your family and all your Facebook friends.' },
  { id: 'sex-en-2', category: 'sextortion', lang: 'en', source: 'whatsapp', text: 'Your nude video is with us. Send Rs 25,000 in 2 hours or we will upload it on YouTube and share it with your contacts.' },
  { id: 'sex-en-3', category: 'sextortion', lang: 'en', source: 'call', text: 'This is Delhi Police cyber cell. A girl has filed a complaint against you for an obscene video call. Pay Rs 30,000 to delete the video from YouTube or face arrest.' },
  { id: 'sex-hi-1', category: 'sextortion', lang: 'hi', source: 'whatsapp', text: 'तुम्हारा अश्लील वीडियो हमारे पास है। 20 हजार रुपये भेजो वरना सबको भेज देंगे और वायरल कर देंगे।' },
  { id: 'sex-hi-2', category: 'sextortion', lang: 'hi', source: 'whatsapp', text: 'आपकी वीडियो कॉल रिकॉर्ड हो गई है। पैसे नहीं दिए तो आपके परिवार और दोस्तों को भेज दूंगी।' },
  { id: 'sex-hl-1', category: 'sextortion', lang: 'hinglish', source: 'whatsapp', text: 'Tera video record ho gaya hai, 20000 bhej warna sab relatives ko bhej dunga aur YouTube pe daal dunga.' },
  { id: 'sex-hl-2', category: 'sextortion', lang: 'hinglish', source: 'whatsapp', text: 'Video call record ho gayi hai, abhi paise bhejo warna video viral kar denge.' },

  // otp_theft
  { id: 'otp-en-1', category: 'otp_theft', lang: 'en', source: 'call', text: 'Hello sir, I am calling from SBI head office. Your debit card will be blocked due to suspicious activity. I have sent an OTP to your mobile, please share the OTP to stop the blocking.' },
  { id: 'otp-en-2', category: 'otp_theft', lang: 'en', source: 'whatsapp', text: "Hi, I accidentally sent my WhatsApp verification code to your number. Can you please forward the 6-digit code to me? It's urgent." },
  { id: 'otp-en-3', category: 'otp_theft', lang: 'en', source: 'call', text: 'Dear customer, to verify your Amazon order, please tell us the OTP you received just now. Our delivery executive is waiting.' },
  { id: 'otp-en-4', category: 'otp_theft', lang: 'en', source: 'call', text: 'This is from Airtel. Your SIM will be deactivated today. To keep your number active, read out the OTP sent to you by SMS.' },
  { id: 'otp-en-5', category: 'otp_theft', lang: 'en', source: 'call', text: 'Dear customer, your credit card reward conversion is ready. Please share your card number, CVV and expiry date with our executive to process it.' },
  { id: 'otp-hi-1', category: 'otp_theft', lang: 'hi', source: 'call', text: 'मैं बैंक से बोल रहा हूँ, आपके मोबाइल पर एक ओटीपी आया होगा, कृपया वह ओटीपी बताइए ताकि आपका कार्ड चालू रहे।' },
  { id: 'otp-hi-2', category: 'otp_theft', lang: 'hi', source: 'call', text: 'आपका क्रेडिट कार्ड अपग्रेड करने के लिए आपके फोन पर आया ओटीपी हमें बताएं।' },
  { id: 'otp-hl-1', category: 'otp_theft', lang: 'hinglish', source: 'call', text: 'Sir aapke phone par ek OTP aaya hoga, wo bata dijiye verification ke liye, warna card block ho jayega.' },
  { id: 'otp-hl-2', category: 'otp_theft', lang: 'hinglish', source: 'whatsapp', text: 'Bhai galti se mera WhatsApp code tere number pe aa gaya, please wo 6 digit code bhej de.' },

  // fake_support
  { id: 'sup-en-1', category: 'fake_support', lang: 'en', source: 'web', text: 'Amazon Customer Care: For refund and order issues call our 24x7 helpline 9831456720.' },
  { id: 'sup-en-2', category: 'fake_support', lang: 'en', source: 'web', text: 'Facing a problem with your PhonePe transaction? Contact PhonePe customer support at 7044123456 for an instant refund.' },
  { id: 'sup-en-3', category: 'fake_support', lang: 'en', source: 'sms', text: 'Your complaint has been registered. Our support executive will call you. Kindly download the AnyDesk app for faster resolution.' },
  { id: 'sup-en-4', category: 'fake_support', lang: 'en', source: 'web', text: 'Google Pay helpline number: 8250-123-456. Call now to claim your failed transaction refund.' },
  { id: 'sup-hi-1', category: 'fake_support', lang: 'hi', source: 'web', text: 'रिफंड के लिए कस्टमर केयर नंबर 9088776655 पर कॉल करें।' },
  { id: 'sup-hi-2', category: 'fake_support', lang: 'hi', source: 'sms', text: 'पेटीएम ग्राहक सेवा: कैशबैक की समस्या के लिए तुरंत इस नंबर पर संपर्क करें 8017654321' },
  { id: 'sup-hl-1', category: 'fake_support', lang: 'hinglish', source: 'whatsapp', text: 'Refund ke liye is number par call karo: 9123987654, ye Flipkart ka customer care number hai.' },

  // courier_parcel
  { id: 'cour-en-1', category: 'courier_parcel', lang: 'en', source: 'sms', text: 'India Post: Your package could not be delivered due to incomplete address. Please update your address within 12 hours: https://indiapost-gov.top/track' },
  { id: 'cour-en-2', category: 'courier_parcel', lang: 'en', source: 'sms', text: 'DHL Express: Your shipment is on hold at our warehouse. Pay Rs 25 redelivery fee to reschedule delivery: dhl-redelivery.in' },
  { id: 'cour-en-3', category: 'courier_parcel', lang: 'en', source: 'call', text: 'FedEx: A parcel sent in your name to Taiwan contains 5 passports, 3 credit cards and 140 grams of MDMA. Press 1 to speak with our customer care executive.' },
  { id: 'cour-en-4', category: 'courier_parcel', lang: 'en', source: 'whatsapp', text: 'BlueDart: your parcel is held at Mumbai customs. Pay custom clearance charges of Rs 1,850 to the officer on UPI to release it.' },
  { id: 'cour-en-5', category: 'courier_parcel', lang: 'en', source: 'sms', text: 'Your Delhivery package delivery failed. Confirm your address and pay a small fee of Rs 19 at delhivery-reschedule.com' },
  { id: 'cour-hi-1', category: 'courier_parcel', lang: 'hi', source: 'sms', text: 'इंडिया पोस्ट: आपका पार्सल गोदाम में रुका हुआ है क्योंकि पता अधूरा है। 24 घंटे में पता अपडेट करें: indiapost-help.xyz' },
  { id: 'cour-hi-2', category: 'courier_parcel', lang: 'hi', source: 'call', text: 'आपके नाम का एक पार्सल कस्टम विभाग ने जब्त किया है, उसमें ड्रग्स मिले हैं। अधिक जानकारी के लिए 1 दबाएं।' },
  { id: 'cour-hl-1', category: 'courier_parcel', lang: 'hinglish', source: 'call', text: 'Aapka parcel customs me pakda gaya hai, usme drugs mile hain. Abhi 9 dabaye aur officer se baat kare.' },
  { id: 'cour-hl-2', category: 'courier_parcel', lang: 'hinglish', source: 'sms', text: 'Aapka courier delivery fail ho gaya hai, address update karo aur 29 rs pay karo: bluedart-track.online' },

  // utility_disconnect
  { id: 'util-en-1', category: 'utility_disconnect', lang: 'en', source: 'sms', sender: '+91 76081 23456', text: 'Dear Consumer, your electricity power will be disconnected tonight at 9:30 pm from the electricity office because your previous month bill was not updated. Please immediately contact our electricity officer 7608123456. Thank you.' },
  { id: 'util-en-2', category: 'utility_disconnect', lang: 'en', source: 'sms', text: 'MSEDCL: Dear customer your light connection will be cut today at 10 PM. Last month bill is not paid. Call 9865432101 immediately.' },
  { id: 'util-en-3', category: 'utility_disconnect', lang: 'en', source: 'sms', text: 'BESCOM alert: your power supply will be disconnected tonight. Update your bill by installing the Electricity Bill Update app: http://bescom-bill.in/app.apk' },
  { id: 'util-en-4', category: 'utility_disconnect', lang: 'en', source: 'sms', text: 'Your gas connection will be disconnected today due to pending KYC. Contact the Indane officer on 9988012345 now.' },
  { id: 'util-hi-1', category: 'utility_disconnect', lang: 'hi', source: 'sms', text: 'प्रिय उपभोक्ता, आपका पिछले महीने का बिल अपडेट नहीं हुआ है, आज रात 9:30 बजे आपकी बिजली काट दी जाएगी। तुरंत बिजली अधिकारी से संपर्क करें 9876501234' },
  { id: 'util-hi-2', category: 'utility_disconnect', lang: 'hi', source: 'sms', text: 'बिजली विभाग: आपका कनेक्शन आज रात काट दिया जाएगा। बिल अपडेट करने के लिए इस नंबर पर कॉल करें 8765012345।' },
  { id: 'util-hl-1', category: 'utility_disconnect', lang: 'hinglish', source: 'sms', text: 'Aapka bijli connection aaj raat 9:30 baje kaat diya jayega, bill update nahi hua hai. Turant officer ko call karein 7012345678.' },

  // reward_points
  { id: 'rp-en-1', category: 'reward_points', lang: 'en', source: 'sms', text: 'Dear SBI Card user, your reward points worth Rs 7,850 will expire today. Redeem now: http://sbicard-rewards.co/redeem' },
  { id: 'rp-en-2', category: 'reward_points', lang: 'en', source: 'whatsapp', text: 'HDFC Bank: Your credit card reward points (9,250) are expiring today. Download the HDFC Rewards APK to redeem: HDFC_Rewards.apk' },
  { id: 'rp-en-3', category: 'reward_points', lang: 'en', source: 'sms', text: 'Your ICICI reward points worth Rs 4,999 are about to lapse. Convert them to cash before midnight: bit.ly/icici-points' },
  { id: 'rp-hi-1', category: 'reward_points', lang: 'hi', source: 'sms', text: 'आपके क्रेडिट कार्ड के रिवॉर्ड पॉइंट्स आज समाप्त हो रहे हैं। अभी रिडीम करें: http://reward-points-sbi.in' },
  { id: 'rp-hl-1', category: 'reward_points', lang: 'hinglish', source: 'sms', text: 'Aapke reward points aaj expire ho rahe hain, turant redeem karein is link se: http://axis-reward.in/claim' },
  { id: 'rp-hl-2', category: 'reward_points', lang: 'hinglish', source: 'whatsapp', text: 'SBI reward point 6,540 rs ka hai, redeem karne ke liye SBI Rewards.apk download kare.' },

  // tax_refund
  { id: 'tax-en-1', category: 'tax_refund', lang: 'en', source: 'sms', text: 'Income Tax Department: You are eligible for an income tax refund of Rs 15,490. Please verify your account details to receive it: http://incometax-refund.in/verify' },
  { id: 'tax-en-2', category: 'tax_refund', lang: 'en', source: 'sms', text: 'ITR refund of Rs 18,200 approved. Update your bank account number at https://efiling-refund.online to get it credited today.' },
  { id: 'tax-en-3', category: 'tax_refund', lang: 'en', source: 'email', sender: 'Income Tax India <refunds@incometax-gov-in.com>', text: 'Dear Taxpayer, your refund of INR 26,350 is pending due to incorrect bank details. Click here to submit your card details and claim the refund.' },
  { id: 'tax-en-4', category: 'tax_refund', lang: 'en', source: 'sms', text: 'GST refund of Rs 9,800 has been sanctioned for your firm. To receive the amount, download the GST Refund app and enter your net banking ID.' },
  { id: 'tax-hi-1', category: 'tax_refund', lang: 'hi', source: 'sms', text: 'आयकर विभाग: आपका 12,500 रुपये का रिफंड स्वीकृत हो गया है। रिफंड पाने के लिए अपना खाता सत्यापित करें: itrefund-gov.in' },
  { id: 'tax-hl-1', category: 'tax_refund', lang: 'hinglish', source: 'sms', text: 'Income tax refund approve ho gaya hai Rs 18,200 ka. Account verify karo is link se: http://it-refund.co' },

  // govt_scheme
  { id: 'gov-en-1', category: 'govt_scheme', lang: 'en', source: 'sms', text: 'PM Kisan Yojana: Rs 6,000 installment pending. Register with Aadhaar and pay Rs 199 registration fee at pmkisan-gov.in' },
  { id: 'gov-en-2', category: 'govt_scheme', lang: 'en', source: 'whatsapp', text: 'Free Laptop Yojana 2026 for all students. Apply now before the last date: bit.ly/free-laptop-yojana. Forward this message to 10 groups.' },
  { id: 'gov-en-3', category: 'govt_scheme', lang: 'en', source: 'whatsapp', text: 'Government is giving free 3 months recharge of Rs 239 to all Indian users under the Digital India scheme. Click here to activate your free recharge: free-recharge-modi.xyz' },
  { id: 'gov-hi-1', category: 'govt_scheme', lang: 'hi', source: 'whatsapp', text: 'सरकार की नई योजना: सभी महिलाओं को ₹5000 मिलेंगे। पंजीकरण के लिए ₹100 शुल्क जमा करें।' },
  { id: 'gov-hi-2', category: 'govt_scheme', lang: 'hi', source: 'whatsapp', text: 'प्रधानमंत्री मुफ्त लैपटॉप योजना में आवेदन करें, अभी लिंक पर रजिस्टर करें: http://pm-laptop-yojana.in' },
  { id: 'gov-hl-1', category: 'govt_scheme', lang: 'hinglish', source: 'whatsapp', text: 'Free ration card yojana shuru hui hai, form bharne ke liye 50 rs bhejo is number pe 9001234567.' },
  { id: 'gov-hl-2', category: 'govt_scheme', lang: 'hinglish', source: 'whatsapp', text: 'Modi sarkar ki taraf se sabko free mobile, abhi apply karo is link se aur 10 groups me share karo: http://free-mobile-yojana.top' },

  // malicious_app
  { id: 'app-en-1', category: 'malicious_app', lang: 'en', source: 'whatsapp', text: 'Wedding invitation 💌 Please open and see our card: Wedding_Invitation_Card.apk' },
  { id: 'app-en-2', category: 'malicious_app', lang: 'en', source: 'whatsapp', text: 'PM Kisan new list released. Check your name: PM_Kisan_Yojana.apk' },
  { id: 'app-en-3', category: 'malicious_app', lang: 'en', source: 'sms', text: 'Traffic challan of Rs 2,000 issued for your vehicle. Download the RTO challan app to view: RTO_Traffic_Challan.apk' },
  { id: 'app-en-4', category: 'malicious_app', lang: 'en', source: 'whatsapp', text: 'SBI Rewards: install the attached app to redeem your points. File: SBI_Rewards.apk' },
  { id: 'app-hi-1', category: 'malicious_app', lang: 'hi', source: 'whatsapp', text: 'शादी का निमंत्रण कार्ड देखें, यह फाइल खोलें: shaadi_card.apk' },
  { id: 'app-hl-1', category: 'malicious_app', lang: 'hinglish', source: 'whatsapp', text: 'Bijli bill check karne ke liye ye app install karo: http://bill-update.in/ElectricityBill.apk' },
  { id: 'app-hl-2', category: 'malicious_app', lang: 'hinglish', source: 'whatsapp', text: 'Customer support app download karo is link se aur install karke apna problem solve karo: http://help-support-app.in/support.apk' },

  // remote_access
  { id: 'ra-en-1', category: 'remote_access', lang: 'en', source: 'call', text: 'To process your refund, please download AnyDesk from the Play Store and share the 9-digit code with me.' },
  { id: 'ra-en-2', category: 'remote_access', lang: 'en', source: 'call', text: 'Hello, I am from the Paytm KYC department. Please install TeamViewer QuickSupport so that our technician can verify your account.' },
  { id: 'ra-en-3', category: 'remote_access', lang: 'en', source: 'whatsapp', text: 'Please share your screen on the WhatsApp call so I can guide you to complete the bank verification.' },
  { id: 'ra-hi-1', category: 'remote_access', lang: 'hi', source: 'call', text: 'एनीडेस्क ऐप डाउनलोड करके कोड बताइए, हम आपका रिफंड प्रोसेस कर देंगे।' },
  { id: 'ra-hl-1', category: 'remote_access', lang: 'hinglish', source: 'call', text: 'AnyDesk download karo aur code batao, hum aapka KYC update kar denge.' },
  { id: 'ra-hl-2', category: 'remote_access', lang: 'hinglish', source: 'call', text: 'Sir screen share on karo, main aapko step by step bank account verify karwa deta hu.' },

  // impersonation
  { id: 'imp-en-1', category: 'impersonation', lang: 'en', source: 'whatsapp', text: 'Hi Papa, this is my new number. My phone fell in water. I need Rs 15,000 urgently for exam fees, please send it to this UPI: rohan.k99@ybl' },
  { id: 'imp-en-2', category: 'impersonation', lang: 'en', source: 'whatsapp', text: "Hi, it's your boss Rajesh. I'm in a meeting and can't talk. I need you to buy 5 Amazon gift cards of Rs 10,000 each for a client. Send me the codes quickly and keep this confidential." },
  { id: 'imp-en-3', category: 'impersonation', lang: 'en', source: 'whatsapp', text: 'I am an Army officer posted at Jammu. I want to buy your sofa listed on OLX. I will pay through the army account. First send Rs 1 to verify, then I will send the full payment.' },
  { id: 'imp-en-4', category: 'impersonation', lang: 'en', source: 'call', text: 'Uncle, your son has been arrested by the police in a rape case. Send Rs 50,000 now to settle the case before the FIR is filed.' },
  { id: 'imp-en-5', category: 'impersonation', lang: 'en', source: 'whatsapp', text: 'Hello, this is your manager. Are you free? I need a small favour, please buy Google Play gift cards worth Rs 20,000 and send me the codes. I will reimburse you today.' },
  { id: 'imp-hi-1', category: 'impersonation', lang: 'hi', source: 'whatsapp', text: 'पापा मेरा फोन खराब हो गया है, ये मेरा नया नंबर है। तुरंत 10,000 रुपये भेज दो, बहुत जरूरी है।' },
  { id: 'imp-hi-2', category: 'impersonation', lang: 'hi', source: 'whatsapp', text: 'मैं आर्मी में हूं, आपकी स्कूटी खरीदनी है। पहले क्यूआर स्कैन करके 1 रुपया भेजिए, फिर पूरा पेमेंट कर दूंगा।' },
  { id: 'imp-hl-1', category: 'impersonation', lang: 'hinglish', source: 'whatsapp', text: 'Mummy ye mera naya number hai, mujhe urgent 5000 chahiye, isi number pe GPay kar do please.' },
  { id: 'imp-hl-2', category: 'impersonation', lang: 'hinglish', source: 'call', text: 'Aapka beta police ne pakda hai, mamla rafa dafa karna hai to abhi 30,000 bhejo.' },

  // romance
  { id: 'rom-en-1', category: 'romance', lang: 'en', source: 'whatsapp', text: 'My love, I have sent you a gift parcel with $50,000 cash, gold jewellery and an iPhone. The courier company says customs is asking Rs 45,000 clearance fee. Please pay it so you can receive your gift.' },
  { id: 'rom-en-2', category: 'romance', lang: 'en', source: 'web', text: 'Hello dear, I am Dr. Jessica from the UK, working with the UN. I fell in love with your profile. I want to come to India to marry you but I need money for my flight ticket.' },
  { id: 'rom-en-3', category: 'romance', lang: 'en', source: 'call', text: 'Delhi Airport Customs: A diplomatic gift parcel addressed to you from London has been held. Pay anti-money laundering clearance charges of Rs 68,000 to release it.' },
  { id: 'rom-en-4', category: 'romance', lang: 'en', source: 'whatsapp', text: 'Baby, I am stuck at Mumbai airport with your gift. Immigration officers need Rs 25,000 for clearance. Please send the money to this account, I love you.' },
  { id: 'rom-hi-1', category: 'romance', lang: 'hi', source: 'whatsapp', text: 'मैं तुमसे बहुत प्यार करती हूँ। विदेश से तुम्हारे लिए गिफ्ट भेजा है, कस्टम वाले 35,000 रुपये मांग रहे हैं, प्लीज भर दो।' },
  { id: 'rom-hl-1', category: 'romance', lang: 'hinglish', source: 'whatsapp', text: 'Jaan main tumse milne India aa rahi hu but airport pe customs ne roka hai, 35000 bhej do please.' },

  // sim_swap
  { id: 'sim-en-1', category: 'sim_swap', lang: 'en', source: 'sms', text: 'Dear customer, your SIM card will be blocked within 24 hours due to incomplete KYC. Call 9876123450 to verify now.' },
  { id: 'sim-en-2', category: 'sim_swap', lang: 'en', source: 'call', text: 'Jio: Upgrade your SIM to eSIM for free 5G. Send ESIM <your email> to 199 and share the code you receive with our executive.' },
  { id: 'sim-en-3', category: 'sim_swap', lang: 'en', source: 'call', text: 'TRAI: Your mobile number will be disconnected in 2 hours due to illegal activity reported against it. Press 9 to talk to the officer.' },
  { id: 'sim-en-4', category: 'sim_swap', lang: 'en', source: 'call', text: 'Airtel: your 4G SIM must be upgraded to 5G today or services will stop. Reply with the OTP sent to your number to complete the SIM upgrade.' },
  { id: 'sim-hi-1', category: 'sim_swap', lang: 'hi', source: 'sms', text: 'आपका सिम कार्ड 24 घंटे में बंद हो जाएगा, केवाईसी के लिए तुरंत इस नंबर पर कॉल करें 8899001122।' },
  { id: 'sim-hi-2', category: 'sim_swap', lang: 'hi', source: 'call', text: 'दूरसंचार विभाग: आपके नंबर से गैरकानूनी गतिविधि हुई है, आपका नंबर 2 घंटे में बंद कर दिया जाएगा।' },
  { id: 'sim-hl-1', category: 'sim_swap', lang: 'hinglish', source: 'call', text: 'Aapka SIM 2 ghante me band ho jayega, abhi 9 dabaye aur verification karwaye.' },

  // phishing_link
  { id: 'ph-en-1', category: 'phishing_link', lang: 'en', source: 'sms', text: 'Your Netflix subscription payment failed. Update your payment details to avoid suspension: netflix-billing-update.com' },
  { id: 'ph-en-2', category: 'phishing_link', lang: 'en', source: 'email', text: 'Unusual login detected on your Google account. Verify your identity immediately: http://accounts-google.verify-login.top' },
  { id: 'ph-en-3', category: 'phishing_link', lang: 'en', source: 'sms', text: 'e-Challan: A traffic challan of Rs 500 is pending against your vehicle. Pay now to avoid court action: echallan-parivahan.xyz' },
  { id: 'ph-en-4', category: 'phishing_link', lang: 'en', source: 'email', text: 'Dear user, your account has been compromised. Reset your password here: http://103.24.56.12/secure/login' },
  { id: 'ph-en-5', category: 'phishing_link', lang: 'en', source: 'sms', text: 'Your SBI net banking will be locked. Verify your details at https://sites.google.com/view/sbi-netbanking-verify' },
  { id: 'ph-hi-1', category: 'phishing_link', lang: 'hi', source: 'sms', text: 'आपके वाहन का चालान बकाया है। तुरंत भुगतान करें वरना कोर्ट केस होगा: http://parivahan-challan.top' },
  { id: 'ph-hl-1', category: 'phishing_link', lang: 'hinglish', source: 'whatsapp', text: 'Aapka WhatsApp account band hone wala hai, verify karne ke liye is link pe click karo: http://whatsapp-verify.in' },
  { id: 'ph-en-6', category: 'phishing_link', lang: 'en', source: 'sms', text: 'Your Amazon Prime membership has expired. Renew now at https://amazon-prime-renewal.web.app to keep your benefits.' },

  // lookalike_domain
  { id: 'look-en-1', category: 'lookalike_domain', lang: 'en', source: 'sms', text: 'Login to your HDFC NetBanking to avoid account suspension: https://hdfcbnak.com/netbanking' },
  { id: 'look-en-2', category: 'lookalike_domain', lang: 'en', source: 'sms', text: 'SBI: Your account is locked. Unlock it at https://onlinesbi.sbi.kyc-verify.top' },
  { id: 'look-en-3', category: 'lookalike_domain', lang: 'en', source: 'whatsapp', text: 'Complete your Paytm KYC here: https://paytm-kyc.web.app' },
  { id: 'look-en-4', category: 'lookalike_domain', lang: 'en', source: 'sms', text: 'ICICI Bank alert: verify your account at www.icicibank.co/verify' },
  { id: 'look-en-5', category: 'lookalike_domain', lang: 'en', source: 'sms', text: 'Your IRCTC refund is ready. Login at https://irctc-co.in/refund' },
  { id: 'look-en-6', category: 'lookalike_domain', lang: 'en', source: 'sms', text: 'Track your Amazon order and confirm delivery: https://amaz0n-in.com/track' },
  { id: 'look-en-7', category: 'lookalike_domain', lang: 'en', source: 'web', kind: 'url', text: 'https://www.аmazon.in/great-indian-festival' },
  { id: 'look-hl-1', category: 'lookalike_domain', lang: 'hinglish', source: 'whatsapp', text: 'Apna Flipkart order refund lene ke liye login karo: https://flipkart-refund.vercel.app' },
];
