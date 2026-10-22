# Chrome Web Store listing: Ruko Shield

Upload: `.output/ruko-shield-1.0.0-chrome.zip` (built by `npm run zip:chrome`).

## Store item

- **Name** (from `_locales`, 39 chars): Ruko Shield: Scam and Fake Link Checker
- **Summary** (manifest description, 118 chars): Pause. Check. Then trust. On-device warnings for scam messages, fake bank websites, risky links and UPI payment links.
- **Category**: Privacy & Security (fallback: Productivity)
- **Language**: English (also ships Hindi via `_locales/hi`; add a Hindi listing with the text below)
- **Icon**: `store/icon-128.png` (96 px artwork in 16 px padding)
- **Screenshots** (1280x800, PNG): `store/screenshots/01-whatsapp-badges.png` to `05-...` (upload up to 5)
- **Small promo tile** (440x280): `store/promo-small-440x280.png`
- **Marquee** (1400x560, optional): `store/promo-marquee-1400x560.png`
- **Homepage / support URL**: PLACEHOLDER (Ruko web app or repository URL)
- **Privacy policy URL**: PLACEHOLDER (host `store/PRIVACY.md` publicly, e.g. the Ruko web app `/privacy` page)

## Description (English)

Ruko means "stop" in Hindi. Ruko Shield gives you that pause before a scam costs you money.

Indians lose thousands of crores every year to fake KYC messages, "digital arrest" calls, task-job offers, UPI refund tricks and lookalike bank websites. Ruko Shield spots them where they reach you, and it does it on your own device.

WHAT IT DOES
• WhatsApp Web: a small badge appears under suspicious incoming messages, like "Possible KYC scam · Why?". Tap Why? to see the warning signs and what to do. Your messages are never changed.
• Gmail: a clear banner above suspicious emails, with the reasons and next steps.
• Fake websites: a full-page warning when a site pretends to be your bank, a shopping site or a government portal ("This is not the real SBI website"). Leave, or continue if you are sure.
• Link checks: hover a link on WhatsApp Web or Gmail for a moment to see if it is official, shortened or imitating a brand. Optional on every website.
• UPI links: before any upi:// link opens a payment app, Ruko reminds you that UPI links and QR codes are only for paying, never for receiving money.
• Right-click any text or link and choose "Check with Ruko" for a full verdict in the side panel.
• Quick check in the popup: paste a message, link, UPI ID or phone number.
• Full verdict view: risk meter, highlighted red-flag phrases, every link, UPI ID and number with its own mini verdict, and big buttons to call 1930, report at cybercrime.gov.in or report on Chakshu.
• English and Hindi, light and dark, keyboard and screen-reader friendly.

PRIVATE BY DESIGN
• Every check runs inside your browser. Ruko never sends your messages, emails or browsing anywhere.
• No account, no ads, no analytics, no tracking.
• Optional community reports use k-anonymity: only 5 characters of a hash ever leave your device, and only if you turn it on.
• Optional "Explain in simple words" uses your browser's own on-device AI where available.

LOST MONEY? Call 1930 (National Cyber Crime Helpline) immediately and report at cybercrime.gov.in. Ruko shows these buttons whenever money may be at risk.

Ruko Shield is free and open source (MIT).

## Description (Hindi)

"रुको" यानी ठहरो। Ruko Shield आपको वह एक पल देता है, जिससे धोखा आपके पैसे न ले जाए।

नकली KYC मैसेज, "डिजिटल अरेस्ट" कॉल, टास्क जॉब, UPI रिफ़ंड की चाल और नकली बैंक वेबसाइटों से हर साल लोग करोड़ों रुपये गँवाते हैं। Ruko Shield इन्हें वहीं पहचानता है जहाँ ये आप तक पहुँचते हैं, और यह सब आपके अपने डिवाइस पर होता है।

• WhatsApp Web: संदिग्ध मैसेज के नीचे छोटा बैज, जैसे "KYC धोखा हो सकता है · क्यों?"। आपके मैसेज कभी नहीं बदले जाते।
• Gmail: संदिग्ध ईमेल के ऊपर साफ़ चेतावनी।
• नकली वेबसाइट: जो साइट आपके बैंक, शॉपिंग साइट या सरकारी पोर्टल होने का दिखावा करे, उस पर पूरे पेज की चेतावनी।
• लिंक जाँच: लिंक पर थोड़ी देर माउस रखें और देखें कि वह आधिकारिक है या नकली।
• UPI लिंक: पेमेंट ऐप खुलने से पहले याद दिलाता है कि UPI लिंक और QR कोड सिर्फ़ पैसे भेजने के लिए होते हैं।
• राइट-क्लिक करके "Ruko से जाँचें", और पॉपअप में तुरंत जाँच।
• पूरी रिपोर्ट: ख़तरा मीटर, हाइलाइट किए गए संकेत, और 1930 पर कॉल, cybercrime.gov.in और चक्षु पर शिकायत के बड़े बटन।

आपकी जानकारी आपके पास: हर जाँच आपके ब्राउज़र में ही होती है। न विज्ञापन, न ट्रैकिंग।

पैसे गए? तुरंत 1930 पर कॉल करें और cybercrime.gov.in पर शिकायत करें।

## Privacy practices tab

- **Single purpose**: Warn people in India about scams in messages, emails, links, UPI links and lookalike websites, on their own device.
- **Permission justifications**: copy from `store/PERMISSIONS.md` (storage, contextMenus, sidePanel, host permissions).
- **Remote code**: No, I am not using remote code.
- **Data usage**: tick nothing under "collects or uses". Ruko does not collect user data. (Page content and addresses are processed locally and never transmitted.)
- **Certifications**: I do not sell or transfer user data to third parties; I do not use or transfer user data for purposes unrelated to the single purpose; I do not use or transfer user data to determine creditworthiness or for lending purposes.

## Reviewer notes

- Host permissions on all http/https sites are required for the lookalike-website interstitial, which must run before the user types into a fake bank login, and for the upi:// confirmation. The every-site script is tiny and sends only the page address to the extension's own background service worker.
- Test pages: WhatsApp Web (https://web.whatsapp.com), Gmail, or any site; paste the sample scam message from the side panel ("Try an example").
