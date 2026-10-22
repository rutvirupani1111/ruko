/**
 * Optional on-device AI from the browser (Chrome's built-in Prompt API and
 * Translator API). Strictly feature-detected: when absent, the UI hides the
 * buttons and Ruko works exactly the same. Nothing here touches the network
 * beyond the browser's own one-time model download.
 */
import type { Verdict } from '@ruko/engine';

export type AiAvailability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

interface PromptOptions {
  signal?: AbortSignal;
}
interface LanguageModelSession {
  prompt(input: string, options?: PromptOptions): Promise<string>;
  destroy(): void;
}
interface LanguageModelStatic {
  availability(options?: object): Promise<AiAvailability>;
  create(options?: object): Promise<LanguageModelSession>;
}
interface TranslatorInstance {
  translate(input: string, options?: PromptOptions): Promise<string>;
  destroy(): void;
}
interface TranslatorStatic {
  availability(options: { sourceLanguage: string; targetLanguage: string }): Promise<AiAvailability>;
  create(options: { sourceLanguage: string; targetLanguage: string; signal?: AbortSignal }): Promise<TranslatorInstance>;
}

const TEXT_IO = {
  expectedInputs: [{ type: 'text', languages: ['en'] }],
  expectedOutputs: [{ type: 'text', languages: ['en'] }],
};

function languageModel(): LanguageModelStatic | null {
  const lm = (globalThis as { LanguageModel?: LanguageModelStatic }).LanguageModel;
  return lm && typeof lm.availability === 'function' && typeof lm.create === 'function' ? lm : null;
}

function translator(): TranslatorStatic | null {
  const t = (globalThis as { Translator?: TranslatorStatic }).Translator;
  return t && typeof t.availability === 'function' && typeof t.create === 'function' ? t : null;
}

export async function promptAvailability(): Promise<AiAvailability> {
  const lm = languageModel();
  if (!lm) return 'unavailable';
  try {
    return await lm.availability(TEXT_IO);
  } catch {
    return 'unavailable';
  }
}

export async function translatorAvailability(sourceLanguage = 'en', targetLanguage = 'hi'): Promise<AiAvailability> {
  const t = translator();
  if (!t) return 'unavailable';
  try {
    return await t.availability({ sourceLanguage, targetLanguage });
  } catch {
    return 'unavailable';
  }
}

const SYSTEM_PROMPT = [
  'You are Ruko, a calm and kind scam-safety helper for people in India.',
  'Explain to a non-technical older person, in 3 or 4 short sentences, why the message looks risky or safe and what to do next.',
  'Use plain everyday words. Never blame the reader. Do not repeat links, phone numbers or UPI IDs.',
  'If money may be lost, say to call 1930 or report at cybercrime.gov.in. No markdown, no lists, no em dashes.',
].join(' ');

export function buildExplainPrompt(verdict: Verdict, text: string): string {
  const signals = verdict.signals
    .filter((s) => s.weight > 0)
    .slice(0, 5)
    .map((s) => `- ${s.title}`)
    .join('\n');
  return [
    `Ruko's verdict: ${verdict.headline} (risk ${verdict.score} out of 100).`,
    signals ? `Warning signs Ruko found:\n${signals}` : 'Ruko found no warning signs.',
    `The message:\n"""${text.slice(0, 1500)}"""`,
    'Explain it simply.',
  ].join('\n\n');
}

/** Asks the browser's on-device model for a plain-language explanation (English). */
export async function explainSimply(verdict: Verdict, text: string, signal?: AbortSignal): Promise<string> {
  const lm = languageModel();
  if (!lm) throw new Error('Prompt API unavailable');
  const session = await lm.create({
    ...TEXT_IO,
    initialPrompts: [{ role: 'system', content: SYSTEM_PROMPT }],
    signal,
  });
  try {
    const answer = await session.prompt(buildExplainPrompt(verdict, text), { signal });
    return answer.replace(/—/g, ',').trim();
  } finally {
    session.destroy();
  }
}

/** Translates English text to Hindi with the browser's on-device Translator API. */
export async function translateToHindi(text: string, signal?: AbortSignal): Promise<string> {
  const t = translator();
  if (!t) throw new Error('Translator API unavailable');
  const instance = await t.create({ sourceLanguage: 'en', targetLanguage: 'hi', signal });
  try {
    return await instance.translate(text, { signal });
  } finally {
    instance.destroy();
  }
}
