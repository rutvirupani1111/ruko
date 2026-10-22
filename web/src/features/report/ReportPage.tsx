import { ComingSoon } from '@/components/ComingSoon';
import { defineStrings, useT } from '@/i18n/core';

const strings = defineStrings(
  {
    title: 'Report a scam number, UPI ID or link',
    body: 'Soon you will be able to warn others by reporting a scammer’s UPI ID, phone number or link. Only a fingerprint (hash) is sent, never the ID itself or anything about you. The community API behind this is ready; the page is still being built.',
  },
  {
    title: 'ठग का नंबर, UPI आईडी या लिंक रिपोर्ट करें',
    body: 'जल्द ही आप ठग की UPI आईडी, फ़ोन नंबर या लिंक रिपोर्ट करके दूसरों को सावधान कर सकेंगे। सिर्फ़ एक फ़िंगरप्रिंट (हैश) भेजा जाएगा, आईडी या आपकी कोई जानकारी कभी नहीं। इसके पीछे का कम्युनिटी API तैयार है; यह पेज अभी बन रहा है।',
  },
);

export default function ReportPage() {
  const t = useT(strings);
  return <ComingSoon title={t.title} body={t.body} />;
}
