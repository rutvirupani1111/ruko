import { startTransition, useCallback, useEffect, useRef, useState } from 'react';
import type { Source, Verdict } from '@ruko/engine';
import type { Locale } from '@/i18n/core';
import { loadEngine, useEngine } from '@/lib/engine';

export const MAX_ANALYSED_CHARS = 8000;

export interface AnalysisState {
  verdict: Verdict | null;
  /** Exact text the verdict refers to. */
  analysed: string;
  /** Input changed and a new verdict is on its way. */
  pending: boolean;
  engineReady: boolean;
  engineError: boolean;
  analysisError: boolean;
}

interface Options {
  text: string;
  locale: Locale;
  source?: Source;
  sender?: string;
  debounceMs?: number;
}

/** Live, debounced analysis as the user types. Everything runs on the device. */
export function useAnalysis({ text, locale, source, sender, debounceMs = 260 }: Options) {
  const engine = useEngine();
  const [engineError, setEngineError] = useState(false);
  const [state, setState] = useState<Omit<AnalysisState, 'engineReady' | 'engineError'>>({
    verdict: null,
    analysed: '',
    pending: false,
    analysisError: false,
  });
  const immediate = useRef(false);

  useEffect(() => {
    loadEngine().catch(() => setEngineError(true));
  }, []);

  const retryEngine = useCallback(() => {
    setEngineError(false);
    loadEngine().catch(() => setEngineError(true));
  }, []);

  /** Skip the debounce for the next change (samples, QR, OCR, share target). */
  const runNextImmediately = useCallback(() => {
    immediate.current = true;
  }, []);

  useEffect(() => {
    const input = text.slice(0, MAX_ANALYSED_CHARS);
    if (!input.trim()) {
      immediate.current = false;
      setState({ verdict: null, analysed: '', pending: false, analysisError: false });
      return;
    }
    if (!engine) {
      setState((s) => ({ ...s, pending: true }));
      return;
    }
    const run = () => {
      try {
        const verdict = engine.analyze(input, {
          locale,
          source: source && source !== 'manual' ? source : undefined,
          sender: sender?.trim() || undefined,
        });
        startTransition(() => setState({ verdict, analysed: input, pending: false, analysisError: false }));
      } catch (err) {
        console.error('[ruko] analysis failed', err);
        setState((s) => ({ ...s, pending: false, analysisError: true }));
      }
    };
    if (immediate.current) {
      immediate.current = false;
      run();
      return;
    }
    setState((s) => ({ ...s, pending: true }));
    const id = window.setTimeout(run, debounceMs);
    return () => window.clearTimeout(id);
  }, [engine, text, locale, source, sender, debounceMs]);

  return {
    ...state,
    engineReady: !!engine,
    engineError,
    retryEngine,
    runNextImmediately,
    engine,
  };
}
