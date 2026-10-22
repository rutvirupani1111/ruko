import { CircleCheck } from 'lucide-react';
import type { Signal } from '@ruko/engine';
import { checkStrings } from '@/features/check/strings';
import { useT } from '@/i18n/core';
import { cn } from '@/lib/cn';
import { signalAnchor, toneForWeight } from './HighlightedText';

const toneBadge = {
  danger: 'bg-danger-bg text-white',
  caution: 'bg-caution-bg text-ink',
  brand: 'bg-brand-bg text-ink',
  safe: 'bg-safe-bg text-ink',
} as const;

export function SignalList({ signals, idPrefix }: { signals: Signal[]; idPrefix: string }) {
  const t = useT(checkStrings);
  const indexed = signals.map((signal, index) => ({ signal, index }));
  const flags = indexed.filter((x) => x.signal.weight > 0);
  const good = indexed.filter((x) => x.signal.weight < 0);

  return (
    <div className="space-y-6">
      {flags.length > 0 ? (
        <section aria-labelledby={`${idPrefix}-flags`}>
          <h3 id={`${idPrefix}-flags`} className="mb-3 text-xs font-bold tracking-[0.12em] text-muted uppercase">
            {t.verdict.redFlags} <span className="num">({flags.length})</span>
          </h3>
          <ol className="space-y-2.5">
            {flags.map(({ signal, index }, n) => {
              const id = signalAnchor(idPrefix, index);
              const tone = toneForWeight(signal.weight);
              // The most telling piece of evidence: the longest phrase, if it says something on its own.
              const quote = signal.spans
                .map((sp) => sp.text?.trim() ?? '')
                .sort((a, b) => b.length - a.length)[0];
              return (
                <li
                  key={`${signal.id}-${index}`}
                  id={id}
                  tabIndex={-1}
                  className="enter flex gap-3 rounded-2xl border border-line bg-surface p-3.5 outline-none"
                  style={{ ['--i' as string]: n }}
                  data-signal={signal.id}
                >
                  <span
                    aria-hidden="true"
                    className={cn('num mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-sm font-bold', toneBadge[tone])}
                  >
                    {n + 1}
                  </span>
                  <div className="min-w-0">
                    <p id={`${id}-title`} className="font-semibold leading-snug text-fg">
                      {signal.title}
                    </p>
                    <p className="mt-1 text-[0.95rem] leading-relaxed text-muted">{signal.detail}</p>
                    {quote && quote.length >= 4 ? (
                      <p className="mt-2 text-sm text-subtle">
                        <span className={cn('hl', `hl-${tone}`)} style={{ animation: 'none' }}>
                          “{quote.length > 80 ? `${quote.slice(0, 78)}…` : quote}”
                        </span>
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      {good.length > 0 ? (
        <section aria-labelledby={`${idPrefix}-good`}>
          <h3 id={`${idPrefix}-good`} className="mb-3 text-xs font-bold tracking-[0.12em] text-muted uppercase">
            {t.verdict.goodSigns}
          </h3>
          <ul className="space-y-2.5">
            {good.map(({ signal, index }) => {
              const id = signalAnchor(idPrefix, index);
              return (
                <li key={`${signal.id}-${index}`} id={id} tabIndex={-1} className="flex gap-3 rounded-2xl bg-safe-tint p-3.5 outline-none">
                  <CircleCheck aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-safe" strokeWidth={2.2} />
                  <div className="min-w-0">
                    <p id={`${id}-title`} className="font-semibold leading-snug text-fg">
                      {signal.title}
                    </p>
                    <p className="mt-1 text-[0.95rem] leading-relaxed text-muted">{signal.detail}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
