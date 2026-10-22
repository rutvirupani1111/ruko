/**
 * Registry of Indian brands, banks, payment apps and government bodies that
 * scammers imitate, with their official domains, the name tokens used to spot
 * impersonation in other domains, and their DLT SMS sender headers.
 *
 * Tokens: length >= 4 match as a substring of the host; shorter tokens and
 * tokens prefixed with `=` must be a whole hyphen/dot separated part (or the
 * part plus a known scam affix, e.g. `sbikyc`).
 */

import { splitHost } from './psl';

export type BrandKind ='bank' | 'pay' | 'gov' | 'shop' | 'post' | 'tel' | 'util' | 'travel' | 'tech' | 'fin' | 'ins';

export interface Brand {
  id: string;
  name: string;
  nameHi: string;
  kind: BrandKind;
  domains: string[];
  tokens: string[];
  sms: string[];
}

// [id, name, kind, official domains, tokens, SMS headers, Hindi name]
type Row = [string, string, BrandKind, string, string, string, string?];

const ROWS: Row[] = [
  // Banks
  ['sbi', 'SBI', 'bank', 'sbi.co.in sbi.bank.in onlinesbi.sbi onlinesbi.com bank.sbi yonobusiness.sbi sbicard.com sbilife.co.in sbimf.com sbigeneral.in sbisecurities.in sbicaps.com', 'sbi onlinesbi yono statebank sbicard', 'SBIBNK SBIINB SBIPSG CBSSBI ATMSBI SBIOTP SBYONO SBICRD SBIUPI SBMSMS SBIBMS'],
  ['hdfc', 'HDFC Bank', 'bank', 'hdfcbank.com hdfc.bank.in hdfcbank.bank.in hdfcbank.net hdfc.com hdfclife.com hdfcergo.com hdfcfund.com hdfcsec.com hdfcbk.io payzapp.in hdfcsky.com', 'hdfc hdfcbank payzapp', 'HDFCBK HDFCBN HDFCCC HDFCLI HDFCBP'],
  ['icici', 'ICICI Bank', 'bank', 'icicibank.com icici.bank.in icicibank.bank.in icicidirect.com iciciprulife.com icicilombard.com icicipruamc.com icicisecurities.com', 'icici icicibank imobile', 'ICICIB ICICIT ICICIO ICICIS ICICIN'],
  ['axis', 'Axis Bank', 'bank', 'axisbank.com axis.bank.in axisbank.bank.in axisbank.co.in axisdirect.in axismf.com', 'axisbank =axis', 'AXISBK AXISMR AXISBN AXISCC'],
  ['kotak', 'Kotak Mahindra Bank', 'bank', 'kotak.com kotak.bank.in kotakbank.com kotaksecurities.com kotakmf.com kotaklife.com kotak811.com', 'kotak kotak811', 'KOTAKB KOTAKM KMBLTD'],
  ['pnb', 'Punjab National Bank', 'bank', 'pnbindia.in pnb.bank.in pnb.co.in netpnb.com pnbnet.in', 'pnb pnbindia netpnb punjabnational', 'PNBSMS PNBNET PNBBNK'],
  ['bob', 'Bank of Baroda', 'bank', 'bankofbaroda.in bankofbaroda.bank.in bankofbaroda.com bobfinancial.com bobcard.co.in', 'bankofbaroda bob barodampay bobworld', 'BOBTXN BOBSMS BOBCRD BOBFIN'],
  ['canara', 'Canara Bank', 'bank', 'canarabank.com canarabank.bank.in canarabank.in', 'canarabank =canara', 'CANBNK CNRBNK'],
  ['union', 'Union Bank of India', 'bank', 'unionbankofindia.co.in unionbankofindia.bank.in unionbankonline.co.in', 'unionbank unionbankofindia', 'UNIONB UBOIIN'],
  ['yes', 'Yes Bank', 'bank', 'yesbank.in yesbank.bank.in yesbank.com', 'yesbank', 'YESBNK YESBKG'],
  ['idfc', 'IDFC FIRST Bank', 'bank', 'idfcfirstbank.com idfcfirst.bank.in idfcfirstbank.bank.in', 'idfc idfcfirst', 'IDFCFB IDFCBK'],
  ['indusind', 'IndusInd Bank', 'bank', 'indusind.com indusind.bank.in', 'indusind', 'INDUSB INDUSL'],
  ['boi', 'Bank of India', 'bank', 'bankofindia.co.in bankofindia.bank.in bankofindia.com', 'bankofindia', 'BOIIND BOISMS'],
  ['indianbank', 'Indian Bank', 'bank', 'indianbank.in indianbank.bank.in', 'indianbank', 'INDBNK'],
  ['iob', 'Indian Overseas Bank', 'bank', 'iob.in iob.bank.in', 'iobnet indianoverseas', 'IOBCHN IOBBNK'],
  ['centralbank', 'Central Bank of India', 'bank', 'centralbankofindia.co.in centralbank.bank.in', 'centralbankofindia', 'CBOIND CENTBK'],
  ['uco', 'UCO Bank', 'bank', 'ucobank.com ucobank.bank.in', 'ucobank', 'UCOBNK'],
  ['bom', 'Bank of Maharashtra', 'bank', 'bankofmaharashtra.in bankofmaharashtra.bank.in', 'bankofmaharashtra mahabank', 'MAHABK'],
  ['federal', 'Federal Bank', 'bank', 'federalbank.co.in federalbank.bank.in', 'federalbank', 'FEDBNK FEDFIB'],
  ['rbl', 'RBL Bank', 'bank', 'rblbank.com rbl.bank.in', 'rblbank', 'RBLBNK'],
  ['aubank', 'AU Small Finance Bank', 'bank', 'aubank.in au.bank.in', 'aubank', 'AUBANK'],
  ['bandhan', 'Bandhan Bank', 'bank', 'bandhanbank.com bandhan.bank.in', 'bandhanbank', 'BDNBNK'],
  ['idbi', 'IDBI Bank', 'bank', 'idbibank.in idbi.bank.in', 'idbibank =idbi', 'IDBIBK'],
  ['sib', 'South Indian Bank', 'bank', 'southindianbank.com southindianbank.bank.in', 'southindianbank', 'SIBSMS'],
  ['ippb', 'India Post Payments Bank', 'bank', 'ippbonline.com ippb.bank.in', 'ippb ippbonline', 'IPBMSG IPPBNK'],
  ['airtelbank', 'Airtel Payments Bank', 'bank', 'airtelpaymentsbank.com', 'airtelpaymentsbank', 'AIRBNK APBANK'],
  ['jkbank', 'J&K Bank', 'bank', 'jkbank.com', 'jkbank', 'JKBANK'],
  ['karnatakabank', 'Karnataka Bank', 'bank', 'karnatakabank.com', 'karnatakabank', 'KBLBNK'],
  ['kvb', 'Karur Vysya Bank', 'bank', 'kvb.co.in', 'karurvysya', 'KVBANK'],
  ['hsbc', 'HSBC', 'bank', 'hsbc.co.in hsbc.com', 'hsbc', 'HSBCIN'],
  ['sc', 'Standard Chartered', 'bank', 'sc.com', 'standardchartered', 'SCBANK'],
  ['citi', 'Citibank', 'bank', 'citibank.co.in citi.com citibank.com', 'citibank', 'CITIBK'],
  // Payments
  ['paytm', 'Paytm', 'pay', 'paytm.com paytm.in paytmbank.com paytmmall.com paytmmoney.com paytm.me paytmpayments.com', 'paytm', 'PAYTMB IPAYTM PYTMSM PAYTMM'],
  ['phonepe', 'PhonePe', 'pay', 'phonepe.com phon.pe', 'phonepe phonpe fonepe', 'PHONPE PHNPAY'],
  ['gpay', 'Google Pay', 'pay', 'pay.google.com', 'gpay googlepay =tez', 'GPAYIN'],
  ['npci', 'NPCI / BHIM UPI', 'pay', 'npci.org.in bhimupi.org.in', 'npci =bhim bhimupi =upi', 'NPCIOR BHIMUP'],
  ['amazonpay', 'Amazon Pay', 'pay', 'amazonpay.in', 'amazonpay', 'AMZPAY'],
  ['mobikwik', 'MobiKwik', 'pay', 'mobikwik.com', 'mobikwik', 'MOBKWK MBKWIK'],
  ['cred', 'CRED', 'pay', 'cred.club', '=cred', 'CREDCL CREDIN'],
  ['freecharge', 'Freecharge', 'pay', 'freecharge.in', 'freecharge', 'FRECHG'],
  ['bharatpe', 'BharatPe', 'pay', 'bharatpe.com bharatpe.in', 'bharatpe', 'BHRTPE'],
  ['razorpay', 'Razorpay', 'pay', 'razorpay.com', 'razorpay', 'RZRPAY'],
  // Government and regulators
  ['rbi', 'Reserve Bank of India', 'gov', 'rbi.org.in rbi.gov.in', 'rbi reservebank', 'RBIBNK RBISAY', 'भारतीय रिज़र्व बैंक'],
  ['sebi', 'SEBI', 'gov', 'sebi.gov.in', '=sebi', 'SEBIRE'],
  ['uidai', 'UIDAI (Aadhaar)', 'gov', 'uidai.gov.in', 'uidai aadhaar aadhar adhaar myaadhaar', 'UIDAIG AADHAR', 'UIDAI (आधार)'],
  ['incometax', 'Income Tax Department', 'gov', 'incometax.gov.in incometaxindia.gov.in tin-nsdl.com protean-tinpan.com utiitsl.com', 'incometax itrefund =efiling', 'ITDEFL ITDEPT CPCITD ITDCPC', 'आयकर विभाग'],
  ['epfo', 'EPFO', 'gov', 'epfindia.gov.in epfo.gov.in', 'epfo epfindia', 'EPFOHO EPFOIN', 'ईपीएफओ'],
  ['indiapost', 'India Post', 'gov', 'indiapost.gov.in', 'indiapost speedpost', 'INDPST IPOSTS', 'इंडिया पोस्ट'],
  ['gst', 'GST Portal', 'gov', 'gst.gov.in cbic.gov.in', 'gst gstportal cbic', 'GSTIND'],
  ['parivahan', 'Parivahan (RTO / e-Challan)', 'gov', 'parivahan.gov.in', 'parivahan echallan mparivahan rto vahan', 'VAHANP PARIVH ECHALN', 'परिवहन (RTO / ई-चालान)'],
  ['digilocker', 'DigiLocker', 'gov', 'digilocker.gov.in', 'digilocker', 'DGLOCK'],
  ['sancharsaathi', 'Sanchar Saathi (DoT)', 'gov', 'sancharsaathi.gov.in dot.gov.in', 'sancharsaathi chakshu', 'DOTGOV', 'संचार साथी (दूरसंचार विभाग)'],
  ['cybercrime', 'National Cyber Crime Portal', 'gov', 'cybercrime.gov.in i4c.gov.in', 'cybercrime', 'CYBDOT', 'राष्ट्रीय साइबर क्राइम पोर्टल'],
  ['pmkisan', 'PM-Kisan', 'gov', 'pmkisan.gov.in', 'pmkisan kisansamman', 'PMKISN', 'पीएम किसान'],
  ['ayushman', 'Ayushman Bharat', 'gov', 'pmjay.gov.in nha.gov.in abdm.gov.in', 'ayushman pmjay', 'NHAPMJ', 'आयुष्मान भारत'],
  ['passport', 'Passport Seva', 'gov', 'passportindia.gov.in', 'passportindia passportseva', 'PSPIND', 'पासपोर्ट सेवा'],
  ['govin', 'Government of India', 'gov', 'india.gov.in mygov.in', 'mygov', 'MYGOVT GOVTIN', 'भारत सरकार'],
  ['trai', 'TRAI', 'gov', 'trai.gov.in', '=trai', 'TRAIND', 'ट्राई'],
  ['lic', 'LIC', 'ins', 'licindia.in licindia.com', 'licindia lic', 'LICIND'],
  ['irctc', 'IRCTC', 'travel', 'irctc.co.in irctc.com irctctourism.com', 'irctc', 'IRCTCI IRCTCB'],
  ['railways', 'Indian Railways', 'gov', 'indianrail.gov.in indianrailways.gov.in', 'indianrail indianrailways', 'INDRLY', 'भारतीय रेल'],
  // Shopping
  ['amazon', 'Amazon', 'shop', 'amazon.in amazon.com amazon.co.uk amzn.in amzn.to a.co amazon.jobs amazontrust.com media-amazon.com amazon.dev', 'amazon amzn', 'AMAZON AMZNIN AMAZNS'],
  ['flipkart', 'Flipkart', 'shop', 'flipkart.com fkrt.it fkrt.co fkrt.cc flipkart.net ekartlogistics.com flipkartwholesale.com', 'flipkart flipcart ekart', 'FLPKRT FKRTIN FLIPKT'],
  ['myntra', 'Myntra', 'shop', 'myntra.com myntr.it', 'myntra', 'MYNTRA'],
  ['meesho', 'Meesho', 'shop', 'meesho.com', 'meesho', 'MEESHO'],
  ['swiggy', 'Swiggy', 'shop', 'swiggy.com swiggy.in swig.gy', 'swiggy', 'SWIGGY'],
  ['zomato', 'Zomato', 'shop', 'zomato.com zoma.to', 'zomato', 'ZOMATO'],
  ['blinkit', 'Blinkit', 'shop', 'blinkit.com', 'blinkit', 'BLINKT'],
  ['zepto', 'Zepto', 'shop', 'zeptonow.com zepto.com', 'zepto', 'ZEPTON'],
  ['bigbasket', 'BigBasket', 'shop', 'bigbasket.com', 'bigbasket', 'BIGBKT'],
  ['nykaa', 'Nykaa', 'shop', 'nykaa.com', 'nykaa', 'NYKAA'],
  ['ajio', 'AJIO', 'shop', 'ajio.com', 'ajio', 'AJIOIN'],
  ['jiomart', 'JioMart', 'shop', 'jiomart.com', 'jiomart', 'JIOMRT'],
  ['tataneu', 'Tata Neu', 'shop', 'tataneu.com tatacliq.com', 'tataneu tatacliq', 'TATANU'],
  ['snapdeal', 'Snapdeal', 'shop', 'snapdeal.com', 'snapdeal', 'SNPDEL'],
  // Couriers
  ['bluedart', 'Blue Dart', 'post', 'bluedart.com', 'bluedart', 'BLUDRT BLUDAR'],
  ['dtdc', 'DTDC', 'post', 'dtdc.in dtdc.com', 'dtdc', 'DTDCIN DTDCEX'],
  ['delhivery', 'Delhivery', 'post', 'delhivery.com', 'delhivery delhivary', 'DLHVRY DELHVR'],
  ['fedex', 'FedEx', 'post', 'fedex.com', 'fedex', 'FEDEXI'],
  ['dhl', 'DHL', 'post', 'dhl.com dhl.co.in dhl.de', 'dhl', 'DHLIND'],
  ['xpressbees', 'Xpressbees', 'post', 'xpressbees.com', 'xpressbees', 'XPRSBS'],
  ['ecomexpress', 'Ecom Express', 'post', 'ecomexpress.in', 'ecomexpress', 'ECMEXP'],
  ['shiprocket', 'Shiprocket', 'post', 'shiprocket.in shiprocket.co', 'shiprocket', 'SHPRKT'],
  // Telecom
  ['jio', 'Jio', 'tel', 'jio.com myjio.com jiofiber.com ril.com jiosaavn.com jiocinema.com jiohotstar.com jiopay.in', 'jio myjio jiofiber', 'JIOINF JIOSVC JIOPAY JIOCOM'],
  ['airtel', 'Airtel', 'tel', 'airtel.in airtel.com airtelxstream.in', 'airtel', 'AIRTEL AIRMKT AIRINF'],
  ['vi', 'Vi (Vodafone Idea)', 'tel', 'myvi.in vodafoneidea.com vodafone.in', 'vodafone myvi vodafoneidea', 'VICARE VIINFO VMVODA'],
  ['bsnl', 'BSNL', 'tel', 'bsnl.co.in bsnl.in', 'bsnl', 'BSNLIN BSNLSM'],
  // Utilities
  ['tatapower', 'Tata Power', 'util', 'tatapower.com tatapower-ddl.com', 'tatapower', 'TATAPW TPDDLI'],
  ['adani', 'Adani Electricity', 'util', 'adanielectricity.com adani.com', 'adanielectricity =adani', 'ADANIE AEMLIN'],
  ['bescom', 'BESCOM', 'util', 'bescom.co.in bescom.karnataka.gov.in bescom.org', 'bescom', 'BESCOM'],
  ['msedcl', 'MSEDCL (Mahavitaran)', 'util', 'mahadiscom.in', 'mahadiscom msedcl mseb mahavitaran', 'MSEDCL MAHAVT', 'महावितरण (MSEDCL)'],
  ['torrent', 'Torrent Power', 'util', 'torrentpower.com', 'torrentpower', 'TORNTP'],
  ['bses', 'BSES', 'util', 'bsesdelhi.com bsesrajdhani.com bsesyamuna.com', 'bses', 'BSESRJ BSESYM'],
  ['tneb', 'TANGEDCO (TNEB)', 'util', 'tnebltd.gov.in tangedco.gov.in tnpdcl.org', 'tneb tangedco', 'TNEBLT'],
  ['uppcl', 'UPPCL', 'util', 'uppcl.org', 'uppcl', 'UPPCLB'],
  ['kseb', 'KSEB', 'util', 'kseb.in', 'kseb', 'KSEBLT'],
  ['indane', 'Indane Gas', 'util', 'indane.co.in iocl.com indianoil.in', 'indane indianoil', 'INDANE IOCLPN'],
  ['hpgas', 'HP Gas', 'util', 'myhpgas.in hindustanpetroleum.com', 'hpgas myhpgas', 'HPGASI'],
  ['bharatgas', 'Bharat Gas', 'util', 'ebharatgas.com bharatpetroleum.in', 'bharatgas ebharatgas', 'BHRTGS'],
  // Travel
  ['makemytrip', 'MakeMyTrip', 'travel', 'makemytrip.com', 'makemytrip', 'MMTRIP'],
  ['goibibo', 'Goibibo', 'travel', 'goibibo.com', 'goibibo', 'GOIBIB'],
  ['yatra', 'Yatra', 'travel', 'yatra.com', '=yatra', 'YATRAC'],
  ['cleartrip', 'Cleartrip', 'travel', 'cleartrip.com', 'cleartrip', 'CLRTRP'],
  ['ixigo', 'ixigo', 'travel', 'ixigo.com', 'ixigo', 'IXIGOO'],
  ['redbus', 'redBus', 'travel', 'redbus.in', 'redbus', 'REDBUS'],
  ['airindia', 'Air India', 'travel', 'airindia.com airindia.in', 'airindia', 'AIRIND'],
  ['indigo', 'IndiGo', 'travel', 'goindigo.in', 'goindigo', 'INDIGO'],
  ['uber', 'Uber', 'travel', 'uber.com', '=uber', 'UBERIN'],
  ['ola', 'Ola', 'travel', 'olacabs.com olaelectric.com', 'olacabs', 'OLACAB'],
  ['rapido', 'Rapido', 'travel', 'rapido.bike', 'rapido', 'RAPIDO'],
  // Tech and social
  ['google', 'Google', 'tech', 'google.com google.co.in goo.gl g.co googleapis.com gstatic.com android.com youtube.com youtu.be', 'google youtube', 'GOOGLE'],
  ['whatsapp', 'WhatsApp', 'tech', 'whatsapp.com whatsapp.net wa.me', 'whatsapp', ''],
  ['telegram', 'Telegram', 'tech', 'telegram.org t.me telegram.me', 'telegram', ''],
  ['meta', 'Facebook / Instagram', 'tech', 'facebook.com fb.com fb.me instagram.com instagr.am meta.com messenger.com', 'facebook instagram', ''],
  ['microsoft', 'Microsoft', 'tech', 'microsoft.com live.com outlook.com office.com microsoftonline.com office365.com bing.com', 'microsoft office365', ''],
  ['apple', 'Apple', 'tech', 'apple.com icloud.com', '=apple icloud', ''],
  ['netflix', 'Netflix', 'tech', 'netflix.com', 'netflix', ''],
  ['truecaller', 'Truecaller', 'tech', 'truecaller.com', 'truecaller', ''],
  // Investing and finance
  ['zerodha', 'Zerodha', 'fin', 'zerodha.com kite.trade', 'zerodha', 'ZERODH'],
  ['groww', 'Groww', 'fin', 'groww.in', 'groww', 'GROWWI'],
  ['upstox', 'Upstox', 'fin', 'upstox.com', 'upstox', 'UPSTOX'],
  ['angelone', 'Angel One', 'fin', 'angelone.in angelbroking.com', 'angelone angelbroking', 'ANGELB'],
  ['nse', 'NSE', 'fin', 'nseindia.com', 'nseindia', 'NSEIND'],
  ['bse', 'BSE', 'fin', 'bseindia.com', 'bseindia', 'BSEIND'],
  ['cdsl', 'CDSL', 'fin', 'cdslindia.com cdslindia.in', 'cdsl', 'CDSLIN'],
  ['nsdl', 'NSDL', 'fin', 'nsdl.co.in nsdl.com', 'nsdl', 'NSDLIN'],
  ['bajaj', 'Bajaj Finserv', 'fin', 'bajajfinserv.in bajajfinservmarkets.in', 'bajajfinserv', 'BAJAJF'],
  ['policybazaar', 'Policybazaar', 'fin', 'policybazaar.com', 'policybazaar', 'PLCYBZ'],
  ['muthoot', 'Muthoot Finance', 'fin', 'muthootfinance.com', 'muthoot', 'MUTHOT'],
];

