import { r, type RuleModule } from './types';

/** Instant loan app scams and loan-recovery harassment with morphed photos. */
export const loanApp: RuleModule = {
  cues: {
    loan: [r`loans?|लोन|ऋण|karz|karza|karja|credit line|cash advance|instant cash`],
    no_docs: [
      r`without (?:any )?(?:documents?|docs|paperwork|cibil|credit (?:check|score)|income proof|guarantor|collateral|salary slip)|no (?:documents?|docs|cibil|credit check|paperwork|income proof|guarantor|collateral)`,
      r`zero (?:documents?|paperwork)|bina (?:documents?|document|kagaz|kagaj|cibil|guarantee|guarantor|paperwork)|बिना (?:दस्तावेज|कागज|सिबिल|गारंटी|डॉक्यूमेंट)`,
      r`instant (?:approval|disbursal|disbursement|loan|cash)|(?:in|within) (?:\d+|five|two|ten) (?:minutes?|mins?)|\d+ (?:minute|min|mint) (?:me|mein|में)|turant (?:loan|paisa|paise)|तुरंत लोन|(?:low|bad) cibil|cibil (?:kharab|low|nahi)`,
    ],
    approved_fee: [
      r`(?:loan|amount)(?: \S+){0,3} (?:is |has been |got )?(?:approved|sanctioned|disbursed|pre-?approved|passed)|(?:approved|sanctioned) loan`,
      r`लोन (?:स्वीकृत|मंजूर|पास)|loan (?:pass|approve|sanction) (?:ho gaya|hua)`,
    ],
    harass: [
      r`morph(?:ed)? (?:photos?|pics?|images?|videos?)|(?:nude|obscene|vulgar|edited|dirty|naked) (?:photos?|pics?|images?)`,
      r`(?:send|share|forward|post|circulate)(?: \S+){0,3} (?:to|with) (?:all )?(?:your )?(?:contacts|contact list|relatives|family|friends|colleagues|office)`,
      r`(?:contacts?|relatives|friends|family|rishtedaron|rishtedar|gharwalon) ko (?:bhej|send|bata|call)|(?:photo|photos|pic|video) viral|viral kar (?:denge|dunga|doonga|dege)`,
      r`defaulter (?:poster|post|list|message)|fraud (?:poster|post)|tell (?:all )?your (?:contacts|relatives)|call (?:all )?your (?:contacts|relatives|family)`,
      r`(?:फोटो|वीडियो) वायरल|सभी (?:संपर्कों|रिश्तेदारों|कॉन्टैक्ट्स)|बदनाम कर|badnaa?m kar`,
    ],
    repay: [r`repay|re-?payment|overdue|due amount|(?:pay|clear) (?:your |the )?(?:loan|dues?|emi|outstanding)|emi (?:due|bounce|pending)|loan (?:chukao|bharo|wapas)|(?:पैसा|लोन|किस्त) (?:चुकाओ|भरो|जमा करो)|recovery`],
  },
  rules: [
    {
      id: 'loan.no_docs', cat: 'loan_app', w: 40, all: ['loan', 'no_docs'],
      en: ['Instant loan with no checks', 'Loans with no documents or credit check are how illegal loan apps hook people.'],
      hi: ['बिना जाँच के तुरंत लोन', 'बिना दस्तावेज़ या सिबिल जाँच वाला लोन, ग़ैरक़ानूनी लोन ऐप का जाल है।'],
    },
    {
      id: 'loan.fee', cat: 'loan_app', w: 50, all: ['approved_fee', 'fee|fee_pay|money_req'],
      en: ['Pay a fee to release your loan', 'Real lenders deduct charges from the loan. They never ask you to pay first.'],
      hi: ['लोन पाने के लिए पहले फ़ीस', 'असली लोन देने वाले फ़ीस लोन में से काटते हैं, पहले पैसे नहीं माँगते।'],
    },
    {
      id: 'loan.fee_pay', cat: 'loan_app', w: 40, all: ['loan', 'fee_pay'],
      en: ['Upfront payment for a loan', 'Paying "file charges" or "insurance" before getting a loan is a common trap.'],
      hi: ['लोन से पहले पेमेंट', 'लोन मिलने से पहले "फ़ाइल चार्ज" या "इंश्योरेंस" भरवाना आम जाल है।'],
    },
    {
      id: 'loan.harassment', cat: 'loan_app', w: 55, all: ['harass'], x: 'loan_h',
      en: ['Threat to shame you to your contacts', 'Threatening to send photos to your contacts is illegal harassment. Report it at cybercrime.gov.in.'],
      hi: ['रिश्तेदारों-दोस्तों में बदनाम करने की धमकी', 'आपकी फ़ोटो कॉन्टैक्ट्स को भेजने की धमकी ग़ैरक़ानूनी है। cybercrime.gov.in पर शिकायत करें।'],
    },
    {
      id: 'loan.harassment_loan', cat: 'loan_app', w: 65, all: ['harass', 'loan|repay'], x: 'loan_h',
      en: ['Loan recovery by blackmail', 'Illegal loan apps morph photos and message your contacts. Do not pay; report the app.'],
      hi: ['ब्लैकमेल करके लोन वसूली', 'ग़ैरक़ानूनी लोन ऐप फ़ोटो बदलकर कॉन्टैक्ट्स को भेजते हैं। पैसे न दें, ऐप की शिकायत करें।'],
    },
    {
      id: 'loan.app_link', cat: 'loan_app', w: 25, all: ['loan', 'install_app|apk_word|@ulink'], not: 'playstore|@olink',
      en: ['Loan app from a link', 'Apps sent by link can read your contacts and photos. Use only RBI-regulated lenders.'],
      hi: ['लिंक से लोन ऐप', 'लिंक से आए ऐप आपके कॉन्टैक्ट और फ़ोटो पढ़ सकते हैं। सिर्फ़ RBI से मान्यता प्राप्त संस्था से लोन लें।'],
    },
  ],
};
