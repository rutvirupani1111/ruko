import type { Verdict } from '@ruko/engine';
import { Languages, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { explainSimply, promptAvailability, translateToHindi, translatorAvailability, type AiAvailability } from '../ai';
import { useI18n } from '../i18n';

type State = { kind: 'idle' } | { kind: 'loading' } | { kind: 'done'; text: string; translated: boolean } | { kind: 'error' };

/**
 * "Explain in simple words" with the browser's on-device Prompt API, translated to
 * Hindi with the Translator API when the UI is in Hindi. Renders nothing when the
 * browser has neither.
 */
export function AiExplain({ verdict, text }: { verdict: Verdict; text: string }) {
  const { t, locale } = useI18n();
  const [prompt, setPrompt] = useState<AiAvailability>('unavailable');
  const [translator, setTranslator] = useState<AiAvailability>('unavailable');
  const [state, setState] = useState<State>({ kind: 'idle' });
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    let alive = true;
    void promptAvailability().then((a) => alive && setPrompt(a));
    void translatorAvailability('en', 'hi').then((a) => alive && setTranslator(a));
    return () => {
      alive = false;
      abort.current?.abort();
    };
  }, []);

  useEffect(() => {
    abort.current?.abort();
    setState({ kind: 'idle' });
  }, [verdict, text]);

  if (prompt === 'unavailable') return null;

  const run = async () => {
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    setState({ kind: 'loading' });
    try {
      let answer = await explainSimply(verdict, text, controller.signal);
      let translated = false;
      if (locale === 'hi' && translator !== 'unavailable') {
        answer = await translateToHindi(answer, controller.signal);
        translated = true;
      }
      if (!controller.signal.aborted) setState({ kind: 'done', text: answer, translated });
    } catch {
      if (!controller.signal.aborted) setState({ kind: 'error' });
    }
  };

  return (
    <section className="mx-4 mt-4 rounded-2xl border border-indigo/25 bg-indigo/6 p-3.5" aria-live="polite">
      {state.kind === 'done' ? (
        <>
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--indigo-text)]">
            <Sparkles size={15} aria-hidden="true" />
            {t('aiExplain')}
          </p>
          <p className="mt-1.5 text-[14.5px] leading-relaxed" lang={state.translated ? 'hi' : 'en'}>
            {state.text}
          </p>
          <p className="mt-2 flex items-center gap-1 text-[12px] text-[var(--muted)]">
            {state.translated ? <Languages size={13} aria-hidden="true" /> : null}
            {state.translated ? `${t('translated')}. ` : ''}
            {t('aiNote')}
          </p>
        </>
      ) : (
        <>
          <button type="button" className="rk-btn rk-btn-quiet w-full" onClick={run} disabled={state.kind === 'loading'}>
            <Sparkles size={16} aria-hidden="true" />
            {state.kind === 'loading' ? t('aiThinking') : t('aiExplain')}
          </button>
          {prompt !== 'available' ? <p className="mt-1.5 text-[12px] text-[var(--muted)]">{t('aiDownloadNote')}</p> : null}
          {state.kind === 'error' ? <p className="mt-1.5 text-[12.5px] text-[var(--danger-text)]">{t('aiFailed')}</p> : null}
        </>
      )}
    </section>
  );
}