/** Hosts where anyone can publish content; official for the platform but never proof of a brand. */
const USER_CONTENT =
  'sites.google.com docs.google.com drive.google.com script.google.com forms.gle firebasestorage.googleapis.com ' +
  'youtube.com youtu.be t.me telegram.me wa.me chat.whatsapp.com linktr.ee rzp.io razorpay.me pages.razorpay.com ' +
  'imjo.in bio.link beacons.ai taplink.cc pastebin.com github.com gitlab.com medium.com dropbox.com ' +
  'dl.dropboxusercontent.com 1drv.ms onedrive.live.com mediafire.com wetransfer.com we.tl gofile.io ' +
  'facebook.com fb.me instagram.com x.com twitter.com linkedin.com lnkd.in sharechat.com mojapp.in ' +
  'onelink.me app.link page.link goo.gl';

/** Well-known sites that are not brands we verify but are not phishing either (news, reference, services). */
const KNOWN_GOOD =
  'wikipedia.org wikimedia.org reddit.com quora.com stackoverflow.com stackexchange.com bbc.com bbc.co.uk ' +
  'ndtv.com indiatimes.com thehindu.com hindustantimes.com indianexpress.com moneycontrol.com livemint.com ' +
  'news18.com aajtak.in bhaskar.com amarujala.com jagran.com zeenews.india.com abplive.com indiatoday.in ' +
  'thewire.in scroll.in theprint.in business-standard.com financialexpress.com cricbuzz.com espncricinfo.com ' +
  'imdb.com bookmyshow.com hotstar.com primevideo.com spotify.com gaana.com practo.com 1mg.com pharmeasy.in ' +
  'apollo247.com urbancompany.com justdial.com naukri.com indeed.com internshala.com unacademy.com byjus.com ' +
  'coursera.org udemy.com nptel.ac.in swayam.gov.in zoom.us teams.microsoft.com meet.google.com ' +
  'maps.google.com maps.app.goo.gl openai.com chatgpt.com claude.ai anthropic.com duckduckgo.com ' +
  'mozilla.org apple.news archive.org';

