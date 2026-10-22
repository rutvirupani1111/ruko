import { r, type RuleModule } from './types';

/** Task-based job scams: like videos, rate hotels, "prepaid tasks", Telegram groups. */
export const jobTask: RuleModule = {
  cues: {
    wfh: [
      r`work(?:ing)? from home|wfh|part[- ]?time (?:job|work|income|opportunity|vacancy|online)|home[- ]based (?:job|work)|online (?:job|work|part[- ]time)|data entry (?:job|work)|easy (?:job|work|online work)`,
      r`ghar (?:baithe|baithkar|se kaam)|घर बैठे|पार्ट टाइम|ऑनलाइन (?:काम|नौकरी)`,
    ],
    earn: [
      r`earn(?:ing)?s? (?:up ?to |upto |around |₹|rs\.?|inr|\d)|earn (?:daily|per day|money|extra|income)`,
      r`(?:income|salary|payout|commission|payment) (?:of |upto |up to )?(?:₹|rs\.?|inr) ?\d`,
      r`(?:₹|rs\.?|inr) ?\d[\d,]*k? ?(?:-|to) ?(?:₹|rs\.?|inr)? ?\d[\d,]*k? (?:per|/|a|daily|every) ?(?:day|daily|hour|week)`,
      r`(?:₹|rs\.?|inr) ?\d[\d,]*k? ?(?:per|/|a|every|each) ?(?:day|hour|task|like|review|video|rating)`,
      r`\d+k? ?(?:-|to) ?\d+k? (?:daily|per day|/day|a day|rozana|roz)|daily (?:income|earning|payment|payout|salary)`,
      r`(?:roz|rozana|daily|har din) (?:₹|rs\.?)? ?\d[\d,]*k? (?:kamao|kamaye|kamaiye|kamaen)|kamao|kamaye|kamaiye|kamaen`,
      r`कमाएं|कमाइए|कमाओ|कमाई करें|रोजाना ₹? ?\d|रोज ₹? ?\d|प्रतिदिन ₹? ?\d`,
    ],
    task: [
      r`like (?:and|&) subscribe|subscribe (?:to )?(?:our |the |youtube )?(?:youtube )?channels?|like (?:youtube |instagram |our |the |these |simple )?(?:videos?|posts?|reels?)`,
      r`youtube (?:likes?|videos?|channels?|tasks?)|(?:google|map|maps) (?:reviews?|ratings?)|(?:rate|review|rating) (?:hotels?|restaurants?|products?|movies?|apps?)|hotel (?:ratings?|reviews?)|5[- ]star (?:ratings?|reviews?)`,
      r`(?:simple|easy|small|daily|online) tasks?|prepaid tasks?|merchant tasks?|task[- ](?:based|job|work)|tasks? (?:complete|karo|karna)|follow (?:instagram|accounts?)|(?:telegram|whatsapp) (?:tasks?|group tasks?)`,
      r`टास्क|यूट्यूब(?: वीडियो)? लाइक|वीडियो लाइक|लाइक करें|video like karo|like karna hai|likes karo`,
    ],
    recruiter: [
      r`(?:hr|h\.r\.) (?:manager|team|department|executive|recruiter)|recruit(?:er|ment|ing)|hiring|vacanc(?:y|ies)|(?:selected|shortlisted) for (?:a |the |our )?(?:job|position|role|post)|job (?:offer|opportunity|vacancy|openings?)`,
      r`naukri|naukari|नौकरी|भर्ती|we are looking for|work with us|join our team`,
    ],
    tg_contact: [r`telegram|t\.me/|wa\.me/|whatsapp (?:me|us|karo|kare|karein|on)|contact (?:on|via|through) (?:telegram|whatsapp)|(?:join|add) (?:our |the )?(?:telegram|whatsapp) (?:group|channel)|टेलीग्राम`],
    pay_to_work: [
      r`(?:registration|joining|security|refundable|activation|training|kit|id) (?:fee|fees|charges?|deposit|amount)|security deposit`,
      r`(?:invest|deposit|recharge|top ?up|pay) (?:₹|rs\.?|inr)? ?\d[\d,]*(?: \S+){0,4} (?:to )?(?:get|earn|receive|unlock|start|complete|withdraw|double)`,
      r`prepaid|(?:recharge|top ?up) (?:your )?(?:account|wallet|balance)|(?:pay|deposit|invest) first|pehle (?:pay|payment|paise|deposit|invest)|पहले (?:पैसे|भुगतान)`,
      r`commission (?:will be|is) (?:paid|credited|given)(?: \S+){0,4} after|withdraw(?:al)? (?:after|only after|fee|charges)|unlock (?:your )?(?:earnings|commission|withdrawal)`,
    ],
  },
  rules: [
    {
      id: 'job.easy_money', cat: 'job_task', w: 45, all: ['wfh|recruiter', 'earn'],
      en: ['Easy money from home', 'Jobs that promise thousands a day for little work are bait for task scams.'],
      hi: ['घर बैठे आसान कमाई', 'थोड़े से काम के लिए रोज़ हज़ारों रुपये का वादा, टास्क स्कैम का चारा होता है।'],
    },
    {
      id: 'job.task_scheme', cat: 'job_task', w: 55, all: ['task', 'earn|commission_word'],
      en: ['Paid to like videos or write reviews', 'You get small payouts first, then are asked to "invest" in prepaid tasks. That money is never returned.'],
      hi: ['वीडियो लाइक या रिव्यू के बदले पैसे', 'पहले थोड़े पैसे मिलते हैं, फिर "प्रीपेड टास्क" में पैसे लगवाए जाते हैं, जो कभी वापस नहीं आते।'],
    },
    {
      id: 'job.task_only', cat: 'job_task', w: 15, all: ['task'], x: 'job_task_only',
      en: ['Online "tasks" offered', 'Task offers from strangers are how these scams start.'],
      hi: ['ऑनलाइन "टास्क" की पेशकश', 'अनजान लोगों से टास्क की पेशकश से ही यह ठगी शुरू होती है।'],
    },
    {
      id: 'job.telegram', cat: 'job_task', w: 25, all: ['tg_contact|@tglink', 'task|wfh|earn|recruiter'],
      en: ['Moves the "job" to Telegram or WhatsApp', 'Real employers hire through official channels, not Telegram groups.'],
      hi: ['"नौकरी" की बात Telegram या WhatsApp पर', 'असली कंपनियाँ Telegram ग्रुप से भर्ती नहीं करतीं।'],
    },
    {
      id: 'job.pay_to_work', cat: 'job_task', w: 50, all: ['pay_to_work', 'job_word|task|wfh|earn|recruiter'],
      en: ['You must pay to start earning', 'A job that needs a deposit, recharge or "registration fee" is a scam.'],
      hi: ['कमाई शुरू करने से पहले पैसे देने होंगे', 'जिस नौकरी में डिपॉज़िट, रिचार्ज या "रजिस्ट्रेशन फ़ीस" लगे, वह ठगी है।'],
    },
    {
      id: 'job.foreign_number', cat: 'job_task', w: 30, all: ['@intl|@s_intl', 'wfh|recruiter|task|earn'],
      en: ['Job offer from a foreign number', 'Task and job scams often come from +1, +44, +62, +84 or +92 WhatsApp numbers.'],
      hi: ['विदेशी नंबर से नौकरी का ऑफ़र', 'टास्क और नौकरी वाली ठगी अक्सर +1, +44, +62, +84 या +92 वाले WhatsApp नंबरों से आती है।'],
    },
  ],
};
