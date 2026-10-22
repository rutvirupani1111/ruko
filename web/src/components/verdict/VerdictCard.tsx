import { lazy, Suspense, useId, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Flag, LoaderCircle, PhoneCall, Share2, Volume2, VolumeX } from 'lucide-react';
import type { Verdict } from '@ruko/engine';
import { Button } from '@/components/ui/Button';
import { config } from '@/config';
import { checkStrings } from '@/features/check/strings';
import { common } from '@/i18n/common';
import { useLocale, useT } from '@/i18n/core';
import { cn } from '@/lib/cn';
import { reportablesFrom } from '@/lib/community';
import { useSpeech } from '@/lib/speech';
import { isLearnCategory } from '@/data/categories';
import { AdviceList } from './AdviceList';
import { EntityList } from './EntityList';
import { HighlightedText } from './HighlightedText';
import { RiskMeter } from './RiskMeter';
import { SeverityChip } from './SeverityChip';
import { SignalList } from './SignalList';
import { atLeast } from './severity';
import { useCommunity } from './useCommunity';

const ChromeAiTools = lazy(() => import('./ChromeAiTools'));

const hasChromeAi = () => typeof self !== 'undefined' && ('Translator' in self || 'LanguageModel' in self);

const headerTint = {
  safe: 'bg-safe-tint',
  low: 'bg-accent-tint',
  medium: 'bg-caution-tint',
  high: 'bg-danger-tint',
  critical: 'bg-critical-tint',
} as const;

interface VerdictCardProps {
  verdict: Verdict;
  /** The exact text that was analysed (evidence spans point into it). */
  text: string;
  categoryName?: string;
  apiEnabled?: boolean;
  onReport?: () => void;
  stale?: boolean;
}