/** Generic link shorteners that hide the destination. */
const SHORTENERS =
  'bit.ly bitly.com tinyurl.com t.co cutt.ly rb.gy is.gd v.gd ow.ly shorturl.at rebrand.ly tiny.cc bit.do s.id ' +
  'shorte.st adf.ly t.ly bl.ink short.io shrtco.de surl.li u.to clck.ru buff.ly ift.tt tiny.one x.gd gg.gg ' +
  'shorturl.gg 2u.pw urlz.fr cutt.us qr.ae t2m.io soo.gd tny.im shrinke.me ouo.io short.gy bitly.ws l.ead.me ' +
  'shorturl.asia ln.run tinu.be is.gd';

/** Short-token affixes that make `sbikyc` or `mysbi` count as using the SBI name. */
const AFFIXES = /* @__PURE__ */ new Set(
  /* @__PURE__ */ (
    'kyc ekyc rekyc yono online net netbanking bank banking card cards reward rewards point points update updates ' +
    'verify verification login signin secure security help helpdesk care support service services customer refund ' +
    'refunds offer offers bonus gift gifts pay payment payments upi app apk india in ind official alert alerts block ' +
    'unblock account acc ac credit debit loan loans otp express delivery parcel post courier track tracking ship ' +
    'shipping cash cashback claim win prize lucky lottery free portal web site my e m i 24 247 24x7 hq team bill ' +
    'bills challan recharge sim esim 5g'
  ).split(' '),
);

