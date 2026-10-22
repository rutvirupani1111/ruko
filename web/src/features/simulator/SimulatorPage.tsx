import './simulator.css';
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Link } from 'react-router';
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  CircleX,
  Flame,
  Lightbulb,
  RotateCcw,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CATEGORIES } from '@ruko/engine';
import { Mark } from '@/components/brand/Mark';
import { Button } from '@/components/ui/Button';
import { config } from '@/config';
import { common } from '@/i18n/common';
import { formatNumber, useLocale, useT, type Locale } from '@/i18n/core';
import { cn } from '@/lib/cn';
import { useSpeech } from '@/lib/speech';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { burstConfetti } from './confetti';
import type { NumberedFlag } from './FlagText';
import { celebrate, pointsFor, rankFor, readElder, readProgress, saveResult, shuffled, writeElder, type Progress } from './game';
import { PhoneMock } from './PhoneMock';
import { LEVELS, contentFor, scenariosForLevel, type Level, type Scenario } from './scenarios';
import { simStrings } from './strings';

type Phase = 'intro' | 'play' | 'summary';
type Answer = { scenarioId: string; saidScam: boolean; correct: boolean };

function speakable(s: Scenario, locale: Locale, t: (typeof simStrings)['en']): string {
  const c = contentFor(s, locale);
  const who = c.senderName ?? s.sender.display;
  switch (s.channel) {
    case 'whatsapp':
    case 'sms':
      return [who, ...(c.messages ?? []).map((m) => (m.type === 'text' ? m.text : m.type === 'receipt' ? `${m.title} ${m.amount}` : m.name))].join('. ');
    case 'email':
      return [who, c.subject ?? '', ...(c.body ?? [])].join('. ');
    case 'call':
      return (c.lines ?? []).map((l) => `${l.who === 'caller' ? t.phone.caller : t.phone.you}: ${l.text}`).join(' ');
    case 'payment':
      return [t.phone.paymentRequest, `${t.phone.requestFrom} ${who}`, String(s.amount ?? ''), c.note ?? ''].join('. ');
  }
}

