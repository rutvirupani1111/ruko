import { r, type RuleModule } from './types';

/** Income tax / GST refund scams: "refund approved, verify your account". */
export function taxRefund(): RuleModule {
  return {
    cues: {
      tax: [r`income ?tax|it (?:department|dept)|i\.t\. department|itd|itr|tax refund|gst refund|tds refund|आयकर|इनकम टैक्स|income tax vibhag|tax (?:department|dept)`],
      tax_refund_word: [r`refunds?|रिफंड|reimbursement|वापसी`],
      approved: [r`approved|sanctioned|eligible|processed|pending|initiated|due|स्वीकृत|मंजूर|पात्र|लंबित|pass ho gaya`],
      ok_tax: [r`(?:has been|will be|is) credited to your|credited to (?:your )?(?:bank )?(?:account|a/c)|determined|pre-?validated|खाते में (?:जमा|भेज)`],
      verify_acct: [
        r`(?:verify|update|confirm|validate|submit|enter|provide|share) (?:your )?(?:bank )?(?:account|a/c)(?: details| number| no)?|(?:verify|update|confirm|submit|enter|provide|share) (?:your )?(?:bank|card|debit card|credit card) (?:details|information|info|number)`,
        r`account (?:details )?(?:verify|update) (?:kar|karo|karein)|(?:खाता|बैंक) (?:विवरण|डिटेल|जानकारी)(?: \S+){0,2} (?:अपडेट|सत्यापित|दें|भरें)|खाता सत्यापित`,
      ],
    },
    rules: [
      {
        id: 'tax.refund_action', cat: 'tax_refund', w: 55, all: ['tax', 'tax_refund_word', 'verify_acct|@ulink|link_cta|install_app|apk_word|credential_req'],
        en: ['Tax refund needs you to click or verify', 'The Income Tax Department pays refunds to your pre-validated account. It never sends links to claim them.'],
        hi: ['टैक्स रिफ़ंड के लिए क्लिक या वेरिफ़ाई करने को कहा', 'आयकर विभाग रिफ़ंड पहले से वेरिफ़ाइड खाते में भेजता है। इसके लिए कभी लिंक नहीं भेजता।'],
      },
      {
        id: 'tax.refund_offer', cat: 'tax_refund', w: 25, all: ['tax', 'tax_refund_word', 'approved'], not: 'ok_tax',
        en: ['Unexpected tax refund message', 'Check refund status yourself on incometax.gov.in.'],
        hi: ['अचानक टैक्स रिफ़ंड का मैसेज', 'रिफ़ंड का स्टेटस ख़ुद incometax.gov.in पर देखें।'],
      },
    ],
  };
}