let brands: Brand[] | null = null;
let officialMap: Map<string, Brand> | null = null;
let headerMap: Map<string, Brand> | null = null;
let userContent: Set<string> | null = null;
let shorteners: Set<string> | null = null;
let knownGood: Set<string> | null = null;

function load(): void {
  if (brands) return;
  brands = ROWS.map(([id, name, kind, domains, tokens, sms, nameHi]) => ({
    id,
    name,
    nameHi: nameHi ?? name,
    kind,
    domains: domains.split(' '),
    tokens: tokens.split(' ').filter(Boolean),
    sms: sms ? sms.split(' ') : [],
  }));
  officialMap = new Map();
  headerMap = new Map();
  for (const b of brands) {
    for (const d of b.domains) if (!officialMap.has(d)) officialMap.set(d, b);
    for (const h of b.sms) headerMap.set(h, b);
  }
  userContent = new Set(USER_CONTENT.split(' '));
  shorteners = new Set(SHORTENERS.split(' '));
  knownGood = new Set(KNOWN_GOOD.split(' '));
}

/** Host is (or is under) a well-known non-brand site such as wikipedia.org or a major news site. */
export function isKnownGoodHost(host: string): boolean {
  load();
  const set = knownGood as Set<string>;
  let h = host;
  for (let guard = 0; guard < 8; guard++) {
    if (set.has(h)) return true;
    const dot = h.indexOf('.');
    if (dot < 0) break;
    h = h.slice(dot + 1);
  }
  return false;
}

