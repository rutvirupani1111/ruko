import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ArrowRight, BookOpen, Gamepad2, LifeBuoy, RotateCcw, ShieldCheck, Smartphone, Sparkles } from 'lucide-react';
import type { ScamCategory, Source } from '@ruko/engine';
import { Mark } from '@/components/brand/Mark';
import { Button, ButtonRouterLink } from '@/components/ui/Button';
import { VerdictCard } from '@/components/verdict/VerdictCard';
import { apiEnabled } from '@/config';
import { common } from '@/i18n/common';
import { baseLocale, useLocale, useT } from '@/i18n/core';
import { cn } from '@/lib/cn';
import { reportablesFrom } from '@/lib/community';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { CheckInput, type OcrState } from './CheckInput';
import { SAMPLES, type Sample } from './samples';
import { checkStrings } from './strings';
import { useAnalysis } from './useAnalysis';

const QrScannerDialog = lazy(() => import('./QrScannerDialog'));

/** Build the input from a Web Share Target request (title, text, url). */
export function textFromShare(params: URLSearchParams): string | null {
  const title = (params.get('title') ?? '').trim();
  const text = (params.get('text') ?? '').trim();
  const url = (params.get('url') ?? '').trim();
  const parts: string[] = [];
  if (title && !text.includes(title)) parts.push(title);
  if (text) parts.push(text);
  if (url && !text.includes(url)) parts.push(url);
  return parts.length ? parts.join('\n') : null;
}

export default function CheckPage() {
  const t = useT(checkStrings);
  const c = useT(common);
  const { locale } = useLocale();
  const location = useLocation();
  const navigate = useNavigate();
  useDocumentTitle(t.title);

  const [text, setText] = useState('');
  const [source, setSource] = useState<Source>('manual');
  const [sender, setSender] = useState('');
  const [ocr, setOcr] = useState<OcrState | null>(null);
  const [message, setMessage] = useState<{ text: string; tone: 'info' | 'error' } | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [sharedNotice, setSharedNotice] = useState(false);
  const ocrToken = useRef(0);
  const verdictRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const analysis = useAnalysis({ text, locale: baseLocale(locale), source, sender });
  const { verdict, runNextImmediately } = analysis;

  const categoryName = useMemo(() => {
    const cat = verdict?.category;
    const info = cat && analysis.engine ? analysis.engine.CATEGORIES[cat] : undefined;
    return info ? (baseLocale(locale) === 'hi' ? info.nameHi : info.name) : undefined;
  }, [verdict?.category, analysis.engine, locale]);

  const scrollToVerdict = useCallback(() => {
    // On phones the verdict sits below the input; bring it into view.
    window.requestAnimationFrame(() => {
      const el = verdictRef.current;
      if (!el || window.matchMedia('(min-width: 1024px)').matches) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
  }, []);

  const setInputNow = useCallback(
    (value: string, opts: { source?: Source; sender?: string; scroll?: boolean } = {}) => {
      runNextImmediately();
      setText(value);
      setSource(opts.source ?? 'manual');
      setSender(opts.sender ?? '');
      setMessage(null);
      if (opts.scroll) scrollToVerdict();
    },
    [runNextImmediately, scrollToVerdict],
  );

  // Web Share Target (/check?title=&text=&url=) and in-app hand-offs (router state).
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shared = textFromShare(params);
    const state = location.state as { text?: string; source?: Source } | null;
    if (shared) {
      setInputNow(shared, { source: 'manual', scroll: true });
      setSharedNotice(true);
      // Keep private text out of the address bar and history.
      navigate(location.pathname, { replace: true, state: null });
    } else if (state?.text) {
      setInputNow(state.text, { source: state.source, scroll: true });
      navigate(location.pathname, { replace: true, state: null });
    }
    // Runs only when a new location arrives.
  }, [location.key]);

  const onPasteClick = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip.trim()) setInputNow(clip, { scroll: true });
      else setMessage({ text: t.input.pasteEmpty, tone: 'info' });
    } catch {
      setMessage({ text: t.input.pasteDenied, tone: 'info' });
      inputRef.current?.focus();
    }
  };

  const onImage = async (file: File) => {
    const token = ++ocrToken.current;
    setMessage(null);
    setOcr({ active: true, stage: 'preparing', progress: 0 });
    try {
      const { readImageText } = await import('./ocr');
      const result = await readImageText(file, (p) => {
        if (ocrToken.current === token) setOcr({ active: true, stage: p.stage, progress: p.progress });
      });
      if (ocrToken.current !== token) return;
      setOcr(null);
      if (!result) {
        setMessage({ text: t.ocr.noText, tone: 'error' });
        return;
      }
      setInputNow(result, { scroll: true });
      setMessage({ text: t.ocr.done, tone: 'info' });
    } catch {
      if (ocrToken.current !== token) return;
      setOcr(null);
      setMessage({ text: navigator.onLine ? t.ocr.failed : t.ocr.offline, tone: 'error' });
    }
  };

  const onQrResult = useCallback(
    (value: string) => {
      setQrOpen(false);
      setInputNow(value, { source: 'qr', scroll: true });
      setMessage({ text: t.qr.found, tone: 'info' });
    },
    [setInputNow, t.qr.found],
  );

  const onReport = () => {
    if (!verdict) return;
    const items = reportablesFrom(verdict.entities);
    const category: ScamCategory | null = verdict.category;
    navigate('/report', { state: { items, category } });
  };

  const pickSample = (sample: Sample) => {
    setInputNow(sample.text[baseLocale(locale)], { source: sample.source, sender: sample.sender, scroll: true });
  };

  const hasInput = text.trim().length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 pt-6 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-12">
        <div className="min-w-0">
          <Hero />
          {sharedNotice ? (
            <p className="mb-3 flex items-center gap-2 rounded-2xl bg-accent-tint px-4 py-3 text-sm text-fg" role="status">
              <ShieldCheck aria-hidden="true" className="size-4 shrink-0 text-accent" />
              {t.shared.notice}
            </p>
          ) : null}
          <CheckInput
            value={text}
            onChange={(v) => {
              setText(v);
              setMessage(null);
            }}
            onClear={() => {
              setText('');
              setMessage(null);
              setSharedNotice(false);
              inputRef.current?.focus();
            }}
            onPasteClick={() => void onPasteClick()}
            onScanQr={() => setQrOpen(true)}
            onImage={(f) => void onImage(f)}
            onCancelOcr={() => {
              ocrToken.current++;
              setOcr(null);
            }}
            ocr={ocr}
            message={message}
            source={source}
            onSourceChange={setSource}
            sender={sender}
            onSenderChange={setSender}
            textareaRef={inputRef}
          />
          <SampleChips onPick={pickSample} />
        </div>

        <div ref={verdictRef} className="min-w-0 scroll-mt-20 lg:sticky lg:top-24 lg:self-start" aria-live="off">
          <VerdictRegion
            hasInput={hasInput}
            analysis={analysis}
            categoryName={categoryName}
            onReport={onReport}
          />
        </div>
      </div>

      <EmergencyStrip />

      <span className="sr-only" role="status" aria-live="polite">
        {verdict ? `${c.severity[verdict.severity]}. ${verdict.headline}` : ''}
      </span>

      {qrOpen ? (
        <Suspense fallback={null}>
          <QrScannerDialog onClose={() => setQrOpen(false)} onResult={onQrResult} />
        </Suspense>
      ) : null}
    </div>
  );
}

