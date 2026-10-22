/**
 * Strings for UI that Ruko injects into web pages (WhatsApp badges, Gmail banner,
 * lookalike interstitial, link tooltips, UPI confirmation). Kept separate from the
 * extension-page strings so the every-site content script stays small.
 *
 * Copy rules (SPEC "Brand and design system"): plain, warm, never shaming the
 * victim, no em dashes.
 */
import type { Locale, ScamCategory, Severity } from '@ruko/engine';
import { format, type Params } from './format';

const en = {
  // Badge on a WhatsApp message.
  badgePossible: 'Possible {label}',
  badgeLikely: 'Likely {label}',
  badgeWhy: 'Why?',
  badgeAria: '{label}. Ruko risk {score} out of 100. Show why.',

  // Popover and banner.
  warningSigns: 'Warning signs',
  reassuringSigns: 'Reassuring signs',
  whatToDo: 'What to do',
  seeFull: 'See full analysis',
  hideWarning: 'Not a scam? Hide',
  close: 'Close',
  checkedOnDevice: 'Checked on your device. Nothing was sent anywhere.',
  riskOutOf: 'Risk {score} out of 100',
  linksInMessage: 'Links in this message',
  bannerEyebrow: 'Ruko checked this email',
  bannerFrom: 'From {sender}',
  showDetails: 'Why?',
  hideDetails: 'Hide details',
  dismiss: 'Dismiss',
  dismissAria: 'Hide this warning',
  communityReports: 'Reported by {count} people',
  communityNote: 'Community reports, not verified',

  // Lookalike interstitial.
  gateEyebrow: 'Ruko paused this page',
  gateTitleBrand: 'This is not the real {brand} website',
  gateTitleGeneric: 'This website looks fake',
  gateBodyBrand:
    '{host} is made to look like {brand}. Scammers copy bank, shopping and government websites to steal passwords, OTPs and card details.',
  gateBodyGeneric:
    '{host} shows signs of a fake website. Do not enter passwords, OTPs, card or UPI details here.',
  gateWhy: 'Why Ruko thinks so',
  gateLeave: 'Leave this site',
  gateRealSite: 'The real {brand} website is {domain}',
  gateGoReal: 'Go to {domain} instead',
  gateContinue: 'Continue anyway',
  gateContinueNote: 'Ruko will stop warning you about {host} on this device.',
  gateHelp: 'Already shared details or lost money? Call {phone} now, or report at {link}.',

  // Link tooltip.
  tipLabel: 'Ruko link check',
  tipOfficialBrand: 'Official {brand} website',
  tipOfficial: 'Official website',
  tipDangerBrand: 'Careful: pretends to be {brand}',
  tipDanger: 'Careful: this link looks unsafe',
  tipCaution: 'Check before you open',
  tipShortener: 'Short link: the real address is hidden',
  tipDownload: 'Careful: this link downloads an app',
  tipSafe: 'No warning signs found',
  tipUpi: 'UPI link: opening it asks you to PAY money',
  tipChecking: 'Checking link…',

  // upi:// confirmation.
  upiTitle: 'This link will make a payment',
  upiBody:
    'UPI links and QR codes are only for paying money. You never need to scan, tap or enter your UPI PIN to receive money.',
  upiPayee: 'Paying to',
  upiAmount: 'Amount',
  upiNote: 'Note',
  upiAmountOpen: 'Not set, the app will ask',
  upiCancel: "Don't pay",
  upiContinue: 'I want to pay, continue',
  upiUnreadable: 'Ruko could not read the details of this payment link. Only continue if you started this payment yourself.',
  upiRiskTitle: 'What Ruko noticed',

  brandName: 'Ruko Shield',
} as const;

export type InpageKey = keyof typeof en;

