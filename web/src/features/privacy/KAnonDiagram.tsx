import './privacy.css';
import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { CircleCheck, Pause, Play, Server, Smartphone } from 'lucide-react';
import { analyzeUrl, detectInputKind, normalizeIdentifier, sha256HexSync, type IdentifierKind } from '@ruko/engine';
import { formatNumber, useLocale, useT } from '@/i18n/core';
import { cn } from '@/lib/cn';
import { linkReportable, PREFIX_LENGTH } from '@/lib/community';
import { privacyStrings } from './strings';

/** Illustration only: an obviously made-up ID. */
const DEMO_ID = 'fake.kyc.desk@ybl';
const DEMO_HASH = sha256HexSync(`upi:${normalizeIdentifier('upi', DEMO_ID)}`);
const PREFIX = DEMO_HASH.slice(0, PREFIX_LENGTH);
const SUFFIX = DEMO_HASH.slice(PREFIX_LENGTH);
const MATCH_REPORTS = 23;
/** A made-up bucket: other reported fingerprints with the same first 5 characters, plus ours. */
const BUCKET = [
  { suffix: sha256HexSync('ruko-demo-bucket:1').slice(PREFIX_LENGTH), reports: 4, match: false },
  { suffix: sha256HexSync('ruko-demo-bucket:2').slice(PREFIX_LENGTH), reports: 41, match: false },
  { suffix: SUFFIX, reports: MATCH_REPORTS, match: true },
  { suffix: sha256HexSync('ruko-demo-bucket:3').slice(PREFIX_LENGTH), reports: 7, match: false },
];
const STEP_MS = 3800;
const STEP_KEYS = ['hash', 'send', 'bucket', 'match'] as const;

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Animated walk-through of a k-anonymity range lookup, with step controls. */
export function KAnonDiagram() {
  const t = useT(privacyStrings).diagram;
  const { locale } = useLocale();
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setStep((s) => (s + 1) % 4), STEP_MS);
    return () => window.clearInterval(timer);
  }, [playing]);

  const current = t.steps[STEP_KEYS[step]!];

  return (
    <div className="rounded-[1.6rem] border border-line bg-surface p-4 shadow-card sm:p-6" data-testid="kanon-diagram" data-step={step}>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_8.5rem_minmax(0,1fr)]">
        <Panel title={t.phone} icon={<Smartphone aria-hidden="true" className="size-4" />} active={step === 0 || step === 3}>
          <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-subtle uppercase">
            {t.youCheck}
            <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[0.7rem] tracking-normal normal-case">{t.example}</span>
          </p>
          <p className="mt-1 font-mono text-[0.95rem] font-semibold break-all">{DEMO_ID}</p>
          <p className="mt-3 text-xs font-semibold tracking-wide text-subtle uppercase">{t.fingerprint}</p>
          <p className="mt-1 font-mono text-[0.78rem] leading-relaxed break-all" data-testid="kanon-hash">
            {step >= 1 ? <mark className="hl font-bold">{PREFIX}</mark> : <span className="font-bold">{PREFIX}</span>}
            <span className="text-muted">{SUFFIX}</span>
          </p>
          {step === 3 ? (
            <div className="kanon-row mt-3 rounded-xl border border-danger/30 bg-danger-tint p-3">
              <ul className="space-y-1">
                {BUCKET.map((row, i) => (
                  <li
                    key={i}
                    className={cn('flex items-center gap-1.5 font-mono text-[0.75rem]', row.match ? 'font-bold text-fg' : 'text-muted')}
                  >
                    {row.match ? (
                      <CircleCheck aria-hidden="true" className="size-3.5 shrink-0 text-danger" />
                    ) : (
                      <span className="size-3.5 shrink-0" />
                    )}
                    <span className="truncate">
                      {PREFIX}
                      {row.match ? <mark className="hl hl-danger">{row.suffix.slice(0, 8)}</mark> : row.suffix.slice(0, 8)}…
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 font-semibold text-danger">{t.match}</p>
              <p className="text-sm text-fg">{t.matchBody(formatNumber(MATCH_REPORTS, locale))}</p>
            </div>
          ) : null}
        </Panel>

        <div className="kanon-channel" aria-hidden="true">
          <div className="kanon-line" />
          {step === 1 ? (
            <span
              key="out"
              data-dir="out"
              className="kanon-packet rounded-full bg-brand-bg px-3 py-1.5 font-mono text-sm font-bold text-on-brand shadow-lift"
            >
              {PREFIX}
            </span>
          ) : null}
          {step === 2 ? (
            <span
              key="back"
              data-dir="back"
              className="kanon-packet rounded-full bg-accent-bg px-3 py-1.5 text-sm font-bold text-on-accent shadow-lift"
            >
              {t.bucket} {PREFIX}
            </span>
          ) : null}
        </div>

        <Panel title={t.server} icon={<Server aria-hidden="true" className="size-4" />} active={step === 1 || step === 2}>
          {step === 0 ? (
            <p className="text-sm text-subtle">{t.waiting}</p>
          ) : (
            <>
              <p className="text-xs font-semibold tracking-wide text-subtle uppercase">{t.received}</p>
              <p className="mt-1">
                <span className="rounded-lg bg-brand-tint px-2 py-0.5 font-mono text-lg font-bold text-brand" data-testid="kanon-prefix">
                  {PREFIX}
                </span>
              </p>
              <p className="mt-1.5 text-sm text-muted">{t.onlyThis}</p>
              {step >= 2 ? (
                <div className="mt-3">
                  <p className="text-xs font-semibold tracking-wide text-subtle uppercase">
                    {t.bucket} <span className="font-mono normal-case">{PREFIX}…</span>
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {BUCKET.map((row, i) => (
                      <li
                        key={i}
                        className="kanon-row flex items-center justify-between gap-2 rounded-lg bg-surface-2 px-2 py-1 font-mono text-[0.75rem]"
                        style={{ ['--i' as string]: i }}
                      >
                        <span className="truncate">
                          {PREFIX}
                          <span className="text-muted">{row.suffix.slice(0, 8)}…</span>
                        </span>
                        <span className="num shrink-0 font-sans text-muted">{t.reports(formatNumber(row.reports, locale))}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-1.5 text-xs leading-relaxed text-subtle">{t.bucketNote}</p>
                </div>
              ) : null}
            </>
          )}
        </Panel>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-pressed={playing}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-surface-2 px-4 text-sm font-semibold text-fg transition-colors hover:bg-line"
        >
          {playing ? <Pause aria-hidden="true" className="size-4" /> : <Play aria-hidden="true" className="size-4" />}
          {playing ? t.pause : t.play}
        </button>
        <ol className="flex flex-wrap gap-1.5">
          {STEP_KEYS.map((key, i) => {
            const s = t.steps[key];
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => {
                    setStep(i);
                    setPlaying(false);
                  }}
                  aria-current={i === step ? 'step' : undefined}
                  aria-label={`${t.stepLabel(i + 1)}: ${s.short}`}
                  className={cn(
                    'num inline-flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-full border px-3 text-sm font-bold transition-colors',
                    i === step ? 'border-fg bg-fg text-bg' : 'border-line-strong text-muted hover:border-fg/50 hover:text-fg',
                  )}
                  data-testid={`kanon-step-${i + 1}`}
                >
                  {i + 1}
                  <span aria-hidden="true" className="hidden font-semibold sm:inline">
                    {s.short}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <div aria-live="polite" className="mt-4 min-h-[6.5rem] sm:min-h-[5rem]">
        <h3 className="font-display text-xl font-bold">{current.title}</h3>
        <p className="mt-1 leading-relaxed text-muted">{current.body}</p>
      </div>
    </div>
  );
}

function Panel({ title, icon, active, children }: { title: string; icon: ReactNode; active: boolean; children: ReactNode }) {
  return (
    <div
      className={cn(
        'min-w-0 rounded-2xl border p-4 transition-[border-color,box-shadow] duration-300 lg:min-h-[17rem]',
        active ? 'border-brand-bg/60 bg-bg shadow-[0_0_0_3px_rgb(255_122_26/0.14)]' : 'border-line bg-bg',
      )}
    >
      <p className="mb-3 flex items-center gap-2 font-display text-base font-bold">
        <span className="grid size-7 place-items-center rounded-full bg-surface-2">{icon}</span>
        {title}
      </p>
      {children}
    </div>
  );
}

/** Fingerprint of whatever the person types, computed the same way as real lookups. */
function fingerprintFor(input: string): string | null {
  const text = input.trim();
  if (!text) return null;
  const detected = detectInputKind(text);
  let kind: IdentifierKind;
  let value = text;
  if (detected === 'upi' || detected === 'phone' || detected === 'email') kind = detected;
  else if (detected === 'url') {
    const link = linkReportable(analyzeUrl(text));
    if (!link) return null;
    kind = link.kind;
    value = link.value;
  } else return null;
  return sha256HexSync(`${kind}:${normalizeIdentifier(kind, value)}`);
}

export function TryFingerprint() {
  const t = useT(privacyStrings).tryIt;
  const id = useId().replace(/:/g, '');
  const [value, setValue] = useState('');
  const hash = useMemo(() => fingerprintFor(value), [value]);
  return (
    <div className="rounded-[1.4rem] border border-dashed border-line-strong p-4 sm:p-5">
      <label htmlFor={`${id}-try`} className="block font-semibold">
        {t.label}
      </label>
      <input
        id={`${id}-try`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t.placeholder}
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        className="mt-2 block h-12 w-full rounded-xl border border-line-strong bg-field px-3.5 text-base text-fg outline-none transition-[border-color,box-shadow] placeholder:text-subtle focus:border-brand-bg focus:shadow-[0_0_0_3px_rgb(255_122_26/0.18)]"
        data-testid="try-fingerprint"
      />
      <div aria-live="polite" className="mt-3 min-h-[4.5rem]">
        {hash ? (
          <>
            <p className="font-mono text-[0.78rem] leading-relaxed break-all text-muted">
              <mark className="hl font-bold text-fg">{hash.slice(0, PREFIX_LENGTH)}</mark>
              {hash.slice(PREFIX_LENGTH)}
            </p>
            <p className="mt-2 text-sm">
              {t.wouldSend}{' '}
              <span className="rounded-md bg-brand-tint px-1.5 py-0.5 font-mono font-bold text-brand" data-testid="try-prefix">
                {hash.slice(0, PREFIX_LENGTH)}
              </span>
            </p>
          </>
        ) : (
          <p className="text-sm text-subtle">{value.trim() ? t.notAnId : t.note}</p>
        )}
      </div>
    </div>
  );
}
