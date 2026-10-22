import { ComingSoon } from '@/components/ComingSoon';
import { defineStrings, useT } from '@/i18n/core';

const strings = defineStrings(
  {
    title: 'About Ruko',
    body: 'Ruko is a free, open-source scam shield for India. It checks messages, links, UPI IDs and numbers on your own phone, teaches the tricks with a game, and helps you act fast if you lost money. The full story, the browser extension and ways to support the project are coming to this page.',
  },
  {
    title: 'Ruko के बारे में',
    body: 'Ruko भारत के लिए एक मुफ़्त, ओपन-सोर्स स्कैम शील्ड है। यह आपके फ़ोन पर ही मैसेज, लिंक, UPI आईडी और नंबर जाँचता है, खेल के ज़रिए चालें सिखाता है, और पैसे जाने पर तुरंत कदम उठाने में मदद करता है। पूरी कहानी, ब्राउज़र एक्सटेंशन और प्रोजेक्ट को सहयोग देने के तरीके जल्द इस पेज पर आएँगे।',
  },
);

export default function AboutPage() {
  const t = useT(strings);
  return <ComingSoon title={t.title} body={t.body} />;
}