export default function SimulatorPage() {
  const t = useT(simStrings);
  const { locale } = useLocale();
  useDocumentTitle(t.title);
  const reduce = useReducedMotion();
  const speech = useSpeech(locale);

  const [phase, setPhase] = useState<Phase>('intro');
  const [level, setLevel] = useState<Level>(1);
  const [deck, setDeck] = useState<Scenario[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lastPoints, setLastPoints] = useState(0);
  const [elder, setElderState] = useState(readElder);
  const [progress, setProgress] = useState<Progress>(readProgress);
  const feedbackRef = useRef<HTMLHeadingElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const scenario = deck[index];
  const answered = scenario ? answers.find((a) => a.scenarioId === scenario.id) : undefined;
  const content = scenario ? contentFor(scenario, locale) : undefined;
  const numbered: NumberedFlag[] = useMemo(() => (content ? content.flags.map((flag, i) => ({ flag, n: i + 1 })) : []), [content]);

  const setElder = (on: boolean) => {
    setElderState(on);
    writeElder(on);
    if (!on) speech.stop();
  };

  const scrollTop = useCallback(() => {
    topRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }, [reduce]);

  const start = (lvl: Level) => {
    speech.stop();
    setLevel(lvl);
    setDeck(shuffled(scenariosForLevel(lvl)));
    setIndex(0);
    setAnswers([]);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setLastPoints(0);
    setPhase('play');
    scrollTop();
  };

  // In elder mode, read each new scenario aloud (the tap that got here counts as user activation).
  useEffect(() => {
    if (phase === 'play' && elder && scenario && !answered) speech.speak(speakable(scenario, locale, t), 0.9);
    // Deliberately keyed to the round only: re-reading on every render would be noise.
  }, [phase, index, scenario?.id]);

  const answer = (saidScam: boolean) => {
    if (!scenario || answered) return;
    const correct = saidScam === scenario.isScam;
    const pts = pointsFor(correct, streak);
    const nextStreak = correct ? streak + 1 : 0;
    setAnswers((prev) => [...prev, { scenarioId: scenario.id, saidScam, correct }]);
    setScore((s) => s + pts);
    setLastPoints(pts);
    setStreak(nextStreak);
    setBestStreak((b) => Math.max(b, nextStreak));
    if (elder && content) {
      speech.speak(`${correct ? t.correct : t.wrong} ${scenario.isScam ? t.wasScam : t.wasSafe} ${content.explain} ${t.remember}: ${content.tip}`, 0.9);
    } else {
      speech.stop();
    }
    window.requestAnimationFrame(() => feedbackRef.current?.focus({ preventScroll: false }));
  };

  const next = () => {
    speech.stop();
    if (index + 1 < deck.length) {
      setIndex((i) => i + 1);
      scrollTop();
      return;
    }
    const correct = answers.filter((a) => a.correct).length;
    setProgress(saveResult(level, { correct, total: deck.length, score }));
    setPhase('summary');
    scrollTop();
    if (celebrate(correct, deck.length)) window.setTimeout(() => burstConfetti(), 180);
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <div ref={topRef} className={cn('mx-auto max-w-6xl scroll-mt-20 px-4 pt-6 pb-20 sm:px-6 sm:pt-10 lg:px-8', elder && 'elder')} data-elder={elder || undefined}>
        {phase === 'intro' ? (
          <Intro progress={progress} elder={elder} onElder={setElder} onStart={start} />
        ) : phase === 'play' && scenario && content ? (
          <div>
            <GameBar
              level={level}
              index={index}
              total={deck.length}
              score={score}
              streak={streak}
              answers={answers}
              deck={deck}
              onQuit={() => {
                speech.stop();
                setPhase('intro');
              }}
            />
            <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-12">
              <AnimatePresence mode="wait" initial={false}>
                <m.div
                  key={scenario.id}
                  initial={reduce ? false : { opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? undefined : { opacity: 0, x: -24 }}
                  transition={{ duration: 0.24, ease: [0.2, 0.7, 0.2, 1] }}
                  className="lg:sticky lg:top-24"
                  data-testid="sim-phone"
                  data-channel={scenario.channel}
                >
                  <PhoneMock scenario={scenario} content={content} flags={numbered} revealed={!!answered} t={t.phone} />
                </m.div>
              </AnimatePresence>

              <div className="min-w-0">
                {!answered ? (
                  <section aria-labelledby="sim-question" className="rounded-[1.6rem] border border-line bg-surface p-5 shadow-card sm:p-7">
                    <h2 id="sim-question" className={cn('display', elder ? 'text-4xl' : 'text-3xl sm:text-4xl')}>
                      {t.question}
                    </h2>
                    <p className={cn('mt-2 leading-relaxed text-muted', elder ? 'text-xl' : 'text-base')}>{t.questionHint}</p>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => answer(true)}
                        className={cn(
                          'group flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-danger/40 bg-danger-tint font-bold text-fg transition-[transform,border-color] duration-150 hover:border-danger active:scale-[0.97]',
                          elder ? 'min-h-36 text-3xl' : 'min-h-28 text-2xl',
                        )}
                        data-testid="answer-scam"
                      >
                        <ShieldAlert aria-hidden="true" className={cn('text-danger', elder ? 'size-11' : 'size-8')} />
                        {t.scam}
                        <span className={cn('font-medium text-muted', elder ? 'text-lg' : 'text-sm')}>{t.scamHint}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => answer(false)}
                        className={cn(
                          'group flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-safe/40 bg-safe-tint font-bold text-fg transition-[transform,border-color] duration-150 hover:border-safe active:scale-[0.97]',
                          elder ? 'min-h-36 text-3xl' : 'min-h-28 text-2xl',
                        )}
                        data-testid="answer-safe"
                      >
                        <ShieldCheck aria-hidden="true" className={cn('text-safe', elder ? 'size-11' : 'size-8')} />
                        {t.safe}
                        <span className={cn('font-medium text-muted', elder ? 'text-lg' : 'text-sm')}>{t.safeHint}</span>
                      </button>
                    </div>
                    {speech.supported ? (
                      <Button
                        variant="secondary"
                        size={elder ? 'lg' : 'md'}
                        className="mt-4"
                        onClick={() => (speech.speaking ? speech.stop() : speech.speak(speakable(scenario, locale, t), 0.9))}
                        aria-pressed={speech.speaking}
                      >
                        {speech.speaking ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
                        {speech.speaking ? t.stopReading : t.readAloud}
                      </Button>
                    ) : null}
                  </section>
                ) : (
                  <Feedback
                    scenario={scenario}
                    answer={answered}
                    flagsTitle={scenario.isScam ? t.warningSigns : t.goodSigns}
                    points={lastPoints}
                    headingRef={feedbackRef}
                    elder={elder}
                    isLast={index + 1 >= deck.length}
                    onNext={next}
                    speech={speech}
                  />
                )}
              </div>
            </div>
          </div>
        ) : phase === 'summary' ? (
          <Summary
            level={level}
            answers={answers}
            deck={deck}
            score={score}
            bestStreak={bestStreak}
            onAgain={() => start(level)}
            onNext={level < 3 ? () => start((level + 1) as Level) : undefined}
            onLevels={() => setPhase('intro')}
          />
        ) : null}
        <p className="sr-only" aria-live="polite">
          {phase === 'play' && answered ? `${answered.correct ? t.correct : t.wrong} ${scenario?.isScam ? t.wasScam : t.wasSafe}` : ''}
        </p>
      </div>
    </LazyMotion>
  );
}

