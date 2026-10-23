/**
 * Gujarati and Marathi complaint letters: the same structure as the English
 * letter in complaint.ts, written natively rather than word for word.
 */
export interface LetterCopy {
  to: [string, string];
  subject: (category: string, amount: string, date: string) => string;
  salutation: string;
  intro: (name: string, address: string) => string;
  happened: string;
  contacted: (mode: string, date: string, time: string) => string;
  lost: string;
  total: string;
  transactions: string;
  txnId: string;
  from: string;
  sentTo: string;
  fraudster: string;
  steps: string;
  called1930: (ack: string) => string;
  reportedOnline: (ack: string) => string;
  informedBank: (ref: string) => string;
  request: string;
  enclosures: string;
  signoff: string;
  mobile: string;
  email: string;
  date: string;
}

export const LETTERS: Record<'gu' | 'mr', LetterCopy> = {
  gu: {
    to: ['પ્રતિ,', 'પોલીસ ઇન્સ્પેક્ટર / સાયબર ક્રાઇમ સેલ,'],
    subject: (category, amount, date) =>
      `વિષય: ${date ? `${date}ના રોજ થયેલી ` : ''}${amount ? `${amount}ની ` : ''}ઓનલાઇન નાણાકીય છેતરપિંડી${category ? ` (${category})` : ''} અંગે ફરિયાદ`,
    salutation: 'માનનીય સાહેબ/મેડમ,',
    intro: (name, address) => `હું, ${name}, રહેવાસી ${address}, આપને જણાવવા માગું છું કે મારી સાથે ઓનલાઇન છેતરપિંડી થઈ છે. વિગતો નીચે મુજબ છે.`,
    happened: '1. ઘટનાની વિગત',
    contacted: (mode, date, time) =>
      `છેતરપિંડી કરનારે${date ? ` ${date}ના રોજ` : ''}${time ? ` ${time} વાગ્યે` : ''} મારો સંપર્ક કર્યો${mode ? ` (માધ્યમ: ${mode})` : ''}.`,
    lost: '2. ગુમાવેલી રકમ',
    total: 'કુલ રકમ',
    transactions: 'વ્યવહારો:',
    txnId: 'ટ્રાન્ઝેક્શન ID/UTR',
    from: 'કયા ખાતામાંથી',
    sentTo: 'કોને મોકલ્યા',
    fraudster: 'છેતરપિંડી કરનારની વિગતો (નંબર, UPI ID, ખાતાં, લિંક)',
    steps: 'મેં અત્યાર સુધી લીધેલાં પગલાં',
    called1930: (ack) => `રાષ્ટ્રીય સાયબર ક્રાઇમ હેલ્પલાઇન 1930 પર ફોન કર્યો${ack ? ` (સ્વીકૃતિ નં. ${ack})` : ''}.`,
    reportedOnline: (ack) => `cybercrime.gov.in પર ઓનલાઇન ફરિયાદ નોંધાવી${ack ? ` (સ્વીકૃતિ નં. ${ack})` : ''}.`,
    informedBank: (ref) => `મારી બેંકને જાણ કરી${ref ? ` (સંદર્ભ નં. ${ref})` : ''} અને ખાતું/કાર્ડ બ્લોક કરવા વિનંતી કરી.`,
    request:
      'આપને વિનંતી છે કે મારી ફરિયાદ નોંધો, પૈસા મેળવનાર ખાતાં ફ્રીઝ કરાવો અને મારી રકમ પાછી મેળવવામાં મદદ કરો. સ્ક્રીનશૉટ, બેંક સ્ટેટમેન્ટ અને બીજા પુરાવા આપવા હું તૈયાર છું.',
    enclosures: 'બિડાણ: મેસેજ અને કૉલના સ્ક્રીનશૉટ, વ્યવહારની રસીદો, બેંક સ્ટેટમેન્ટ.',
    signoff: 'આપનો/આપની વિશ્વાસુ,',
    mobile: 'મોબાઇલ',
    email: 'ઇમેઇલ',
    date: 'તારીખ',
  },
  mr: {
    to: ['प्रति,', 'पोलीस निरीक्षक / सायबर क्राइम सेल,'],
    subject: (category, amount, date) =>
      `विषय: ${date ? `${date} रोजी झालेल्या ` : ''}${amount ? `${amount} च्या ` : ''}ऑनलाइन आर्थिक फसवणुकीबाबत तक्रार${category ? ` (${category})` : ''}`,
    salutation: 'महोदय/महोदया,',
    intro: (name, address) =>
      `मी, ${name}, राहणार ${address}, आपणास कळवू इच्छितो/इच्छिते की माझी ऑनलाइन फसवणूक झाली आहे. तपशील पुढीलप्रमाणे आहे.`,
    happened: '1. घटनेचा तपशील',
    contacted: (mode, date, time) =>
      `फसवणूक करणाऱ्याने${date ? ` ${date} रोजी` : ''}${time ? ` ${time} वाजता` : ''} माझ्याशी संपर्क साधला${mode ? ` (माध्यम: ${mode})` : ''}.`,
    lost: '2. गेलेली रक्कम',
    total: 'एकूण रक्कम',
    transactions: 'व्यवहार:',
    txnId: 'ट्रान्झॅक्शन ID/UTR',
    from: 'कोणत्या खात्यातून',
    sentTo: 'कोणाला पाठवले',
    fraudster: 'फसवणूक करणाऱ्याची माहिती (नंबर, UPI ID, खाती, लिंक)',
    steps: 'मी आतापर्यंत उचललेली पावले',
    called1930: (ack) => `राष्ट्रीय सायबर क्राइम हेल्पलाइन 1930 वर फोन केला${ack ? ` (पोचपावती क्र. ${ack})` : ''}.`,
    reportedOnline: (ack) => `cybercrime.gov.in वर ऑनलाइन तक्रार नोंदवली${ack ? ` (पोचपावती क्र. ${ack})` : ''}.`,
    informedBank: (ref) => `माझ्या बँकेला कळवले${ref ? ` (संदर्भ क्र. ${ref})` : ''} आणि खाते/कार्ड ब्लॉक करण्याची विनंती केली.`,
    request:
      'माझी तक्रार नोंदवून घ्यावी, पैसे मिळालेली खाती गोठवावीत आणि माझी रक्कम परत मिळवण्यासाठी मदत करावी, ही विनंती. स्क्रीनशॉट, बँक स्टेटमेंट आणि इतर पुरावे देण्यास मी तयार आहे.',
    enclosures: 'सोबत: मेसेज व कॉलचे स्क्रीनशॉट, व्यवहारांच्या पावत्या, बँक स्टेटमेंट.',
    signoff: 'आपला/आपली विश्वासू,',
    mobile: 'मोबाइल',
    email: 'ईमेल',
    date: 'दिनांक',
  },
};