const hi: Record<InpageKey, string> = {
  badgePossible: '{label} हो सकता है',
  badgeLikely: '{label} लगता है',
  badgeWhy: 'क्यों?',
  badgeAria: '{label}. Ruko ख़तरा स्कोर 100 में से {score}. कारण देखें।',

  warningSigns: 'ख़तरे के संकेत',
  reassuringSigns: 'भरोसे वाले संकेत',
  whatToDo: 'अब क्या करें',
  seeFull: 'पूरा विश्लेषण देखें',
  hideWarning: 'धोखा नहीं है? छिपाएँ',
  close: 'बंद करें',
  checkedOnDevice: 'आपके डिवाइस पर ही जाँचा गया। कुछ भी कहीं नहीं भेजा गया।',
  riskOutOf: 'ख़तरा 100 में से {score}',
  linksInMessage: 'इस मैसेज के लिंक',
  bannerEyebrow: 'Ruko ने यह ईमेल जाँचा',
  bannerFrom: 'भेजने वाला: {sender}',
  showDetails: 'क्यों?',
  hideDetails: 'विवरण छिपाएँ',
  dismiss: 'हटाएँ',
  dismissAria: 'यह चेतावनी छिपाएँ',
  communityReports: '{count} लोगों ने रिपोर्ट किया',
  communityNote: 'समुदाय की रिपोर्ट, जाँची हुई नहीं',

  gateEyebrow: 'Ruko ने यह पेज रोका है',
  gateTitleBrand: 'यह {brand} की असली वेबसाइट नहीं है',
  gateTitleGeneric: 'यह वेबसाइट नकली लगती है',
  gateBodyBrand:
    '{host} को {brand} जैसा दिखाने के लिए बनाया गया है। ठग बैंक, शॉपिंग और सरकारी वेबसाइटों की नकल करके पासवर्ड, OTP और कार्ड की जानकारी चुराते हैं।',
  gateBodyGeneric:
    '{host} में नकली वेबसाइट के संकेत हैं। यहाँ पासवर्ड, OTP, कार्ड या UPI की जानकारी न डालें।',
  gateWhy: 'Ruko ऐसा क्यों मानता है',
  gateLeave: 'इस साइट से बाहर निकलें',
  gateRealSite: '{brand} की असली वेबसाइट {domain} है',
  gateGoReal: 'इसके बजाय {domain} पर जाएँ',
  gateContinue: 'फिर भी आगे बढ़ें',
  gateContinueNote: 'इस डिवाइस पर Ruko {host} के बारे में फिर चेतावनी नहीं देगा।',
  gateHelp: 'जानकारी दे चुके हैं या पैसे कट गए? अभी {phone} पर कॉल करें या {link} पर शिकायत करें।',

  tipLabel: 'Ruko लिंक जाँच',
  tipOfficialBrand: '{brand} की आधिकारिक वेबसाइट',
  tipOfficial: 'आधिकारिक वेबसाइट',
  tipDangerBrand: 'सावधान: यह {brand} होने का दिखावा करता है',
  tipDanger: 'सावधान: यह लिंक असुरक्षित लगता है',
  tipCaution: 'खोलने से पहले जाँच लें',
  tipShortener: 'छोटा लिंक: असली पता छिपा हुआ है',
  tipDownload: 'सावधान: यह लिंक एक ऐप डाउनलोड करता है',
  tipSafe: 'कोई ख़तरे का संकेत नहीं मिला',
  tipUpi: 'UPI लिंक: इसे खोलने पर आपसे पैसे भेजने को कहा जाएगा',
  tipChecking: 'लिंक जाँचा जा रहा है…',

  upiTitle: 'यह लिंक पैसे भेजने के लिए है',
  upiBody:
    'UPI लिंक और QR कोड सिर्फ़ पैसे भेजने के लिए होते हैं। पैसे पाने के लिए कभी भी स्कैन करने, टैप करने या UPI PIN डालने की ज़रूरत नहीं होती।',
  upiPayee: 'किसे भेज रहे हैं',
  upiAmount: 'रकम',
  upiNote: 'नोट',
  upiAmountOpen: 'तय नहीं, ऐप पूछेगा',
  upiCancel: 'पैसे न भेजें',
  upiContinue: 'मुझे भुगतान करना है, आगे बढ़ें',
  upiUnreadable: 'Ruko इस भुगतान लिंक की जानकारी नहीं पढ़ पाया। आगे तभी बढ़ें जब यह भुगतान आपने ख़ुद शुरू किया हो।',
  upiRiskTitle: 'Ruko ने क्या देखा',

  brandName: 'Ruko Shield',
};