/** All brands in the registry. */
export function getBrands(): Brand[] {
  load();
  return brands as Brand[];
}

export function brandById(id: string): Brand | undefined {
  load();
  return (brands as Brand[]).find((b) => b.id === id);
}

/** Official brand for a host (exact or parent domain match), e.g. `retail.onlinesbi.sbi` → SBI. */
export function officialBrandForHost(host: string): Brand | null {
  load();
  const map = officialMap as Map<string, Brand>;
  let h = host;
  for (let guard = 0; guard < 8; guard++) {
    const b = map.get(h);
    if (b) return b;
    const dot = h.indexOf('.');
    if (dot < 0) break;
    h = h.slice(dot + 1);
  }
  return null;
}

/** Host is (or is under) a user-content platform such as sites.google.com, t.me or drive.google.com. */
export function isUserContentHost(host: string): boolean {
  load();
  const set = userContent as Set<string>;
  let h = host;
  for (let guard = 0; guard < 8; guard++) {
    if (set.has(h)) return true;
    const dot = h.indexOf('.');
    if (dot < 0) break;
    h = h.slice(dot + 1);
  }
  return false;
}

/** Host is a generic link shortener. */
export function isShortenerHost(host: string): boolean {
  load();
  const h = host.startsWith('www.') ? host.slice(4) : host;
  return (shorteners as Set<string>).has(h);
}

