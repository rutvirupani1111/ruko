import { useEffect, useState } from 'react';
import { Languages, LoaderCircle, Sparkles } from 'lucide-react';
import type { Verdict } from '@ruko/engine';
import { Button } from '@/components/ui/Button';
import { defineStrings, useLocale, useT } from '@/i18n/core';

/**
 * Optional on-device AI from Chrome's built-in Translator and Prompt APIs.
 * Feature-detected; this module is only loaded when one of them exists, and
 * nothing here is ever required to use Ruko.
 */

type Availability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

interface TranslatorLike {
  translate(text: string): Promise<string>;
  destroy?: () => void;
}
interface TranslatorStatic {
  availability(opts: { sourceLanguage: string; targetLanguage: string }): Promise<Availability>;
  create(opts: { sourceLanguage: string; targetLanguage: string }): Promise<TranslatorLike>;
}
interface PromptSession {
  prompt(text: string): Promise<string>;
  destroy?: () => void;
}
interface LanguageModelStatic {
  availability(opts?: unknown): Promise<Availability>;
  create(opts?: unknown): Promise<PromptSession>;
}

const g = globalThis as unknown as { Translator?: TranslatorStatic; LanguageModel?: LanguageModelStatic };

const TARGETS = [
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी (Hindi)' },
];

const strings = defineStrings(
  {
    translate: 'Translate',
    translateTo: 'Translate this explanation into',
    translating: 'Translating on your device',
    explain: 'Explain simply',
    explaining: 'Writing a simple explanation on your device',
    failed: 'Your browser could not do this right now.',
    note: 'Done by your browser’s built-in AI, on this device.',
    choose: 'Choose a language',
  },
  {
    translate: 'अनुवाद करें',
    translateTo: 'इस जानकारी का अनुवाद करें',
    translating: 'आपके फ़ोन पर अनुवाद हो रहा है',
    explain: 'आसान भाषा में समझाएँ',
    explaining: 'आपके फ़ोन पर आसान भाषा में लिखा जा रहा है',
    failed: 'आपका ब्राउज़र अभी यह नहीं कर पाया।',
    note: 'यह आपके ब्राउज़र के बिल्ट-इन AI ने इसी फ़ोन पर किया।',
    choose: 'भाषा चुनें',
  },
);

function explanationText(v: Verdict): string {
  const lines = [v.headline, v.summary];
  for (const s of v.signals.filter((x) => x.weight > 0).slice(0, 4)) lines.push(`${s.title}: ${s.detail}`);
  for (const a of v.advice.slice(0, 3)) lines.push(`${a.title}. ${a.detail}`);
  return lines.filter(Boolean).join('\n');
}

export default function ChromeAiTools({ verdict }: { verdict: Verdict }) {
  const t = useT(strings);
  const { locale } = useLocale();
  const [canTranslate, setCanTranslate] = useState(false);
  const [canExplain, setCanExplain] = useState(false);
  const [target, setTarget] = useState('');
  const [busy, setBusy] = useState<'translate' | 'explain' | null>(null);
  const [output, setOutput] = useState<{ text: string; lang: string } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (g.Translator) {
          const a = await g.Translator.availability({ sourceLanguage: locale, targetLanguage: locale === 'en' ? 'hi' : 'en' });
          if (alive) setCanTranslate(a !== 'unavailable');
        }
      } catch {
        /* not supported */
      }
      try {
        if (g.LanguageModel) {
          const a = await g.LanguageModel.availability();
          if (alive) setCanExplain(a !== 'unavailable');
        }
      } catch {
        /* not supported */
      }
    })();
    return () => {
      alive = false;
    };
  }, [locale]);

  // A new verdict invalidates old output.
  useEffect(() => {
    setOutput(null);
    setError(false);
  }, [verdict]);

  const translate = async (code: string) => {
    setTarget(code);
    if (!code || !g.Translator || code === locale) return;
    setBusy('translate');
    setError(false);
    try {
      const translator = await g.Translator.create({ sourceLanguage: locale, targetLanguage: code });
      const text = await translator.translate(explanationText(verdict));
      translator.destroy?.();
      setOutput({ text, lang: code });
    } catch {
      setError(true);
    } finally {
      setBusy(null);
    }
  };

  const explain = async () => {
    if (!g.LanguageModel) return;
    setBusy('explain');
    setError(false);
    try {
      const outLang = locale === 'hi' ? 'hi' : 'en';
      const session = await g.LanguageModel.create({
        initialPrompts: [
          {
            role: 'system',
            content:
              'You help people in India stay safe from scams. Explain a scam warning in very simple words for someone who is not good with technology. Use at most 4 short sentences. Be warm and never blame the reader. Always mention: never share OTP or UPI PIN, and call 1930 if money was lost.',
          },
        ],
        expectedInputs: [{ type: 'text', languages: ['en', outLang] }],
        expectedOutputs: [{ type: 'text', languages: [outLang] }],
      });
      const text = await session.prompt(
        `${outLang === 'hi' ? 'Answer in simple Hindi.' : 'Answer in simple English.'}\n\nWarning to explain:\n${explanationText(verdict)}`,
      );
      session.destroy?.();
      setOutput({ text, lang: outLang });
    } catch {
      setError(true);
    } finally {
      setBusy(null);
    }
  };

  if (!canTranslate && !canExplain) return null;

  return (
    <>
      {canTranslate ? (
        <label className="inline-flex h-9 items-center gap-2 rounded-full border border-line-strong bg-surface pr-1 pl-3 text-sm font-semibold">
          <Languages aria-hidden="true" className="size-4" />
          <span className="sr-only">{t.translateTo}</span>
          <select
            className="h-8 rounded-full bg-transparent pr-2 text-sm font-semibold outline-none"
            value={target}
            onChange={(e) => void translate(e.target.value)}
            disabled={busy !== null}
          >
            <option value="">{t.translate}</option>
            {TARGETS.filter((x) => x.code !== locale).map((x) => (
              <option key={x.code} value={x.code}>
                {x.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {canExplain ? (
        <Button variant="secondary" size="sm" onClick={() => void explain()} disabled={busy !== null}>
          {busy === 'explain' ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <Sparkles aria-hidden="true" />}
          {t.explain}
        </Button>
      ) : null}
      <div className="w-full" aria-live="polite">
        {busy ? (
          <p className="text-sm text-muted">{busy === 'translate' ? t.translating : t.explaining}</p>
        ) : error ? (
          <p className="text-sm text-danger">{t.failed}</p>
        ) : output ? (
          <div className="mt-1 rounded-2xl border border-line bg-surface-2 p-4">
            <p lang={output.lang} className="text-[0.98rem] leading-relaxed whitespace-pre-line">
              {output.text}
            </p>
            <p className="mt-2 text-xs text-subtle">{t.note}</p>
          </div>
        ) : null}
      </div>
    </>
  );
}
