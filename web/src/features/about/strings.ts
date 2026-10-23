import { defineStrings } from '@/i18n/core';

export const aboutStrings = defineStrings(
  'about',
  {
    title: 'About Ruko',
    eyebrow: 'About',
    heading: 'Stop the scam before the money moves',
    intro:
      'Ruko means "stop" or "wait" in Hindi. Most scams work by rushing you: pay now, share the OTP now, or something terrible happens. Ruko gives you a moment to pause, check, and then decide whom to trust.',
    mission: {
      title: 'Why Ruko exists',
      body: [
        'Every day, people across India lose savings to fake KYC messages, "digital arrest" calls, task jobs, investment groups and courier scams. Many checkers ask you to upload your private messages to a cloud chatbot.',
        'Ruko is a free tool that checks on your own phone, speaks English and Hindi, knows Indian banks, UPI apps and helplines, and teaches the tricks so you can spot them yourself next time.',
      ],
    },
    principles: {
      device: { title: 'On your phone', body: 'Checks run in your browser. What you paste stays with you.' },
      india: { title: 'Built for India', body: 'UPI handles, TRAI number series, 1930, cybercrime.gov.in, Chakshu, Hindi and Hinglish.' },
      teach: { title: 'Teaches, not just warns', body: 'A game to practise spotting scams and a calm plan for the worst day.' },
      open: { title: 'Free and open source', body: 'No ads, no account. The code is public for anyone to check or improve.' },
    },
    what: {
      title: 'What you can do here',
      items: {
        check: { title: 'Check a message', body: 'Paste a message, link, UPI ID or number, or scan a QR code.' },
        learn: { title: 'Learn the tricks', body: 'How each common scam in India works and its red flags.' },
        simulator: { title: 'Spot the scam', body: 'Practise on realistic WhatsApp, SMS, email and payment screens.' },
        help: { title: 'Got scammed?', body: 'Step-by-step help and a complaint draft you can copy or print.' },
        report: { title: 'Report a scammer', body: 'Warn others about a UPI ID, number or link, privately.' },
        privacy: { title: 'Privacy', body: 'How Ruko checks without seeing your data.' },
      },
    },
    open: {
      title: 'Open source',
      body: 'The detection engine, this web app and the browser extension are all in one public repository under the MIT licence. Found a scam Ruko missed, or a mistake? Open an issue.',
      code: 'View the code',
      issue: 'Report a problem',
    },
    extension: {
      title: 'Ruko Shield for your browser',
      body: 'The Ruko Shield extension checks links and messages on the websites you visit, such as WhatsApp Web and Gmail, and warns you before you open a fake site. It uses the same on-device engine.',
      cta: 'Download from GitHub releases',
      stepsTitle: 'How to install',
      steps: [
        'On the releases page, download the zip for your browser (Chrome, Edge or Firefox) and unzip it.',
        'Chrome or Edge: open chrome://extensions or edge://extensions, turn on Developer mode, click "Load unpacked" and pick the unzipped folder.',
        'Firefox: open about:debugging, choose "This Firefox", then "Load Temporary Add-on" and pick manifest.json.',
      ],
      stores: 'Store listings (Chrome Web Store, Edge Add-ons, Firefox Add-ons) are on the way.',
    },
    support: {
      title: 'Support the project',
      body: 'Ruko is free and will stay free. If it helped you or your family, you can help keep it running. Donation links are not set up yet.',
      notSet: 'Not set up yet',
      contact: 'Contact',
      other: 'You can also help by sharing Ruko with someone who gets a lot of forwards.',
    },
    disclaimer:
      'Ruko gives guidance, not guarantees, and can be wrong. It is not affiliated with any government body, bank, app or brand named on this site. In an emergency, call 1930.',
  },
  {
    title: 'Ruko के बारे में',
    eyebrow: 'हमारे बारे में',
    heading: 'पैसा जाने से पहले ठगी रोकें',
    intro:
      '"रुको" का मतलब है ठहरो, एक पल रुको। ज़्यादातर ठगी जल्दबाज़ी पर चलती है: अभी पैसे भेजो, अभी OTP बताओ, वरना कुछ बुरा होगा। Ruko आपको एक पल देता है, ताकि आप रुकें, जाँचें और फिर तय करें कि किस पर भरोसा करना है।',
    mission: {
      title: 'Ruko क्यों बना',
      body: [
        'भारत में हर दिन लोग नकली KYC मैसेज, "डिजिटल अरेस्ट" कॉल, टास्क वाली नौकरी, निवेश ग्रुप और कूरियर वाली ठगी में अपनी जमा-पूँजी गँवा देते हैं। कई चेकर आपसे अपने निजी मैसेज किसी क्लाउड चैटबॉट पर अपलोड करवाते हैं।',
        'Ruko एक मुफ़्त टूल है जो आपके अपने फ़ोन पर जाँच करता है, हिंदी और अंग्रेज़ी बोलता है, भारतीय बैंक, UPI ऐप और हेल्पलाइन पहचानता है, और ठगों की चालें सिखाता है, ताकि अगली बार आप खुद पहचान सकें।',
      ],
    },
    principles: {
      device: { title: 'आपके फ़ोन पर', body: 'जाँच आपके ब्राउज़र में होती है। आप जो पेस्ट करते हैं, वह आपके पास रहता है।' },
      india: { title: 'भारत के लिए बना', body: 'UPI हैंडल, TRAI नंबर सीरीज़, 1930, cybercrime.gov.in, चक्षु, हिंदी और हिंग्लिश।' },
      teach: { title: 'सिर्फ़ चेतावनी नहीं, सीख भी', body: 'ठगी पहचानने का अभ्यास करने के लिए एक खेल, और बुरे दिन के लिए एक शांत योजना।' },
      open: { title: 'मुफ़्त और ओपन सोर्स', body: 'न विज्ञापन, न अकाउंट। कोड सबके लिए खुला है, कोई भी जाँच या सुधार सकता है।' },
    },
    what: {
      title: 'यहाँ आप क्या कर सकते हैं',
      items: {
        check: { title: 'मैसेज जाँचें', body: 'मैसेज, लिंक, UPI आईडी या नंबर पेस्ट करें, या QR कोड स्कैन करें।' },
        learn: { title: 'चालें सीखें', body: 'भारत की आम ठगी कैसे होती है और उसके खतरे के संकेत क्या हैं।' },
        simulator: { title: 'स्कैम पहचानें', body: 'असली जैसे WhatsApp, SMS, ईमेल और पेमेंट स्क्रीन पर अभ्यास करें।' },
        help: { title: 'ठगी हो गई?', body: 'कदम-दर-कदम मदद और शिकायत का ड्राफ़्ट, जिसे कॉपी या प्रिंट कर सकें।' },
        report: { title: 'ठग की रिपोर्ट करें', body: 'UPI आईडी, नंबर या लिंक के बारे में दूसरों को प्राइवेट तरीके से सावधान करें।' },
        privacy: { title: 'प्राइवेसी', body: 'Ruko आपका डेटा देखे बिना कैसे जाँच करता है।' },
      },
    },
    open: {
      title: 'ओपन सोर्स',
      body: 'स्कैम पहचानने वाला इंजन, यह वेब ऐप और ब्राउज़र एक्सटेंशन, सब MIT लाइसेंस के तहत एक ही सार्वजनिक रिपॉज़िटरी में हैं। कोई ठगी जो Ruko से छूट गई, या कोई गलती दिखी? एक issue खोलें।',
      code: 'कोड देखें',
      issue: 'समस्या बताएँ',
    },
    extension: {
      title: 'आपके ब्राउज़र के लिए Ruko Shield',
      body: 'Ruko Shield एक्सटेंशन WhatsApp Web और Gmail जैसी वेबसाइटों पर लिंक और मैसेज जाँचता है, और नकली साइट खुलने से पहले आपको सावधान करता है। इसमें वही ऑन-डिवाइस इंजन है।',
      cta: 'GitHub releases से डाउनलोड करें',
      stepsTitle: 'इंस्टॉल कैसे करें',
      steps: [
        'releases पेज से अपने ब्राउज़र (Chrome, Edge या Firefox) की zip फ़ाइल डाउनलोड करें और उसे unzip करें।',
        'Chrome या Edge: chrome://extensions या edge://extensions खोलें, Developer mode चालू करें, "Load unpacked" दबाएँ और unzip किया हुआ फ़ोल्डर चुनें।',
        'Firefox: about:debugging खोलें, "This Firefox" चुनें, फिर "Load Temporary Add-on" दबाकर manifest.json चुनें।',
      ],
      stores: 'स्टोर लिस्टिंग (Chrome Web Store, Edge Add-ons, Firefox Add-ons) जल्द आएँगी।',
    },
    support: {
      title: 'प्रोजेक्ट को सहयोग दें',
      body: 'Ruko मुफ़्त है और मुफ़्त रहेगा। अगर इससे आपको या आपके परिवार को मदद मिली, तो आप इसे चलाते रहने में हाथ बँटा सकते हैं। दान के लिंक अभी तैयार नहीं हैं।',
      notSet: 'अभी तैयार नहीं',
      contact: 'संपर्क',
      other: 'आप Ruko को किसी ऐसे व्यक्ति के साथ शेयर करके भी मदद कर सकते हैं, जिसके पास बहुत सारे फ़ॉरवर्ड आते हैं।',
    },
    disclaimer:
      'Ruko सलाह देता है, गारंटी नहीं, और इससे गलती हो सकती है। यह इस साइट पर लिखे किसी सरकारी विभाग, बैंक, ऐप या ब्रांड से जुड़ा नहीं है। आपात स्थिति में 1930 पर कॉल करें।',
  },
);
