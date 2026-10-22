import { useCallback, useEffect, useRef, useState } from 'react';
import { bcp47, type Locale } from '@/i18n/core';

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/** Split into sentence-sized chunks: long utterances get cut off on some Android voices. */
export function splitForSpeech(text: string, max = 200): string[] {
  const sentences = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?।])\s+/u)
    .map((s) => s.trim())
    .filter(Boolean);
  const chunks: string[] = [];
  for (const sentence of sentences) {
    if (sentence.length <= max) {
      chunks.push(sentence);
      continue;
    }
    let rest = sentence;
    while (rest.length > max) {
      const cut = rest.lastIndexOf(' ', max);
      const at = cut > max / 2 ? cut : max;
      chunks.push(rest.slice(0, at).trim());
      rest = rest.slice(at).trim();
    }
    if (rest) chunks.push(rest);
  }
  return chunks;
}

function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  const lower = lang.toLowerCase();
  return (
    voices.find((v) => v.lang.toLowerCase() === lower) ??
    voices.find((v) => v.lang.toLowerCase().replace('_', '-') === lower) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(lower.slice(0, 2)))
  );
}

/** Read text aloud in en-IN or hi-IN. Returns whether speech started. */
export function useSpeech(locale: Locale) {
  const [speaking, setSpeaking] = useState(false);
  const supported = speechSupported();
  const token = useRef(0);

  const stop = useCallback(() => {
    token.current++;
    if (speechSupported()) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, rate = 0.95) => {
      if (!speechSupported() || !text.trim()) return false;
      const synth = window.speechSynthesis;
      synth.cancel();
      const lang = bcp47(locale);
      const voice = pickVoice(lang);
      const chunks = splitForSpeech(text);
      const mine = ++token.current;
      chunks.forEach((chunk, i) => {
        const u = new SpeechSynthesisUtterance(chunk);
        u.lang = lang;
        if (voice) u.voice = voice;
        u.rate = rate;
        if (i === chunks.length - 1) {
          u.onend = () => {
            if (token.current === mine) setSpeaking(false);
          };
        }
        u.onerror = () => {
          if (token.current === mine) setSpeaking(false);
        };
        synth.speak(u);
      });
      setSpeaking(true);
      return true;
    },
    [locale],
  );

  // Stop when the language changes or the component unmounts.
  useEffect(() => stop, [locale, stop]);

  return { supported, speaking, speak, stop };
}
