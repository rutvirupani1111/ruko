import type { InputKind, ScamCategory, Source } from '../../src/types';

export interface CorpusItem {
  id: string;
  text: string;
  /** Expected scam category (scams only). */
  category?: ScamCategory;
  lang: 'en' | 'hi' | 'hinglish';
  source?: Source;
  sender?: string;
  kind?: InputKind;
}