function Intro({
  progress,
  elder,
  onElder,
  onStart,
}: {
  progress: Progress;
  elder: boolean;
  onElder: (on: boolean) => void;
  onStart: (level: Level) => void;
}) {
  const t = useT(simStrings);
  const recommended = LEVELS.find((l) => !progress[l]) ?? 1;
  return (
    <div>
      <header className="grid items-end gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="max-w-3xl">
          <p className="text-sm font-bold tracking-[0.16em] text-brand uppercase">{t.eyebrow}</p>
          <h1 className={cn('display mt-3', elder ? 'text-5xl sm:text-6xl' : 'text-[2.6rem] sm:text-6xl')}>{t.heading}</h1>
          <p className={cn('mt-4 max-w-2xl leading-relaxed text-muted', elder ? 'text-xl' : 'text-[1.05rem]')}>{t.intro}</p>
        </div>
        <ElderToggle elder={elder} onElder={onElder} />
      </header>

      <ol className="mt-8 grid gap-3 sm:grid-cols-3">
        {t.how.map((step, i) => (
          <li key={i} className="flex items-start gap-3 rounded-2xl bg-surface-2 p-4">
            <span className="num grid size-8 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-paper dark:bg-paper dark:text-ink">{i + 1}</span>
            <span className={cn('leading-relaxed', elder ? 'text-xl' : '')}>{step}</span>
          </li>
        ))}
      </ol>

      <ul className="mt-8 grid gap-4 md:grid-cols-3">
        {LEVELS.map((lvl) => {
          const info = t.levels[lvl];
          const best = progress[lvl];
          const total = scenariosForLevel(lvl).length;
          const stars = best ? Math.round((best.correct / best.total) * 3) : 0;
          return (
            <li key={lvl}>
              <button
                type="button"
                onClick={() => onStart(lvl)}
                className={cn(
                  'group relative flex h-full w-full flex-col overflow-hidden rounded-[1.5rem] border bg-surface p-6 text-left shadow-card transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lift',
                  lvl === recommended ? 'border-brand-bg/70 ring-2 ring-brand-bg/30' : 'border-line',
                )}
                data-testid={`level-${lvl}`}
              >
                <span aria-hidden="true" className="absolute -top-6 -right-4 font-display text-[7rem] leading-none font-extrabold text-fg/[0.05]">
                  {lvl}
                </span>
                <span className="flex items-center gap-2 text-sm font-semibold text-muted">
                  {t.levelLabel(lvl)} · {t.rounds(total)}
                  {lvl === recommended ? <span className="rounded-full bg-brand-tint px-2 py-0.5 text-xs font-bold text-brand">{t.recommended}</span> : null}
                </span>
                <span className={cn('display mt-2', elder ? 'text-4xl' : 'text-3xl')}>{info.name}</span>
                <span className={cn('mt-2 leading-relaxed text-muted', elder ? 'text-xl' : '')}>{info.body}</span>
                <span className="mt-auto flex items-center justify-between gap-3 pt-6">
                  <span className="flex items-center gap-1" aria-label={best ? t.best(best.correct, best.total) : undefined}>
                    {[0, 1, 2].map((i) => (
                      <Trophy key={i} aria-hidden="true" className={cn('size-5', i < stars ? 'fill-caution-bg text-caution' : 'text-line-strong')} />
                    ))}
                    {best ? <span className="ml-1 text-sm text-muted">{t.best(best.correct, best.total)}</span> : null}
                  </span>
                  <span className="inline-flex h-11 items-center gap-1.5 rounded-full bg-brand-bg px-4 font-bold text-on-brand">
                    {t.start}
                    <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ElderToggle({ elder, onElder }: { elder: boolean; onElder: (on: boolean) => void }) {
  const t = useT(simStrings);
  return (
    <label className="flex max-w-sm cursor-pointer items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card">
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input
          type="checkbox"
          role="switch"
          checked={elder}
          onChange={(e) => onElder(e.target.checked)}
          className="peer sr-only"
          data-testid="elder-toggle"
        />
        <span className="h-7 w-12 rounded-full bg-line-strong transition-colors peer-checked:bg-accent-bg peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--focus)]" />
        <span className="absolute top-1 left-1 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
      <span>
        <span className="block font-bold">{t.elder}</span>
        <span className="block text-sm leading-relaxed text-muted">{t.elderBody}</span>
      </span>
    </label>
  );
}

function GameBar({
  level,
  index,
  total,
  score,
  streak,
  answers,
  deck,
  onQuit,
}: {
  level: Level;
  index: number;
  total: number;
  score: number;
  streak: number;
  answers: Answer[];
  deck: Scenario[];
  onQuit: () => void;
}) {
  const t = useT(simStrings);
  const { locale } = useLocale();
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-card">
      <button type="button" onClick={onQuit} className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent underline-offset-4 hover:underline">
        <ArrowLeft aria-hidden="true" className="size-4" />
        {t.quit}
      </button>
      <p className="font-semibold">
        {t.levelLabel(level)}: {t.levels[level].name}
      </p>
      <ol className="flex items-center gap-1.5" aria-label={t.round(index + 1, total)}>
        {deck.map((s, i) => {
          const a = answers.find((x) => x.scenarioId === s.id);
          return (
            <li
              key={s.id}
              className={cn(
                'h-2 w-5 rounded-full transition-colors duration-200',
                a ? (a.correct ? 'bg-safe-bg' : 'bg-danger-bg') : i === index ? 'bg-fg' : 'bg-line-strong',
              )}
            />
          );
        })}
      </ol>
      <p className="num text-sm text-muted" data-testid="sim-round">
        {t.round(index + 1, total)}
      </p>
      <div className="ml-auto flex items-center gap-4">
        <p className="flex items-center gap-1.5 text-sm font-semibold" title={t.streak}>
          <Flame aria-hidden="true" className={cn('size-5', streak > 1 ? 'text-brand' : 'text-subtle')} />
          <span className="sr-only">{t.streak}:</span>
          <span className="num">{streak}</span>
        </p>
        <p className="text-sm">
          <span className="text-muted">{t.score} </span>
          <span className="num font-display text-xl font-extrabold" data-testid="sim-score">
            {formatNumber(score, locale)}
          </span>
        </p>
      </div>
    </div>
  );
}

function Feedback({
  scenario,
  answer,
  flagsTitle,
  points,
  headingRef,
  elder,
  isLast,
  onNext,
  speech,
}: {
  scenario: Scenario;
  answer: Answer;
  flagsTitle: string;
  points: number;
  headingRef: RefObject<HTMLHeadingElement | null>;
  elder: boolean;
  isLast: boolean;
  onNext: () => void;
  speech: ReturnType<typeof useSpeech>;
}) {
  const t = useT(simStrings);
  const { locale } = useLocale();
  const content = contentFor(scenario, locale);
  const scam = scenario.isScam;
  const category = scenario.category ? CATEGORIES[scenario.category] : undefined;
  const readExplanation = () => {
    if (speech.speaking) speech.stop();
    else speech.speak(`${scam ? t.wasScam : t.wasSafe} ${content.explain} ${content.flags.map((f) => f.why).join(' ')} ${t.remember}: ${content.tip}`, 0.9);
  };

  return (
    <section aria-labelledby="sim-feedback" className="enter space-y-5" data-testid="sim-feedback" data-correct={answer.correct}>
      <div className={cn('rounded-[1.6rem] p-5 sm:p-7', answer.correct ? 'bg-safe-tint' : 'bg-danger-tint')}>
        <div className="flex items-start gap-3">
          {answer.correct ? (
            <CircleCheck aria-hidden="true" className="pop-in mt-0.5 size-9 shrink-0 text-safe" />
          ) : (
            <CircleX aria-hidden="true" className="pop-in mt-0.5 size-9 shrink-0 text-danger" />
          )}
          <div className="min-w-0 flex-1">
            <h2 ref={headingRef} id="sim-feedback" tabIndex={-1} className={cn('display outline-none', elder ? 'text-4xl' : 'text-3xl')}>
              {answer.correct ? t.correct : t.wrong}
            </h2>
            <p className={cn('mt-1 font-semibold', elder ? 'text-2xl' : 'text-lg', scam ? 'text-danger' : 'text-safe')}>{scam ? t.wasScam : t.wasSafe}</p>
          </div>
          {points > 0 ? <span className="num pop-in shrink-0 rounded-full bg-surface px-3 py-1 text-sm font-bold text-safe">{t.points(points)}</span> : null}
        </div>
        <p className={cn('mt-3 leading-relaxed text-fg', elder ? 'text-xl' : '')}>{content.explain}</p>
      </div>

      <div className="rounded-[1.6rem] border border-line bg-surface p-5 shadow-card sm:p-7">
        <h3 className="text-xs font-bold tracking-[0.12em] text-muted uppercase">{flagsTitle}</h3>
        <ol className="mt-3 space-y-3">
          {content.flags.map((flag, i) => (
            <li key={i} className="enter flex gap-3" style={{ ['--i' as string]: i }}>
              <span
                aria-hidden="true"
                className={cn('num grid size-7 shrink-0 place-items-center rounded-full text-sm font-bold', scam ? 'bg-danger-bg text-white' : 'bg-safe-bg text-ink')}
              >
                {i + 1}
              </span>
              <div className={cn('min-w-0 leading-relaxed', elder ? 'text-xl' : '')}>
                <p className="font-semibold text-fg">{flag.on === 'pay' ? t.phone.pay : flag.phrase}</p>
                <p className="text-muted">{flag.why}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-5 flex gap-3 rounded-2xl bg-brand-tint p-4">
          <Lightbulb aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand" />
          <p className={cn('leading-relaxed', elder ? 'text-xl' : '')}>
            <strong className="font-semibold">{t.remember}: </strong>
            {content.tip}
          </p>
        </div>
        {category ? (
          <Link to={`/learn/${scenario.category}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent underline-offset-4 hover:underline">
            {t.learnAbout}: {locale === 'hi' ? category.nameHi : category.name}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="primary" size={elder ? 'xl' : 'lg'} onClick={onNext} data-testid="sim-next">
          {isLast ? t.results : t.next}
          <ArrowRight aria-hidden="true" />
        </Button>
        {speech.supported ? (
          <Button variant="secondary" size={elder ? 'xl' : 'lg'} onClick={readExplanation} aria-pressed={speech.speaking}>
            {speech.speaking ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
            {speech.speaking ? t.stopReading : t.readAloud}
          </Button>
        ) : null}
      </div>
    </section>
  );
}

function Summary({
  level,
  answers,
  deck,
  score,
  bestStreak,
  onAgain,
  onNext,
  onLevels,
}: {
  level: Level;
  answers: Answer[];
  deck: Scenario[];
  score: number;
  bestStreak: number;
  onAgain: () => void;
  onNext?: () => void;
  onLevels: () => void;
}) {
  const t = useT(simStrings);
  const c = useT(common);
  const { locale } = useLocale();
  const correct = answers.filter((a) => a.correct).length;
  const total = deck.length;
  const rank = t.ranks[rankFor(correct, total)];
  const missed = deck.filter((s) => answers.find((a) => a.scenarioId === s.id && !a.correct));
  const [shareState, setShareState] = useState<'idle' | 'busy' | 'shared' | 'saved' | 'failed'>('idle');
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const share = async () => {
    setShareState('busy');
    try {
      const { renderCard, shareImage } = await import('@/lib/shareCard');
      const blob = await renderCard({
        kind: 'result',
        eyebrow: t.cardEyebrow,
        title: rank.title,
        bigStat: `${correct}/${total}`,
        bigStatLabel: t.cardStatLabel,
        bullets: [`${t.levelLabel(level)}: ${t.levels[level].name}`, t.finalScore(score), t.bestStreak(bestStreak)],
        tagline: c.brand.tagline,
        footer: `${config.siteUrl.replace(/^https?:\/\//, '')}/simulator`,
        hindi: locale === 'hi',
      });
      const outcome = await shareImage(blob, 'ruko-spot-the-scam.png', t.shareText(correct, total, `${config.siteUrl}/simulator`), 'Ruko');
      setShareState(outcome === 'shared' ? 'shared' : outcome === 'downloaded' ? 'saved' : 'idle');
    } catch {
      setShareState('failed');
    }
  };

  return (
    <section aria-labelledby="sim-summary" className="mx-auto max-w-3xl" data-testid="sim-summary">
      <div className="relative overflow-hidden rounded-[2rem] bg-ink p-7 text-paper shadow-lift sm:p-10 dark:bg-surface-2 dark:text-fg">
        <div aria-hidden="true" className="absolute -top-24 -right-24 size-72 rounded-full bg-saffron/25 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <Mark size={40} animate />
          <span className="text-sm font-bold tracking-[0.18em] text-paper/70 uppercase dark:text-muted">
            {t.levelLabel(level)} · {t.levels[level].name}
          </span>
        </div>
        <p className="num relative mt-8 font-display text-[5.5rem] leading-none font-extrabold sm:text-[7rem]" data-testid="sim-final">
          {correct}
          <span className="text-paper/45 dark:text-subtle">/{total}</span>
        </p>
        <h2 ref={headingRef} id="sim-summary" tabIndex={-1} className="display relative mt-3 text-4xl text-saffron outline-none sm:text-5xl">
          {rank.title}
        </h2>
        <p className="relative mt-2 text-lg font-semibold">{t.summaryOf(correct, total)}</p>
        <p className="relative mt-3 max-w-xl leading-relaxed text-paper/80 dark:text-muted">{rank.body}</p>
        <div className="relative mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-paper/80 dark:text-muted">
          <span className="flex items-center gap-1.5">
            <Trophy aria-hidden="true" className="size-4 text-saffron" />
            {t.finalScore(score)}
          </span>
          <span className="flex items-center gap-1.5">
            <Flame aria-hidden="true" className="size-4 text-saffron" />
            {t.bestStreak(bestStreak)}
          </span>
        </div>
        <div className="relative mt-8 flex flex-wrap gap-3">
          <Button variant="primary" size="lg" onClick={share} disabled={shareState === 'busy'} data-testid="sim-share">
            <Share2 aria-hidden="true" />
            {t.share}
          </Button>
          {onNext ? (
            <Button variant="secondary" size="lg" onClick={onNext} className="dark:bg-surface">
              {t.nextLevel}
              <ArrowRight aria-hidden="true" />
            </Button>
          ) : null}
          <Button variant="ghost" size="lg" onClick={onAgain} className="text-paper hover:bg-white/10 dark:text-fg">
            <RotateCcw aria-hidden="true" />
            {t.playAgain}
          </Button>
        </div>
        <p role="status" className="relative mt-3 text-sm text-paper/80 empty:hidden dark:text-muted">
          {shareState === 'busy' ? t.sharing : shareState === 'shared' ? t.shared : shareState === 'saved' ? t.saved : shareState === 'failed' ? t.shareFailed : ''}
        </p>
      </div>

      {missed.length > 0 ? (
        <div className="mt-8">
          <h3 className="display text-2xl">{t.reviewMissed}</h3>
          <ul className="mt-4 space-y-3">
            {missed.map((s) => {
              const sc = contentFor(s, locale);
              return (
                <li key={s.id} className="rounded-2xl border border-line bg-surface p-4">
                  <p className={cn('font-semibold', s.isScam ? 'text-danger' : 'text-safe')}>{s.isScam ? t.wasScam : t.wasSafe}</p>
                  <p className="mt-1 leading-relaxed text-muted">{sc.explain}</p>
                  <p className="mt-2 text-sm">
                    <strong className="font-semibold">{t.remember}: </strong>
                    {sc.tip}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <button type="button" onClick={onLevels} className="mt-8 inline-flex items-center gap-1.5 font-semibold text-accent underline-offset-4 hover:underline">
        <ArrowLeft aria-hidden="true" className="size-4" />
        {t.quit}
      </button>
    </section>
  );
}