export const INPAGE_STRINGS: Record<Locale, Record<InpageKey, string>> = { en, hi };

export function ti(locale: Locale, key: InpageKey, params?: Params): string {
  return format(INPAGE_STRINGS[locale]?.[key] ?? en[key], params);
}

/** Short lowercase labels used inside "Possible {label}" badges. */
export const CATEGORY_LABELS: Record<Locale, Record<ScamCategory, string>> = {
  en: {
    digital_arrest: 'digital arrest scam',
    kyc_update: 'KYC scam',
    upi_collect: 'UPI collect scam',
    qr_receive: 'QR code scam',
    fake_refund: 'fake refund scam',
    job_task: 'task job scam',
    investment: 'investment scam',
    lottery_prize: 'lottery scam',
    loan_app: 'loan app scam',
    sextortion: 'sextortion threat',
    otp_theft: 'OTP scam',
    fake_support: 'fake customer care',
    courier_parcel: 'parcel scam',
    utility_disconnect: 'electricity bill scam',
    reward_points: 'reward points scam',
    tax_refund: 'tax refund scam',
    govt_scheme: 'fake government scheme',
    malicious_app: 'dangerous app link',
    remote_access: 'screen sharing scam',
    impersonation: 'impersonation scam',
    romance: 'romance scam',
    sim_swap: 'SIM swap scam',
    phishing_link: 'phishing link',
    lookalike_domain: 'fake website',
    other: 'scam',
  },
  hi: {
    digital_arrest: 'डिजिटल अरेस्ट धोखा',
    kyc_update: 'KYC धोखा',
    upi_collect: 'UPI कलेक्ट धोखा',
    qr_receive: 'QR कोड धोखा',
    fake_refund: 'नकली रिफ़ंड धोखा',
    job_task: 'टास्क जॉब धोखा',
    investment: 'निवेश धोखा',
    lottery_prize: 'लॉटरी धोखा',
    loan_app: 'लोन ऐप धोखा',
    sextortion: 'सेक्सटॉर्शन धमकी',
    otp_theft: 'OTP धोखा',
    fake_support: 'नकली कस्टमर केयर',
    courier_parcel: 'पार्सल धोखा',
    utility_disconnect: 'बिजली बिल धोखा',
    reward_points: 'रिवॉर्ड पॉइंट धोखा',
    tax_refund: 'टैक्स रिफ़ंड धोखा',
    govt_scheme: 'नकली सरकारी योजना',
    malicious_app: 'ख़तरनाक ऐप लिंक',
    remote_access: 'स्क्रीन शेयरिंग धोखा',
    impersonation: 'नकली पहचान वाला धोखा',
    romance: 'रोमांस धोखा',
    sim_swap: 'SIM स्वैप धोखा',
    phishing_link: 'फ़िशिंग लिंक',
    lookalike_domain: 'नकली वेबसाइट',
    other: 'धोखा',
  },
};

export const SEVERITY_LABELS: Record<Locale, Record<Severity, string>> = {
  en: {
    safe: 'Looks safe',
    low: 'Low risk',
    medium: 'Medium risk',
    high: 'High risk',
    critical: 'Very high risk',
  },
  hi: {
    safe: 'सुरक्षित लगता है',
    low: 'कम ख़तरा',
    medium: 'मध्यम ख़तरा',
    high: 'ज़्यादा ख़तरा',
    critical: 'बहुत ज़्यादा ख़तरा',
  },
};

export function categoryLabel(locale: Locale, category: ScamCategory | null | undefined): string {
  return CATEGORY_LABELS[locale][category ?? 'other'] ?? CATEGORY_LABELS[locale].other;
}

/** "Possible KYC scam" for medium, "Likely KYC scam" for high and critical. */
export function badgeLabel(locale: Locale, category: ScamCategory | null | undefined, severity: Severity): string {
  const label = categoryLabel(locale, category);
  const key: InpageKey = severity === 'high' || severity === 'critical' ? 'badgeLikely' : 'badgePossible';
  const text = ti(locale, key, { label });
  return locale === 'en' ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}