/** Brand that owns a DLT SMS header such as `HDFCBK` (from `VM-HDFCBK`). */
export function brandForSmsHeader(header: string): Brand | null {
  load();
  return (headerMap as Map<string, Brand>).get(header.toUpperCase()) ?? null;
}

/**
 * Find a brand whose name token appears inside a host body (host minus the
 * public suffix), e.g. `sbi.kyc-update` or `hdfc-reward`. Longest token wins.
 */
const LEET: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '@': 'a', $: 's' };

function deleet(s: string, one: string): string {
  return s.replace(/[0134578@$]/g, (c) => (c === '1' ? one : (LEET[c] as string)));
}

export function brandTokenInHost(body: string): { brand: Brand; token: string } | null {
  load();
  const parts = body.split(/[.\-_]+/).filter(Boolean);
  const partsNoDigits = parts.map((p) => p.replace(/\d+/g, ''));
  const rawFlat = body.replace(/[.\-_]+/g, '');
  // "amaz0n" and "paytrn"-style tricks: also look at a de-leeted copy.
  const flat = rawFlat + ' ' + deleet(rawFlat, 'i') + ' ' + deleet(rawFlat, 'l') + ' ' + rawFlat.replace(/rn/g, 'm').replace(/vv/g, 'w');
  let best: { brand: Brand; token: string } | null = null;
  for (const b of brands as Brand[]) {
    for (const raw of b.tokens) {
      const partOnly = raw.charAt(0) === '=';
      const t = partOnly ? raw.slice(1) : raw;
      if (best && best.token.length >= t.length) continue;
      let hit = false;
      if (!partOnly && t.length >= 4) {
        hit = flat.indexOf(t) >= 0;
      } else {
        for (const p of partsNoDigits) {
          if (p === t) {
            hit = true;
            break;
          }
          if (p.length > t.length) {
            if (p.startsWith(t) && AFFIXES.has(p.slice(t.length))) {
              hit = true;
              break;
            }
            if (p.endsWith(t) && AFFIXES.has(p.slice(0, p.length - t.length))) {
              hit = true;
              break;
            }
          }
        }
      }
      if (hit) best = { brand: b, token: t };
    }
  }
  return best;
}

