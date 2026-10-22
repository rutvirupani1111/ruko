/**
 * Language detection for normalised text: English, Hindi (Devanagari),
 * Hinglish (Hindi written in Latin script) or other.
 */

export type DetectedLanguage = 'en' | 'hi' | 'hinglish' | 'other';

/**
 * Common Hindi words in Latin script that are not also everyday English words.
 * Ambiguous tokens ("the", "main", "to", "par", "band", "mat") are left out.
 */
const HINGLISH = new Set(
  (
    'hai hain hei hn aap aapka aapki aapke aapko apka apki apke apko tum tumhara tumhari tumhe tumko ' +
    'tera teri tere mera meri mere mujhe mujhko humne hamara hamari humko hume kya kyu kyun kyon nahi ' +
    'nahin nhi nai kar karo karein karen kare kariye kijiye karna karni karke krna krke kro kr raha rahi ' +
    'rahe gaya gayi gaye hoga hogi honge hoge jayega jaega jayegi jaegi jaayega jayenge mein mai ke ki ka ko ' +
    'se bhi toh sirf abhi turant jaldi paisa paise rupaye rupay wala wali wale liye lie dijiye diya diye ' +
    'dena dene lena lene bhej bhejo bhejiye bhejein bhejna batao bataye bataiye bata btao btaye ghar baithe ' +
    'kamao kamaye kamaiye kamai naukri khata khate bijli yojana yojna inaam inam jeeta jeete jeeti badhai ' +
    'bhai bhaiya didi beta beti ji haan accha acha achha theek thik kal aaj raat subah shaam wapas vapas ' +
    'galti galati warna varna agar lekin aur ye yeh woh wo kuch sab sabko kaise kaisa kab kahan yahan ' +
    'wahan chahiye chaiye hua hui hue tha thi hoon hu unka unki uska uski isko usko inko phir bahut ' +
    'bohot bohat zyada jyada kam karwa karwao milega milenge milegi jayen jaye bolo bol hum ' +
    'dekho dekh suno pata maine humein unhe unko kisi kisiko koi ghante dabaye dabaiye ' +
    'karenge karunga karungi dunga dungi denge lijiye bataen bataein bhejen bhijwa samjho samjhe'
  ).split(' '),
);

function isDevanagariLetter(c: number): boolean {
  return c >= 0x0900 && c <= 0x097f && c !== 0x0964 && c !== 0x0965;
}

/** Detect the language of already-normalised (lowercase) text. */
export function detectLanguage(n: string): DetectedLanguage {
  let latin = 0;
  let deva = 0;
  let otherLetters = 0;
  for (let i = 0; i < n.length; i++) {
    const c = n.charCodeAt(i);
    if (c >= 97 && c <= 122) latin++;
    else if (isDevanagariLetter(c)) deva++;
    else if ((c >= 0x0980 && c <= 0x0dff) || (c >= 0x0600 && c <= 0x06ff) || (c >= 0x0e00 && c <= 0x0fff)) otherLetters++;
  }
  const letters = latin + deva + otherLetters;
  if (letters === 0) return 'other';
  if (deva / letters >= 0.3) return 'hi';
  if (otherLetters / letters >= 0.5) return 'other';
  // Latin script: English or Hinglish?
  const words = n.split(/[^a-z']+/).filter((w) => w.length > 0);
  if (words.length === 0) return 'other';
  let hits = 0;
  const seen = new Set<string>();
  for (const w of words) {
    if (HINGLISH.has(w)) {
      hits++;
      seen.add(w);
    }
  }
  const ratio = hits / words.length;
  if (seen.size >= 3 || (seen.size >= 2 && ratio >= 0.08) || (words.length <= 4 && hits >= 1 && ratio >= 0.25)) {
    return 'hinglish';
  }
  return 'en';
}
