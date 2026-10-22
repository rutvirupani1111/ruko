import { ComingSoon } from '@/components/ComingSoon';
import { defineStrings, useT } from '@/i18n/core';

const strings = defineStrings(
  {
    title: 'How Ruko protects your privacy',
    body: 'Everything you paste is checked by the engine running inside this page, on your phone. Screenshots are read on the device too. Community lookups send only the first 5 characters of a fingerprint (k-anonymity), so even the server never learns what you checked. A full explanation with an animated diagram is on its way.',
  },
  {
    title: 'Ruko आपकी प्राइवेसी कैसे बचाता है',
    body: 'आप जो भी पेस्ट करते हैं, उसकी जाँच इसी पेज में आपके फ़ोन पर चलने वाला इंजन करता है। स्क्रीनशॉट भी फ़ोन पर ही पढ़े जाते हैं। कम्युनिटी जाँच में फ़िंगरप्रिंट के सिर्फ़ पहले 5 अक्षर भेजे जाते हैं (k-anonymity), इसलिए सर्वर को भी पता नहीं चलता कि आपने क्या जाँचा। एनिमेटेड डायग्राम के साथ पूरी जानकारी जल्द आएगी।',
  },
);

export default function PrivacyPage() {
  const t = useT(strings);
  return <ComingSoon title={t.title} body={t.body} />;
}