/** Find a brand token used as a whole word in a URL path, e.g. `/sbi/kyc` or `/hdfc-login`. */
export function brandTokenInPath(path: string): { brand: Brand; token: string } | null {
  load();
  if (!path || path === '/') return null;
  const words = path.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  if (words.length === 0) return null;
  const wordSet = new Set(words);
  const joined = words.join(' ');
  let best: { brand: Brand; token: string } | null = null;
  for (const b of brands as Brand[]) {
    if (b.kind === 'tech') continue;
    for (const raw of b.tokens) {
      const t = raw.charAt(0) === '=' ? raw.slice(1) : raw;
      if (best && best.token.length >= t.length) continue;
      if (wordSet.has(t) || (t.length >= 5 && joined.indexOf(t) >= 0)) best = { brand: b, token: t };
    }
  }
  return best;
}

export interface BrandLabel {
  label: string;
  /** Confusable skeleton of the label (see lookalike.ts). */
  skeleton: string;
  brand: Brand;
  domain: string;
  suffix: string;
}

const GENERIC_LABELS = /* @__PURE__ */ new Set(['bank', 'live', 'office', 'meta', 'kite', 'media', 'pay']);
let labelCache: BrandLabel[] | null = null;
let suffixCache: Map<string, string[]> | null = null;

/** Registrable labels of official brand domains (for typo and homoglyph comparison). */
export function brandLabels(skeletonOf: (s: string) => string): BrandLabel[] {
  if (labelCache) return labelCache;
  load();
  const out: BrandLabel[] = [];
  const seen = new Set<string>();
  suffixCache = new Map();
  for (const b of brands as Brand[]) {
    for (const d of b.domains) {
      const parts = splitHost(d);
      const label = parts.label;
      if (parts.subdomain !== '') continue; // pay.google.com and friends: the label is the parent's
      const sufs = suffixCache.get(label);
      if (sufs) sufs.push(parts.suffix);
      else suffixCache.set(label, [parts.suffix]);
      if (label.length < 3 || GENERIC_LABELS.has(label) || seen.has(label)) continue;
      seen.add(label);
      out.push({ label, skeleton: skeletonOf(label), brand: b, domain: d, suffix: parts.suffix });
    }
  }
  labelCache = out;
  return out;
}

/** Public suffixes under which `label` is an official brand domain (e.g. `hdfcbank` → [`com`, `net`]). */
export function officialSuffixesForLabel(label: string): string[] {
  return (suffixCache && suffixCache.get(label)) || [];
}
