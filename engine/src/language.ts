import { normalize } from './normalize';
import { detectLanguage as detectNormalized, type DetectedLanguage } from './lang';

/** Detect whether raw text is English, Hindi (Devanagari), Hinglish (Hindi in Latin script) or other. */
export function detectLanguage(text: string): DetectedLanguage {
  return detectNormalized(normalize(typeof text === 'string' ? text : '').text);
}