function Hero() {
  const t = useT(checkStrings);
  const { locale } = useLocale();
  return (
    <header className="mb-6 sm:mb-8">
      <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold tracking-wide text-muted sm:text-sm">
        <Mark size={16} />
        {t.hero.eyebrow}
      </p>
      <h1 className="display text-[2.65rem] text-fg min-[400px]:text-5xl sm:text-6xl lg:text-[4.1rem]">
        <span className="block sm:inline">{t.hero.pause} </span>
        <span className="hl hl-brand" style={{ animationDelay: '250ms' }}>
          {t.hero.check}
        </span>{' '}
        <span className="block text-brand">{t.hero.trust}</span>
      </h1>
      {locale === 'en' ? (
        <p lang="hi" className="mt-2 font-deva text-lg font-semibold text-muted">
          रुको। जाँचो। फिर भरोसा करो।
        </p>
      ) : (
        <p lang="en" className="mt-2 font-display text-lg font-semibold text-muted">
          Pause. Check. Then trust.
        </p>
      )}
      <p className="mt-4 max-w-xl text-[1.05rem] leading-relaxed text-muted">{t.hero.sub}</p>
    </header>
  );
}

function SampleChips({ onPick }: { onPick: (s: Sample) => void }) {
  const t = useT(checkStrings);
  const { locale } = useLocale();
  return (
    <section className="mt-6" aria-labelledby="samples-title">
      <h2 id="samples-title" className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
        <Sparkles aria-hidden="true" className="size-4 text-brand" />
        {t.samples.title}
      </h2>
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {SAMPLES.map((sample) => (
          <li key={sample.id} className="shrink-0">
            <button
              type="button"
              onClick={() => onPick(sample)}
              className={cn(
                'inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors',
                sample.kind === 'scam'
                  ? 'border-danger/30 bg-danger-tint text-fg hover:border-danger/60'
                  : 'border-safe/30 bg-safe-tint text-fg hover:border-safe/60',
              )}
              data-sample={sample.id}
            >
              <span
                aria-hidden="true"
                className={cn('size-2 rounded-full', sample.kind === 'scam' ? 'bg-danger-bg' : 'bg-safe-bg')}
              />
              {sample.label[baseLocale(locale)]}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

type Analysis = ReturnType<typeof useAnalysis>;

function VerdictRegion({
  hasInput,
  analysis,
  categoryName,
  onReport,
}: {
  hasInput: boolean;
  analysis: Analysis;
  categoryName?: string;
  onReport: () => void;
}) {
  const t = useT(checkStrings);
  const c = useT(common);

  if (!hasInput) return <EmptyState />;

  if (analysis.engineError && !analysis.engineReady) {
    return (
      <div className="rounded-[1.6rem] border border-line bg-surface p-6 text-center shadow-card" role="alert">
        <p className="font-semibold text-fg">{t.verdict.engineFailed}</p>
        <Button className="mt-4" variant="secondary" onClick={analysis.retryEngine}>
          <RotateCcw aria-hidden="true" />
          {c.actions.tryAgain}
        </Button>
      </div>
    );
  }

  if (analysis.analysisError && !analysis.verdict) {
    return (
      <div className="rounded-[1.6rem] border border-line bg-surface p-6 text-center shadow-card" role="alert">
        <p className="font-semibold text-fg">{t.verdict.analysisFailed}</p>
      </div>
    );
  }

  if (!analysis.verdict) return <VerdictSkeleton label={analysis.engineReady ? t.verdict.checking : t.verdict.loadingEngine} />;

  return (
    <VerdictCard
      verdict={analysis.verdict}
      text={analysis.analysed}
      categoryName={categoryName}
      apiEnabled={apiEnabled}
      onReport={onReport}
      stale={analysis.pending}
    />
  );
}

function VerdictSkeleton({ label }: { label: string }) {
  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-line bg-surface shadow-card" aria-busy="true">
      <div className="h-1 w-full overflow-hidden bg-line">
        <div className="progress-indeterminate h-full w-full" />
      </div>
      <div className="flex flex-col items-center gap-5 p-6 sm:flex-row">
        <div className="h-28 w-52 rounded-t-full bg-surface-2" />
        <div className="w-full space-y-3">
          <div className="h-6 w-24 rounded-full bg-surface-2" />
          <div className="h-8 w-4/5 rounded-xl bg-surface-2" />
          <div className="h-4 w-full rounded bg-surface-2" />
          <p className="text-sm text-muted">{label}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  const t = useT(checkStrings);
  const f = t.empty.features;
  const items = [
    { icon: Smartphone, title: f[0]!, body: f[1]! },
    { icon: ShieldCheck, title: f[2]!, body: f[3]! },
    { icon: Gamepad2, title: f[4]!, body: f[5]! },
  ];
  return (
    <div className="relative overflow-hidden rounded-[1.6rem] border border-line bg-surface p-6 shadow-card sm:p-8">
      <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-brand-bg/15 blur-2xl" />
      <ul className="relative space-y-6">
        {items.map(({ icon: Icon, title, body }, i) => (
          <li key={title} className="enter flex gap-4" style={{ ['--i' as string]: i }}>
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-ink text-saffron dark:bg-paper dark:text-ink">
              <Icon aria-hidden="true" className="size-6" />
            </span>
            <div>
              <h2 className="display text-xl text-fg">{title}</h2>
              <p className="mt-1 leading-relaxed text-muted">{body}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="relative mt-7 flex flex-wrap gap-2">
        <ButtonRouterLink to="/simulator" variant="accent" size="md">
          <Gamepad2 aria-hidden="true" />
          {t.empty.play}
        </ButtonRouterLink>
        <ButtonRouterLink to="/learn" variant="secondary" size="md">
          <BookOpen aria-hidden="true" />
          {t.empty.learn}
        </ButtonRouterLink>
      </div>
    </div>
  );
}

function EmergencyStrip() {
  const t = useT(checkStrings);
  return (
    <aside className="mt-12 overflow-hidden rounded-[1.6rem] bg-ink text-paper shadow-lift dark:bg-surface-2 dark:text-fg">
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-critical-bg text-white">
          <LifeBuoy aria-hidden="true" className="size-7" />
        </span>
        <div className="flex-1">
          <h2 className="display text-2xl">{t.emergency.title}</h2>
          <p className="mt-1.5 max-w-2xl leading-relaxed text-paper/80 dark:text-muted">{t.emergency.body}</p>
        </div>
        <ButtonRouterLink to="/help" variant="primary" size="lg" className="shrink-0">
          {t.emergency.cta}
          <ArrowRight aria-hidden="true" />
        </ButtonRouterLink>
      </div>
    </aside>
  );
}
