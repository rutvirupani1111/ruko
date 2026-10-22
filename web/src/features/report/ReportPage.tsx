import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import {
  ArrowRight,
  AtSign,
  CircleAlert,
  CircleCheck,
  ExternalLink,
  Fingerprint,
  Info,
  Link2,
  Lock,
  PhoneCall,
  Phone,
  Puzzle,
  RotateCcw,
  Send,
  ShieldCheck,
  WifiOff,
} from 'lucide-react';
import { CATEGORIES, type ScamCategory } from '@ruko/engine';
import { Mark } from '@/components/brand/Mark';
import { Button, ButtonLink, ButtonRouterLink } from '@/components/ui/Button';
import { apiEnabled, config } from '@/config';
import { CATEGORY_ORDER } from '@/data/categories';
import { common } from '@/i18n/common';
import { bcp47, formatNumber, useLocale, useT } from '@/i18n/core';
import { cn } from '@/lib/cn';
import { COMMUNITY_THRESHOLD, POW_DIFFICULTY, submitReport, type ReportError } from '@/lib/community';
import { powProgress } from '@/lib/pow';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { useOnline } from '@/lib/useOnline';
import { prepareReport, readHandoff, REPORT_TABS, tabForKind, type ReportTab } from './prepare';
import { reportStrings } from './strings';

const TAB_ICONS = { upi: AtSign, phone: Phone, link: Link2 } as const;
const VALID_CATEGORIES: readonly string[] = [...CATEGORY_ORDER, 'other'];

type Stage = 'hashing' | 'working' | 'sending';

export default function ReportPage() {
  const t = useT(reportStrings);
  useDocumentTitle(t.title);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-20 sm:px-6 sm:pt-10 lg:px-8">
      <header className="max-w-3xl">
        <p className="text-sm font-bold tracking-[0.16em] text-brand uppercase">{t.eyebrow}</p>
        <h1 className="display mt-3 text-[2.5rem] sm:text-6xl">{t.heading}</h1>
        <p className="mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-muted">{t.intro}</p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-safe-tint px-3 py-1.5 text-sm font-semibold text-safe">
          <Lock aria-hidden="true" className="size-4 shrink-0" />
          {t.privacyBadge}
        </p>
      </header>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
        {apiEnabled ? <ReportCard /> : <DisabledCard />}
        <aside className="space-y-4">
          <HowItWorks />
          <OfficialPanel />
        </aside>
      </div>
    </div>
  );
}

