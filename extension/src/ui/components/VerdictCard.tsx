import type { Severity, Verdict } from '@ruko/engine';
import { CircleCheck, TriangleAlert } from 'lucide-react';
import { useEffect, useId, useState, type ReactNode } from 'react';
import { useI18n } from '../i18n';
import { prefersReducedMotion } from '../theme';
import { AdviceList } from './AdviceList';
import { SeverityChip } from './Chips';
import { EntityList } from './EntityList';
import { HighlightedText } from './HighlightedText';
import { Mark } from './Mark';
import { RiskMeter } from './RiskMeter';

const HEADER_TINT: Record<Severity, string> = {
  safe: 'from-safe/14',
  low: 'from-indigo/12',
  medium: 'from-caution/22',
  high: 'from-danger/16',
  critical: 'from-critical/22',
};

/**
 * Full verdict per the design system: animated risk meter, severity chip, headline,
 * summary, the user's text with highlighted red flags, signals, entities with their
 * own mini verdicts, and advice with big action buttons.
 */
export function VerdictCard({
  verdict,
  text,
  compact = false,
  children,
}: {
  verdict: Verdict;
  /** The analysed input. When given, red-flag phrases are highlighted in it. */
  text?: string;
  /** Popup mode: header, summary and top signals only. */
  compact?: boolean;
  /** Extra sections (AI explanation, community reports). */
  children?: ReactNode;
}) {
  const { t, ti } = useI18n();
  const headingId = useId();
  const [active, setActive] = useState<string | null>(null);
  const warnings = verdict.signals.filter((s) => s.weight > 0);
  const reassuring = verdict.signals.filter((s) => s.weight < 0);
  const hasSpans = !!text && warnings.some((s) => s.spans?.length);

  useEffect(() => setActive(null), [verdict]);

  const select = (id: string) => {
    setActive(id);
    const el = document.getElementById(`signal-${id}`);
    el?.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    el?.focus({ preventScroll: true });
  };

  return (
    <article
      className="rk-card animate-rise overflow-hidden"
      aria-labelledby={headingId}
      data-testid="verdict-card"
      data-severity={verdict.severity}
    >
      <header className={`flex items-center gap-4 bg-gradient-to-b ${HEADER_TINT[verdict.severity]} to-transparent px-4 pt-4 pb-2`}>
        <RiskMeter score={verdict.score} label={t('riskLabel', { score: verdict.score })} size={compact ? 104 : 128} />
        <div className="min-w-0 flex-1">
          <SeverityChip severity={verdict.severity} />
          <h2 id={headingId} className={`rk-display mt-1.5 font-extrabold leading-tight ${compact ? 'text-[17px]' : 'text-[21px]'}`}>
            {verdict.headline}
          </h2>
        </div>
      </header>

      {verdict.summary ? <p className="px-4 pt-1 text-[14.5px] leading-relaxed">{verdict.summary}</p> : null}

      {hasSpans && !compact ? (
        <section className="mx-4 mt-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-3.5" aria-label={t('analysedText')}>
          <h3 className="rk-eyebrow">{t('analysedText')}</h3>
          <div className="mt-1.5">
            <HighlightedText text={text ?? ''} signals={verdict.signals} severity={verdict.severity} activeId={active} onSelect={select} />
          </div>
          <p className="mt-2 text-[12px] text-[var(--muted)]">{t('analysedHint')}</p>
        </section>
      ) : null}

      <section className="px-4 pt-4" aria-labelledby={`${headingId}-signals`}>
        {warnings.length ? (
          <>
            <h3 id={`${headingId}-signals`} className="rk-eyebrow">
              {ti('warningSigns')}
            </h3>
            <ol className="mt-2 space-y-2">
              {(compact ? warnings.slice(0, 3) : warnings).map((signal) => (
                <li
                  key={signal.id}
                  id={`signal-${signal.id}`}
                  tabIndex={-1}
                  className={`flex gap-2.5 rounded-xl p-2 outline-none transition-colors ${active === signal.id ? 'bg-saffron/15 ring-2 ring-saffron/60' : ''}`}
                >
                  <TriangleAlert size={17} className="mt-0.5 shrink-0 text-[var(--danger-text)]" aria-hidden="true" />
                  <div>
                    <p className="text-[14.5px] font-semibold leading-snug">{signal.title}</p>
                    {signal.detail && !compact ? <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--muted)]">{signal.detail}</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <p id={`${headingId}-signals`} className="flex gap-2 text-[14px] leading-relaxed text-[var(--muted)]">
            <CircleCheck size={17} className="mt-0.5 shrink-0 text-[var(--safe-text)]" aria-hidden="true" />
            {t('noSignals')}
          </p>
        )}
        {reassuring.length && !compact ? (
          <>
            <h3 className="rk-eyebrow mt-4">{ti('reassuringSigns')}</h3>
            <ul className="mt-2 space-y-2">
              {reassuring.map((signal) => (
                <li key={signal.id} className="flex gap-2.5 p-2">
                  <CircleCheck size={17} className="mt-0.5 shrink-0 text-[var(--safe-text)]" aria-hidden="true" />
                  <div>
                    <p className="text-[14px] font-semibold leading-snug">{signal.title}</p>
                    {signal.detail ? <p className="mt-0.5 text-[13px] text-[var(--muted)]">{signal.detail}</p> : null}
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </section>

      {!compact ? <EntityList entities={verdict.entities} /> : null}
      {!compact ? <AdviceList advice={verdict.advice} severity={verdict.severity} /> : null}
      {children}

      <footer className="mt-4 flex items-center gap-2 border-t border-[var(--border)] px-4 py-3 text-[12px] text-[var(--muted)]">
        <Mark size={16} />
        <span>{t('checkedOnDevice')}</span>
      </footer>
    </article>
  );
}