export function VerdictCard({ verdict, text, categoryName, apiEnabled = false, onReport, stale = false }: VerdictCardProps) {
  const t = useT(checkStrings);
  const c = useT(common);
  const { locale } = useLocale();
  const idPrefix = useId().replace(/:/g, '');
  const community = useCommunity(verdict.entities);
  const speech = useSpeech(locale);
  const [shareState, setShareState] = useState<'idle' | 'busy' | 'shared' | 'saved' | 'failed'>('idle');

  const flags = useMemo(() => verdict.signals.filter((s) => s.weight > 0), [verdict.signals]);
  const hasMarks = verdict.signals.some((s) => s.spans.length > 0);
  const reportables = useMemo(() => reportablesFrom(verdict.entities), [verdict.entities]);
  const severityLabel = c.severity[verdict.severity];
  const learnable = verdict.category && isLearnCategory(verdict.category) ? verdict.category : null;
  const showChromeAi = useMemo(hasChromeAi, []);

  const readAloud = () => {
    if (speech.speaking) {
      speech.stop();
      return;
    }
    const parts = [verdict.headline, verdict.summary];
    if (flags.length) parts.push(`${t.verdict.redFlags}: ${flags.slice(0, 4).map((s) => s.title).join('. ')}`);
    if (verdict.advice.length) parts.push(`${t.verdict.whatToDo}: ${verdict.advice.slice(0, 4).map((a) => a.title).join('. ')}`);
    speech.speak(parts.join('. '));
  };

  const share = async () => {
    setShareState('busy');
    try {
      const { renderCard, shareImage } = await import('@/lib/shareCard');
      const blob = await renderCard({
        kind: 'warning',
        eyebrow: locale === 'hi' ? 'चेतावनी' : 'WARNING',
        title: verdict.headline,
        score: verdict.score,
        severity: verdict.severity,
        severityLabel,
        bulletsTitle: flags.length ? t.verdict.redFlags : undefined,
        bullets: flags.slice(0, 3).map((s) => s.title),
        tagline: c.brand.tagline,
        footer: config.siteUrl.replace(/^https?:\/\//, ''),
        hindi: locale === 'hi',
      });
      const outcome = await shareImage(blob, 'ruko-warning.png', t.actions.shareText(verdict.headline, config.siteUrl), 'Ruko');
      setShareState(outcome === 'shared' ? 'shared' : outcome === 'downloaded' ? 'saved' : 'idle');
    } catch {
      setShareState('failed');
    }
  };

  const shareStatus =
    shareState === 'busy'
      ? t.actions.sharing
      : shareState === 'shared'
        ? t.actions.shared
        : shareState === 'saved'
          ? t.actions.saved
          : shareState === 'failed'
            ? t.actions.shareFailed
            : '';

  return (
    <article
      className={cn(
        '@container overflow-hidden rounded-[1.6rem] border border-line bg-surface shadow-lift transition-opacity duration-200',
        verdict.severity === 'critical' && 'ring-2 ring-critical/45',
        verdict.severity === 'high' && 'ring-2 ring-danger/35',
        stale && 'opacity-70',
      )}
      aria-labelledby={`${idPrefix}-headline`}
      data-testid="verdict-card"
      data-severity={verdict.severity}
      data-category={verdict.category ?? ''}
    >
      <header className={cn('relative px-5 pt-6 pb-5 @lg:px-7 @lg:pt-7', headerTint[verdict.severity])}>
        <PauseBarsWatermark />
        <div className="relative flex flex-col items-center gap-5 @2xl:flex-row @2xl:items-center @2xl:gap-7">
          <RiskMeter
            score={verdict.score}
            severity={verdict.severity}
            label={t.verdict.meterLabel}
            valueText={t.verdict.valueText(verdict.score, severityLabel)}
            caption={t.verdict.outOf100}
            className="w-56 shrink-0 @2xl:w-52"
          />
          <div className="w-full min-w-0 text-left">
            <SeverityChip severity={verdict.severity} />
            <h2 id={`${idPrefix}-headline`} className="display mt-3 text-[1.7rem] text-fg @lg:text-[2.05rem]" data-testid="verdict-headline">
              {verdict.headline}
            </h2>
            {verdict.summary ? <p className="mt-2.5 text-[1.02rem] leading-relaxed text-muted">{verdict.summary}</p> : null}
            {learnable && categoryName ? (
              <Link
                to={`/learn/${learnable}`}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent underline-offset-4 hover:underline"
              >
                {t.verdict.readAbout(categoryName)}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            ) : null}
            {atLeast(verdict.severity, 'high') ? (
              <a
                href={config.official.helplineHref}
                className="mt-4 flex w-fit items-center gap-2 rounded-full bg-critical-bg px-4 py-2.5 text-sm font-bold text-on-critical shadow-[0_8px_20px_-10px_rgb(159_18_57/0.9)]"
                data-testid="quick-1930"
              >
                <PhoneCall aria-hidden="true" className="size-4" />
                {c.footer.lostMoney}
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <div className="divide-y divide-line">
        <div className="flex flex-wrap gap-2 px-5 py-4 @lg:px-7 no-print">
          <Button variant="secondary" size="sm" onClick={share} disabled={shareState === 'busy'} aria-describedby={`${idPrefix}-share-status`}>
            {shareState === 'busy' ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <Share2 aria-hidden="true" />}
            {t.actions.share}
          </Button>
          {speech.supported ? (
            <Button variant="secondary" size="sm" onClick={readAloud} aria-pressed={speech.speaking}>
              {speech.speaking ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
              {speech.speaking ? t.actions.stopReading : t.actions.readAloud}
            </Button>
          ) : null}
          {apiEnabled && onReport && reportables.length > 0 && atLeast(verdict.severity, 'low') ? (
            <Button variant="secondary" size="sm" onClick={onReport}>
              <Flag aria-hidden="true" />
              {t.actions.reportThis}
            </Button>
          ) : null}
          {showChromeAi ? (
            <Suspense fallback={null}>
              <ChromeAiTools verdict={verdict} />
            </Suspense>
          ) : null}
          <p id={`${idPrefix}-share-status`} role="status" className="w-full text-sm text-muted empty:hidden">
            {shareStatus}
          </p>
        </div>

        {hasMarks ? (
          <section className="px-5 py-5 @lg:px-7" aria-labelledby={`${idPrefix}-msg`}>
            <h3 id={`${idPrefix}-msg`} className="text-xs font-bold tracking-[0.12em] text-muted uppercase">
              {t.verdict.yourMessage}
            </h3>
            <p className="mt-1 text-sm text-subtle">{t.verdict.tapMark}</p>
            <div className="mt-3 max-h-[22rem] overflow-y-auto rounded-2xl border border-line bg-field p-4 text-[1.02rem] leading-[1.75]">
              <HighlightedText text={text} signals={verdict.signals} idPrefix={idPrefix} />
            </div>
          </section>
        ) : null}

        <section className="px-5 py-5 @lg:px-7" aria-label={t.verdict.redFlags}>
          {verdict.signals.length > 0 ? (
            <SignalList signals={verdict.signals} idPrefix={idPrefix} />
          ) : (
            <p className="rounded-2xl bg-safe-tint p-4 text-[0.98rem] leading-relaxed text-fg">{t.verdict.noFlags}</p>
          )}
        </section>

        {hasEntities(verdict) ? (
          <section className="px-5 py-5 @lg:px-7" aria-labelledby={`${idPrefix}-found`}>
            <h3 id={`${idPrefix}-found`} className="mb-3 text-xs font-bold tracking-[0.12em] text-muted uppercase">
              {t.verdict.found}
            </h3>
            <EntityList entities={verdict.entities} community={community} />
          </section>
        ) : null}

        {verdict.advice.length > 0 || atLeast(verdict.severity, 'medium') ? (
          <section className="px-5 py-5 @lg:px-7" aria-labelledby={`${idPrefix}-todo`}>
            <h3 id={`${idPrefix}-todo`} className="mb-3 text-xs font-bold tracking-[0.12em] text-muted uppercase">
              {t.verdict.whatToDo}
            </h3>
            <AdviceList advice={verdict.advice} severity={verdict.severity} />
          </section>
        ) : null}

        <footer className="px-5 py-4 text-xs leading-relaxed text-subtle @lg:px-7">{t.verdict.engineNote(verdict.engineVersion)}</footer>
      </div>
    </article>
  );
}

function hasEntities(v: Verdict) {
  const e = v.entities;
  return e.urls.length + e.upiIds.length + e.upiRequests.length + e.phones.length + e.emails.length + e.amounts.length > 0;
}

/** Oversized pause bars in the corner of the verdict header: the brand, quietly. */
function PauseBarsWatermark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 60" className="pointer-events-none absolute -top-3 right-3 h-36 w-24 text-fg opacity-[0.045]">
      <rect x="0" y="0" width="14" height="60" rx="7" fill="currentColor" />
      <rect x="24" y="0" width="14" height="60" rx="7" fill="currentColor" />
    </svg>
  );
}