function ReportCard() {
  const t = useT(reportStrings);
  const c = useT(common);
  const { locale } = useLocale();
  const online = useOnline();
  const location = useLocation();
  const id = useId().replace(/:/g, '');
  const handoff = useMemo(() => readHandoff(location.state), [location.state]);
  const first = handoff.items[0];

  const [tab, setTab] = useState<ReportTab>(() => (first ? (tabForKind(first.kind) ?? 'upi') : 'upi'));
  const [value, setValue] = useState(() => first?.display ?? '');
  const [category, setCategory] = useState(() => (handoff.category && VALID_CATEGORIES.includes(handoff.category) ? handoff.category : ''));
  const [touched, setTouched] = useState(false);
  const [phase, setPhase] = useState<'form' | 'working' | 'done'>('form');
  const [stage, setStage] = useState<Stage>('hashing');
  const [tries, setTries] = useState(0);
  const [submitError, setSubmitError] = useState<ReportError | null>(null);
  const [reports, setReports] = useState<number | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const statusRef = useRef<HTMLHeadingElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  const prepared = useMemo(() => prepareReport(tab, value), [tab, value]);
  const categories = useMemo(
    () =>
      CATEGORY_ORDER.map((cid) => CATEGORIES[cid])
        .filter(Boolean)
        .map((info) => ({ id: info.id, name: locale === 'hi' ? info.nameHi : info.name, short: locale === 'hi' ? info.shortHi : info.short })),
    [locale],
  );
  const selected = categories.find((x) => x.id === category);

  useEffect(() => () => abortRef.current?.abort(), []);
  useEffect(() => {
    if (phase !== 'form') window.requestAnimationFrame(() => statusRef.current?.focus());
  }, [phase]);
  useEffect(() => {
    if (submitError) alertRef.current?.focus();
  }, [submitError]);

  const valueError = touched && !prepared.ok ? prepared : null;
  const categoryError = touched && !category;

  const choose = (nextTab: ReportTab, nextValue?: string) => {
    setTab(nextTab);
    if (nextValue !== undefined) setValue(nextValue);
    setSubmitError(null);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    setSubmitError(null);
    if (!prepared.ok) {
      inputRef.current?.focus();
      return;
    }
    if (!category) {
      categoryRef.current?.focus();
      return;
    }
    if (!online) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setStage('hashing');
    setTries(0);
    setPhase('working');
    try {
      const result = await submitReport(
        prepared.kind,
        prepared.value,
        category as ScamCategory,
        (s, n) => {
          setStage(s);
          if (typeof n === 'number') setTries(n);
        },
        controller.signal,
      );
      if (result.ok) {
        setReports(result.reports);
        setPhase('done');
      } else {
        setSubmitError(result.error ?? 'server');
        setPhase('form');
      }
    } catch (err) {
      setPhase('form');
      if ((err as DOMException)?.name !== 'AbortError') setSubmitError('network');
    } finally {
      abortRef.current = null;
    }
  };

  const cancel = () => {
    abortRef.current?.abort();
    setPhase('form');
  };

  const reset = () => {
    setValue('');
    setCategory('');
    setTouched(false);
    setSubmitError(null);
    setReports(undefined);
    setPhase('form');
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  if (phase === 'working') {
    const progress = stage === 'hashing' ? 0.03 : stage === 'sending' ? 0.98 : 0.05 + 0.92 * powProgress(tries, POW_DIFFICULTY);
    const percent = new Intl.NumberFormat(bcp47(locale), { style: 'percent', maximumFractionDigits: 0 }).format(progress);
    return (
      <Card>
        <div role="status" aria-live="polite" data-testid="report-working" data-stage={stage}>
          <div className="flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-tint">
              <Mark size={34} animate />
            </span>
            <h2 ref={statusRef} tabIndex={-1} className="display text-2xl outline-none sm:text-3xl">
              {t.working.title}
            </h2>
          </div>
          <ol className="mt-6 space-y-3">
            {(['hashing', 'working', 'sending'] as const).map((s, i) => {
              const order = ['hashing', 'working', 'sending'].indexOf(stage);
              const state = i < order ? 'done' : i === order ? 'active' : 'todo';
              const Icon = s === 'hashing' ? Fingerprint : s === 'working' ? Puzzle : Send;
              return (
                <li key={s} className={cn('flex items-start gap-3', state === 'todo' && 'opacity-55')}>
                  <span
                    className={cn(
                      'grid size-8 shrink-0 place-items-center rounded-full',
                      state === 'done' ? 'bg-safe-bg text-ink' : state === 'active' ? 'bg-brand-bg text-on-brand' : 'bg-surface-2 text-muted',
                    )}
                  >
                    {state === 'done' ? <CircleCheck aria-hidden="true" className="size-4" /> : <Icon aria-hidden="true" className="size-4" />}
                  </span>
                  <span className={cn('pt-1 leading-snug', state === 'active' ? 'font-semibold text-fg' : 'text-muted')}>{t.working[s]}</span>
                </li>
              );
            })}
          </ol>
          <div className="mt-6">
            <div
              role="progressbar"
              aria-label={t.working[stage]}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
              className="h-3 overflow-hidden rounded-full bg-line"
              data-testid="report-progress"
            >
              <div className="h-full rounded-full bg-brand-bg transition-[width] duration-300 ease-out" style={{ width: `${progress * 100}%` }} />
            </div>
            <p className="num mt-2 text-sm font-semibold text-muted">{t.working.percent(percent)}</p>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">{t.working.explain}</p>
          <Button variant="ghost" size="md" className="mt-4 -ml-2" onClick={cancel}>
            {c.actions.cancel}
          </Button>
        </div>
      </Card>
    );
  }

  if (phase === 'done') {
    const many = typeof reports === 'number' && reports >= COMMUNITY_THRESHOLD;
    return (
      <Card>
        <div data-testid="report-success" className="enter">
          <span className="grid size-14 place-items-center rounded-2xl bg-safe-tint">
            <CircleCheck aria-hidden="true" className="size-8 text-safe" />
          </span>
          <h2 ref={statusRef} tabIndex={-1} className="display mt-5 text-3xl outline-none sm:text-4xl">
            {t.done.title}
          </h2>
          <p className="mt-3 text-[1.05rem] leading-relaxed text-muted">{many ? t.done.many(formatNumber(reports ?? 0, locale)) : t.done.few}</p>
          <p className="mt-4 flex items-start gap-2 rounded-2xl bg-surface-2 p-3 text-sm leading-relaxed text-muted">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {t.notVerified}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="primary" size="lg" onClick={reset}>
              <RotateCcw aria-hidden="true" />
              {t.done.again}
            </Button>
            <ButtonRouterLink to="/" variant="secondary" size="lg">
              <ShieldCheck aria-hidden="true" />
              {t.done.check}
            </ButtonRouterLink>
          </div>
        </div>
      </Card>
    );
  }

  const hintId = `${id}-value-hint`;
  const kinds = t.kinds[tab];

  return (
    <Card>
      <form noValidate onSubmit={(e) => void onSubmit(e)} className="space-y-6" data-testid="report-form">
        {handoff.items.length > 0 ? (
          <div data-testid="report-handoff">
            <p className="text-sm font-semibold text-fg">{t.fromCheck}</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {handoff.items.map((item) => {
                const itemTab = tabForKind(item.kind)!;
                const active = tab === itemTab && value === item.display;
                const Icon = TAB_ICONS[itemTab];
                return (
                  <li key={`${item.kind}:${item.value}`} className="min-w-0 max-w-full">
                    <button
                      type="button"
                      onClick={() => choose(itemTab, item.display)}
                      aria-pressed={active}
                      className={cn(
                        'inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors',
                        active ? 'border-fg bg-fg text-bg' : 'border-line-strong bg-surface text-fg hover:border-fg/50',
                      )}
                    >
                      <Icon aria-hidden="true" className="size-4 shrink-0" />
                      <span className="truncate">{item.display}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-fg">{t.kindLegend}</legend>
          <div className="grid grid-cols-3 gap-1 rounded-2xl border border-line-strong bg-surface-2 p-1">
            {REPORT_TABS.map((option) => {
              const Icon = TAB_ICONS[option];
              const active = tab === option;
              return (
                <label
                  key={option}
                  className={cn(
                    'flex min-h-12 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-2 text-sm font-bold transition-colors duration-150 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-[var(--focus)]',
                    active ? 'bg-fg text-bg shadow-card' : 'text-muted hover:text-fg',
                  )}
                >
                  <input
                    type="radio"
                    name={`${id}-kind`}
                    value={option}
                    checked={active}
                    onChange={() => choose(option)}
                    className="sr-only"
                    data-testid={`report-kind-${option}`}
                  />
                  <Icon aria-hidden="true" className="size-4 shrink-0" />
                  <span>{t.kinds[option].tab}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label htmlFor={`${id}-value`} className="mb-1.5 block text-sm font-semibold text-fg">
            {kinds.label}
          </label>
          <input
            ref={inputRef}
            id={`${id}-value`}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setSubmitError(null);
            }}
            onBlur={() => value.trim() && setTouched(true)}
            placeholder={kinds.placeholder}
            inputMode={tab === 'phone' ? 'tel' : tab === 'upi' ? 'email' : 'url'}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={valueError ? true : undefined}
            aria-describedby={hintId}
            className={cn(inputClass, 'h-13 text-base', valueError && 'border-danger')}
            data-testid="report-value"
          />
          <div id={hintId} aria-live="polite" className="mt-2">
            {prepared.ok ? (
              <div className="rounded-xl bg-surface-2 px-3 py-2.5" data-testid="report-preview">
                <p className="text-xs font-semibold tracking-wide text-subtle uppercase">{t.willReport}</p>
                <p className="mt-0.5 font-semibold break-all text-fg">
                  {prepared.display}
                  {prepared.app ? <span className="font-normal text-muted"> · {prepared.app}</span> : null}
                </p>
                {prepared.scope ? (
                  <p className="mt-0.5 text-sm text-muted">{prepared.scope === 'site' ? t.willReportSite : t.willReportLink}</p>
                ) : null}
              </div>
            ) : valueError ? (
              <div className="flex items-start gap-2 text-sm leading-relaxed text-danger" data-testid="report-value-error">
                <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <div>
                  <p>
                    {valueError.reason === 'official'
                      ? tab === 'phone'
                        ? t.errors.officialPhone(valueError.host ?? '')
                        : t.errors.officialSite(valueError.host ?? '')
                      : valueError.suggest
                        ? t.errors.looksLike[valueError.suggest]
                        : t.errors[valueError.reason][tab]}
                  </p>
                  {valueError.suggest ? (
                    <button
                      type="button"
                      onClick={() => choose(valueError.suggest!)}
                      className="mt-1 font-semibold text-accent underline underline-offset-4"
                    >
                      {t.errors.switchTo[valueError.suggest]}
                    </button>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-subtle">{kinds.hint}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor={`${id}-category`} className="mb-1.5 block text-sm font-semibold text-fg">
            {t.categoryLabel}
          </label>
          <div className="relative">
            <select
              ref={categoryRef}
              id={`${id}-category`}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-invalid={categoryError ? true : undefined}
              aria-describedby={`${id}-category-hint`}
              className={cn(inputClass, 'h-13 appearance-none pr-10 text-base', categoryError && 'border-danger', !category && 'text-subtle')}
              data-testid="report-category"
            >
              <option value="">{t.categoryPlaceholder}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
              <option value="other">{t.categoryOther}</option>
            </select>
            <svg aria-hidden="true" viewBox="0 0 20 20" className="pointer-events-none absolute top-1/2 right-3.5 size-5 -translate-y-1/2 text-muted">
              <path d="M5.5 7.5 10 12l4.5-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p
            id={`${id}-category-hint`}
            className={cn('mt-2 text-sm leading-relaxed', categoryError ? 'text-danger' : 'text-subtle')}
            aria-live="polite"
          >
            {categoryError ? t.categoryRequired : category === 'other' ? t.categoryOtherHint : (selected?.short ?? '')}
          </p>
        </div>

        {submitError ? (
          <div
            ref={alertRef}
            tabIndex={-1}
            role="alert"
            className={cn(
              'flex items-start gap-3 rounded-2xl p-4 text-sm leading-relaxed outline-none',
              submitError === 'duplicate' ? 'bg-accent-tint text-fg' : 'bg-danger-tint text-fg',
            )}
            data-testid="report-error"
            data-error={submitError}
          >
            {submitError === 'duplicate' ? (
              <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-accent" />
            ) : (
              <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-danger" />
            )}
            <p>{t.errorsSubmit[submitError]}</p>
          </div>
        ) : null}

        {!online ? (
          <p className="flex items-start gap-2 rounded-2xl bg-caution-tint p-3 text-sm leading-relaxed text-fg" role="status">
            <WifiOff aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-caution" />
            {t.offline}
          </p>
        ) : null}

        <div>
          <Button type="submit" variant="primary" size="lg" block disabled={!online} data-testid="report-submit">
            <Send aria-hidden="true" />
            {submitError && submitError !== 'duplicate' ? c.actions.tryAgain : t.submit}
          </Button>
          <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-subtle" data-testid="report-not-verified">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {t.notVerified}
          </p>
        </div>
      </form>
    </Card>
  );
}

const inputClass =
  'block w-full rounded-xl border border-line-strong bg-field px-3.5 text-fg outline-none transition-[border-color,box-shadow] placeholder:text-subtle focus:border-brand-bg focus:shadow-[0_0_0_3px_rgb(255_122_26/0.18)]';

function Card({ children }: { children: ReactNode }) {
  return <section className="min-w-0 rounded-[1.6rem] border border-line bg-surface p-5 shadow-card sm:p-7">{children}</section>;
}

function DisabledCard() {
  const t = useT(reportStrings);
  const c = useT(common);
  return (
    <Card>
      <div data-testid="report-disabled">
        <span className="grid size-12 place-items-center rounded-2xl bg-surface-2">
          <Info aria-hidden="true" className="size-6 text-muted" />
        </span>
        <h2 className="display mt-4 text-3xl">{t.disabled.title}</h2>
        <p className="mt-3 leading-relaxed text-muted">{t.disabled.body}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href={config.official.cybercrime} variant="primary" size="lg" external newTabLabel={c.actions.opensNewTab}>
            {c.actions.reportCyber}
            <ExternalLink aria-hidden="true" className="opacity-70" />
          </ButtonLink>
          <ButtonLink href={config.official.chakshu} variant="secondary" size="lg" external newTabLabel={c.actions.opensNewTab}>
            {c.actions.chakshu}
            <ExternalLink aria-hidden="true" className="opacity-70" />
          </ButtonLink>
        </div>
      </div>
    </Card>
  );
}

function HowItWorks() {
  const t = useT(reportStrings);
  const icons = [Fingerprint, Puzzle, ShieldCheck];
  return (
    <section aria-labelledby="report-how" className="rounded-[1.4rem] bg-accent-tint p-5">
      <h2 id="report-how" className="font-display text-xl font-bold">
        {t.how.title}
      </h2>
      <ol className="mt-4 space-y-4">
        {t.how.steps.map((step, i) => {
          const Icon = icons[i] ?? ShieldCheck;
          return (
            <li key={i} className="flex gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface text-accent shadow-card">
                <Icon aria-hidden="true" className="size-[1.1rem]" />
              </span>
              <p className="pt-1 text-[0.95rem] leading-relaxed text-fg">{step}</p>
            </li>
          );
        })}
      </ol>
      <Link to="/privacy" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent underline-offset-4 hover:underline">
        {t.how.privacyLink}
        <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </section>
  );
}

function OfficialPanel() {
  const t = useT(reportStrings);
  const c = useT(common);
  return (
    <section aria-labelledby="report-official" className="rounded-[1.4rem] border border-critical/30 bg-surface p-5">
      <h2 id="report-official" className="font-display text-xl font-bold">
        {t.official.title}
      </h2>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{t.official.body}</p>
      <div className="mt-4 flex flex-col gap-2.5">
        <ButtonLink href={config.official.helplineHref} variant="critical" size="md" block>
          <PhoneCall aria-hidden="true" />
          {c.actions.call1930}
        </ButtonLink>
        <ButtonLink href={config.official.cybercrime} variant="secondary" size="md" block external newTabLabel={c.actions.opensNewTab}>
          {c.actions.reportCyber}
          <ExternalLink aria-hidden="true" className="opacity-70" />
        </ButtonLink>
        <ButtonLink href={config.official.chakshu} variant="secondary" size="md" block external newTabLabel={c.actions.opensNewTab}>
          {c.actions.chakshu}
          <ExternalLink aria-hidden="true" className="opacity-70" />
        </ButtonLink>
      </div>
    </section>
  );
}
