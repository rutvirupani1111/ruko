import { r, type RuleModule } from './types';

/** UPI collect-request trick: "enter your PIN to receive the refund". */
export const upiCollect: RuleModule = {
  cues: {
    pin: [r`upi[- ]?pin|m-?pin|atm pin|(?:your |the |ur )?pin(?: number| no\.?)?|यूपीआई पिन|पिन`],
    pin_enter: {
      neg: true,
      p: [
        r`(?:enter|type|put|input|insert|provide|share|give|tell|dial|use) (?:your |the |ur |ur upi |your upi )?(?:upi[- ]?)?(?:pin|mpin|m-pin)(?! ?code)`,
        r`(?:upi[- ]?)?(?:pin|mpin)(?! ?code)(?: \S+)? (?:enter|daal|dal|daalo|dalo|dalein|daliye|daaliye|dalna|daalna|dijiye|dalke|daalke|enter karo|enter karein|enter kare|bata|batao|bataye)`,
        r`(?:पिन|यूपीआई पिन)(?: \S+)? (?:डालें|डालिए|डालो|डाल दें|दर्ज करें|बताएं|बताइए)`,
      ],
    },
    receive: [
      r`(?:to |for )?(?:receive|recieve|get|claim|collect|accept) (?:the |your |ur |a )?(?:money|amount|payment|refund|cash ?back|reward|prize|funds|rs\.?|₹|\d)`,
      r`(?:money|amount|payment|refund|cashback|rs\.? ?\d[\d,]*|₹ ?\d[\d,]*)(?: \S+){0,4} (?:will be|gets?|shall be) (?:credited|received|added|deposited|transferred)`,
      r`(?:receive|credit|get) (?:karne|lene|paane|pane) (?:ke liye|ke lie|keliye)|receiving (?:the )?(?:money|payment|amount)`,
      r`(?:paise|paisa|amount|payment|refund|cashback|inaam)(?: \S+){0,4} (?:aa jayenge|aa jaenge|aa jayega|milenge|milega|mil jayenge|mil jayega|credit ho jayenge|credit ho jayega|receive ho jayenge|receive ho jayega)`,
      r`(?:paise|paisa|money|amount|payment|refund|cashback) (?:receive|recieve|prapt|credit) (?:karo|kare|karein|karen|kar lo|karlo|karne|kijiye)`,
      r`(?:apne|aapke|tumhare|your) (?:account|khate|bank)(?: \S+){0,2} (?:me|mein|mai) (?:le lo|lelo|le lijiye|aa jayenge|aa jaenge|credit)`,
      r`(?:प्राप्त|पाने|लेने|रिसीव) (?:करने )?के लिए|पैसे (?:मिलेंगे|आ जाएंगे|मिल जाएंगे|आपके खाते में आ)|(?:अपने|आपके) खाते में (?:ले लें|आ जाएंगे)`,
    ],
    collect: [
      r`collect request|payment request|money request|request (?:money|payment)|(?:approve|accept|authori[sz]e) (?:the |this |my )?(?:collect |payment |upi )?(?:request|payment)`,
      r`कलेक्ट रिक्वेस्ट|पेमेंट रिक्वेस्ट|request (?:accept|approve) (?:karo|karein|kare|kar do)`,
    ],
  },
  rules: [
    {
      id: 'upi.pin_to_receive', cat: 'upi_collect', w: 70, all: ['pin_enter', 'receive'], near: 160,
      en: ['Asks for your UPI PIN to "receive" money', 'You never need a PIN to receive money. Entering it always sends money out of your account.'],
      hi: ['पैसे "पाने" के लिए UPI PIN माँगा', 'पैसे पाने के लिए कभी PIN नहीं लगता। PIN डालने से हमेशा पैसे आपके खाते से जाते हैं।'],
    },
    {
      id: 'upi.accept_to_receive', cat: 'upi_collect', w: 65, all: ['collect', 'receive|refund_word|reward_word|prize_word'],
      en: ['Accept a request to get money', 'Approving a collect request pays the other person. It never brings money to you.'],
      hi: ['पैसे पाने के लिए रिक्वेस्ट मंज़ूर करने को कहा', 'कलेक्ट रिक्वेस्ट मंज़ूर करने पर पैसे सामने वाले को जाते हैं, आपके पास कभी नहीं आते।'],
    },
    {
      id: 'upi.collect_pin', cat: 'upi_collect', w: 25, all: ['collect', 'pin_enter'],
      en: ['A payment request that needs your PIN', 'Only approve requests you started yourself, for something you are buying.'],
      hi: ['PIN वाली पेमेंट रिक्वेस्ट', 'सिर्फ़ वही रिक्वेस्ट मंज़ूर करें जो आपने ख़ुद कुछ ख़रीदने के लिए शुरू की हो।'],
    },
  ],
};
