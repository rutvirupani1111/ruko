import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import {
  ArrowRight,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileText,
  HeartHandshake,
  Lock,
  PhoneCall,
  Plus,
  Printer,
  RotateCcw,
  ShieldCheck,
  X,
} from 'lucide-react';
import { CATEGORIES } from '@ruko/engine';
import { Button, ButtonLink, ButtonRouterLink } from '@/components/ui/Button';
import { config } from '@/config';
import { CATEGORY_ORDER } from '@/data/categories';
import { common } from '@/i18n/common';
import { LOCALE_NAMES, LOCALES, baseLocale, loadLocale, pick, useLocale, useT, type Locale } from '@/i18n/core';
import { cn } from '@/lib/cn';
import { PREF, readJson, writeJson } from '@/lib/storage';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { emptyComplaint, formatComplaint, type ComplaintData, type Transaction } from './complaint';
import { helpStrings } from './strings';

const STEP_IDS = ['stop', 'call', 'evidence', 'report', 'bank', 'passwords', 'apps', 'chakshu', 'ceir'] as const;
type StepId = (typeof STEP_IDS)[number];

const STEP_ACTIONS: Partial<Record<StepId, { href: string; external: boolean; critical?: boolean }>> = {
  call: { href: config.official.helplineHref, external: false, critical: true },
  report: { href: config.official.cybercrime, external: true },
  chakshu: { href: config.official.chakshu, external: true },
  ceir: { href: config.official.ceir, external: true },
};

export default function HelpPage() {
  const t = useT(helpStrings);
  const c = useT(common);
  useDocumentTitle(t.title);
  const [done, setDone] = useState<StepId[]>(() => readJson<StepId[]>(PREF.helpChecklist, []).filter((s) => STEP_IDS.includes(s)));

  const toggle = (id: StepId) => {
    setDone((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      writeJson(PREF.helpChecklist, next);
      return next;
    });
  };

  const reset = () => {
    setDone([]);
    writeJson(PREF.helpChecklist, []);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-20 sm:px-6 sm:pt-10 lg:px-8">
      <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end lg:gap-10">
        <div>
          <p className="text-sm font-bold tracking-[0.16em] text-critical uppercase">{t.eyebrow}</p>
          <h1 className="display mt-3 text-[2.5rem] sm:text-6xl">{t.heading}</h1>
          <p className="mt-4 max-w-2xl text-[1.1rem] leading-relaxed text-muted">{t.calm}</p>
        </div>
        <a
          href={config.official.helplineHref}
          className="group relative block overflow-hidden rounded-[1.6rem] bg-critical-bg p-6 text-on-critical shadow-lift transition-transform active:scale-[0.99]"
          data-testid="help-call-1930"
        >
          <span aria-hidden="true" className="absolute -right-6 -bottom-8 font-display text-[7.5rem] leading-none font-extrabold text-white/10">
            1930
          </span>
          <span className="relative flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-full bg-white/15 motion-safe:animate-[pulse-ring_1.6s_ease-out_infinite]">
              <PhoneCall aria-hidden="true" className="size-6" />
            </span>
            <span className="display text-3xl">{t.callNow}</span>
          </span>
          <span className="relative mt-3 block max-w-xs text-[0.95rem] leading-relaxed text-white/90">{t.callNowBody}</span>
        </a>
      </header>

      <section aria-labelledby="steps-title" className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="steps-title" className="sr-only">
            {t.eyebrow}
          </h2>
          <div className="w-full max-w-md">
            <p className="text-sm font-semibold text-muted" role="status" aria-live="polite" data-testid="help-progress">
              {t.progress(done.length, STEP_IDS.length)}
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-safe-bg transition-[width] duration-300 ease-out"
                style={{ width: `${(done.length / STEP_IDS.length) * 100}%` }}
              />
            </div>
          </div>
          {done.length ? (
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw aria-hidden="true" />
              {t.reset}
            </Button>
          ) : null}
        </div>
        <ol className="mt-6 grid gap-3 md:grid-cols-2">
          {STEP_IDS.map((id, i) => {
            const step = t.steps[id];
            const isDone = done.includes(id);
            const action = STEP_ACTIONS[id];
            const cta = 'cta' in step ? step.cta : undefined;
            return (
              <li
                key={id}
                className={cn(
                  'relative flex gap-4 rounded-[1.4rem] border p-5 transition-colors duration-200',
                  isDone ? 'border-safe/40 bg-safe-tint' : i < 2 ? 'border-critical/30 bg-surface shadow-card' : 'border-line bg-surface',
                )}
                data-step={id}
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isDone}
                  aria-label={`${t.stepLabel(i + 1)}: ${step.title}. ${isDone ? t.done : t.markDone}`}
                  onClick={() => toggle(id)}
                  className={cn(
                    'num grid size-10 shrink-0 place-items-center rounded-full border-2 text-base font-bold transition-colors duration-200',
                    isDone ? 'border-safe-bg bg-safe-bg text-ink' : 'border-line-strong bg-bg text-fg hover:border-fg',
                  )}
                >
                  {isDone ? <Check aria-hidden="true" className="size-5" strokeWidth={3} /> : i + 1}
                </button>
                <div className="min-w-0 flex-1">
                  <h3 className={cn('font-display text-xl font-bold leading-snug', isDone && 'text-muted line-through decoration-2')}>{step.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-muted">{step.body}</p>
                  {action && cta ? (
                    <ButtonLink
                      href={action.href}
                      variant={action.critical ? 'critical' : 'secondary'}
                      size="md"
                      className="mt-4"
                      external={action.external}
                      newTabLabel={c.actions.opensNewTab}
                    >
                      {action.critical ? <PhoneCall aria-hidden="true" /> : null}
                      {cta}
                      {action.external ? <ExternalLink aria-hidden="true" className="opacity-70" /> : null}
                    </ButtonLink>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 flex items-center gap-1.5 text-sm text-subtle">
          <Lock aria-hidden="true" className="size-3.5" />
          {t.savedLocally}
        </p>
      </section>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="flex gap-4 rounded-[1.4rem] bg-accent-tint p-5">
          <HeartHandshake aria-hidden="true" className="mt-0.5 size-7 shrink-0 text-accent" />
          <div>
            <h2 className="font-display text-xl font-bold">{t.talk.title}</h2>
            <p className="mt-1.5 leading-relaxed text-muted">{t.talk.body}</p>
            <ButtonLink href="tel:14416" variant="secondary" size="md" className="mt-4">
              <PhoneCall aria-hidden="true" />
              {t.talk.cta}
            </ButtonLink>
          </div>
        </div>
        <div className="flex gap-4 rounded-[1.4rem] border border-line bg-surface p-5">
          <ShieldCheck aria-hidden="true" className="mt-0.5 size-7 shrink-0 text-brand" />
          <div>
            <h2 className="font-display text-xl font-bold">{t.notSure}</h2>
            <p className="mt-1.5 leading-relaxed text-muted">{t.notSureBody}</p>
            <ButtonRouterLink to="/" variant="primary" size="md" className="mt-4">
              {t.checkCta}
              <ArrowRight aria-hidden="true" />
            </ButtonRouterLink>
          </div>
        </div>
      </div>

      <ComplaintGenerator />
    </div>
  );
}

function Field({ label, hint, children, id, className }: { label: string; hint?: string; children: ReactNode; id: string; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-fg">
        {label}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs leading-relaxed text-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const inputClass =
  'block w-full rounded-xl border border-line-strong bg-field px-3 text-[0.98rem] text-fg outline-none transition-[border-color,box-shadow] placeholder:text-subtle focus:border-brand-bg focus:shadow-[0_0_0_3px_rgb(255_122_26/0.18)]';

const CONTACT_KEYS = ['call', 'sms', 'whatsapp', 'email', 'web', 'social', 'other'] as const;
const PAYMENT_KEYS = ['upi', 'debit', 'credit', 'netbanking', 'wallet', 'other'] as const;

interface FormState {
  lang: Locale;
  name: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  category: string;
  contact: string;
  incidentAt: string;
  description: string;
  amount: string;
  payment: string;
  transactions: Transaction[];
  suspects: string;
  called1930: boolean;
  ack1930: string;
  reportedOnline: boolean;
  ackOnline: string;
  informedBank: boolean;
  bankRef: string;
}

const blankTx = (): Transaction => ({ at: '', amount: '', reference: '', from: '', to: '' });

function initialForm(lang: Locale): FormState {
  const base = emptyComplaint(lang);
  return {
    lang,
    name: base.name,
    mobile: base.mobile,
    email: base.email,
    address: base.address,
    city: base.city,
    state: base.state,
    category: '',
    contact: '',
    incidentAt: '',
    description: '',
    amount: '',
    payment: '',
    transactions: [blankTx()],
    suspects: '',
    called1930: false,
    ack1930: '',
    reportedOnline: false,
    ackOnline: '',
    informedBank: false,
    bankRef: '',
  };
}

function ComplaintGenerator() {
  const { locale } = useLocale();
  const ui = useT(helpStrings).form;
  const id = useId().replace(/:/g, '');
  const [form, setForm] = useState<FormState>(() => initialForm(locale));
  const [copied, setCopied] = useState(false);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  // Labels inside the complaint follow the complaint's language, not the page's.
  const out = pick(helpStrings, form.lang).form;
  const categories = useMemo(
    () =>
      CATEGORY_ORDER.map((cid) => CATEGORIES[cid])
        .filter(Boolean)
        .map((info) => ({ id: info.id, en: info.name, hi: info.nameHi })),
    [],
  );

  const data: ComplaintData = {
    ...emptyComplaint(form.lang),
    name: form.name,
    mobile: form.mobile,
    email: form.email,
    address: form.address,
    city: form.city,
    state: form.state,
    category: (() => {
      const cat = categories.find((x) => x.id === form.category);
      return cat ? (baseLocale(form.lang) === 'hi' ? cat.hi : cat.en) : '';
    })(),
    contactMode: form.contact ? out.contactPhrase[form.contact as (typeof CONTACT_KEYS)[number]] : '',
    incidentAt: form.incidentAt,
    amount: form.amount,
    paymentMode: form.payment ? out.paymentModes[form.payment as (typeof PAYMENT_KEYS)[number]] : '',
    transactions: form.transactions,
    suspects: form.suspects,
    description: form.description,
    called1930: form.called1930,
    ack1930: form.ack1930,
    informedBank: form.informedBank,
    bankRef: form.bankRef,
    reportedOnline: form.reportedOnline,
    ackOnline: form.ackOnline,
  };
  const text = formatComplaint(data);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    setCopied(true);
  };

  const print = () => {
    document.body.classList.add('print-complaint');
    const done = () => {
      document.body.classList.remove('print-complaint');
      window.removeEventListener('afterprint', done);
    };
    window.addEventListener('afterprint', done);
    window.print();
    window.setTimeout(done, 1000);
  };

  const download = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ruko-complaint.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const updateTx = (index: number, patch: Partial<Transaction>) =>
    setForm((f) => ({ ...f, transactions: f.transactions.map((tx, i) => (i === index ? { ...tx, ...patch } : tx)) }));

  return (
    <section aria-labelledby={`${id}-title`} className="mt-16 border-t border-line pt-12" id="complaint">
      <div className="max-w-3xl">
        <p className="flex items-center gap-2 text-sm font-bold tracking-[0.16em] text-brand uppercase">
          <FileText aria-hidden="true" className="size-4" />
          {ui.heading}
        </p>
        <h2 id={`${id}-title`} className="display mt-3 text-4xl">
          {ui.heading}
        </h2>
        <p className="mt-3 text-[1.05rem] leading-relaxed text-muted">{ui.intro}</p>
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-safe-tint px-3 py-1.5 text-sm font-semibold text-safe">
          <Lock aria-hidden="true" className="size-4" />
          {ui.privacy}
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()} data-testid="complaint-form">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">{ui.language}</legend>
            <div className="inline-flex rounded-full border border-line-strong bg-surface p-0.5">
              {LOCALES.map((l) => (
                <label
                  key={l}
                  className={cn(
                    'cursor-pointer rounded-full px-4 py-1.5 text-sm font-bold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-[var(--focus)]',
                    form.lang === l ? 'bg-fg text-bg' : 'text-muted',
                  )}
                  lang={l}
                >
                  <input type="radio" name={`${id}-lang`} value={l} checked={form.lang === l} onChange={() => void loadLocale(l).catch(() => undefined).then(() => set('lang', l))} className="sr-only" />
                  {LOCALE_NAMES[l]}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-3 font-display text-xl font-bold">{ui.you}</legend>
            <Field id={`${id}-name`} label={ui.name}>
              <input id={`${id}-name`} className={cn(inputClass, 'h-11')} value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" />
            </Field>
            <Field id={`${id}-mobile`} label={ui.mobile}>
              <input
                id={`${id}-mobile`}
                className={cn(inputClass, 'h-11')}
                value={form.mobile}
                onChange={(e) => set('mobile', e.target.value)}
                inputMode="tel"
                autoComplete="tel"
              />
            </Field>
            <Field id={`${id}-email`} label={ui.email} className="sm:col-span-2">
              <input
                id={`${id}-email`}
                type="email"
                className={cn(inputClass, 'h-11')}
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                autoComplete="email"
              />
            </Field>
            <Field id={`${id}-address`} label={ui.address} className="sm:col-span-2">
              <input
                id={`${id}-address`}
                className={cn(inputClass, 'h-11')}
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                autoComplete="street-address"
              />
            </Field>
            <Field id={`${id}-city`} label={ui.city}>
              <input id={`${id}-city`} className={cn(inputClass, 'h-11')} value={form.city} onChange={(e) => set('city', e.target.value)} autoComplete="address-level2" />
            </Field>
            <Field id={`${id}-state`} label={ui.state}>
              <input id={`${id}-state`} className={cn(inputClass, 'h-11')} value={form.state} onChange={(e) => set('state', e.target.value)} autoComplete="address-level1" />
            </Field>
          </fieldset>

          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-3 font-display text-xl font-bold">{ui.what}</legend>
            <Field id={`${id}-cat`} label={ui.category}>
              <select id={`${id}-cat`} className={cn(inputClass, 'h-11')} value={form.category} onChange={(e) => set('category', e.target.value)}>
                <option value="">{ui.choose}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {baseLocale(locale) === 'hi' ? cat.hi : cat.en}
                  </option>
                ))}
              </select>
            </Field>
            <Field id={`${id}-contact`} label={ui.contact}>
              <select id={`${id}-contact`} className={cn(inputClass, 'h-11')} value={form.contact} onChange={(e) => set('contact', e.target.value)}>
                <option value="">{ui.choose}</option>
                {CONTACT_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {ui.contactModes[k]}
                  </option>
                ))}
              </select>
            </Field>
            <Field id={`${id}-when`} label={ui.incidentAt} className="sm:col-span-2">
              <input
                id={`${id}-when`}
                type="datetime-local"
                className={cn(inputClass, 'h-11')}
                value={form.incidentAt}
                onChange={(e) => set('incidentAt', e.target.value)}
              />
            </Field>
            <Field id={`${id}-desc`} label={ui.description} hint={ui.descriptionHint} className="sm:col-span-2">
              <textarea
                id={`${id}-desc`}
                rows={4}
                className={cn(inputClass, 'py-2.5 leading-relaxed')}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                aria-describedby={`${id}-desc-hint`}
              />
            </Field>
          </fieldset>

          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-3 font-display text-xl font-bold">{ui.money}</legend>
            <Field id={`${id}-amount`} label={ui.amount}>
              <input
                id={`${id}-amount`}
                className={cn(inputClass, 'num h-11')}
                inputMode="decimal"
                value={form.amount}
                onChange={(e) => set('amount', e.target.value)}
              />
            </Field>
            <Field id={`${id}-pay`} label={ui.paymentMode}>
              <select id={`${id}-pay`} className={cn(inputClass, 'h-11')} value={form.payment} onChange={(e) => set('payment', e.target.value)}>
                <option value="">{ui.choose}</option>
                {PAYMENT_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {ui.paymentModes[k]}
                  </option>
                ))}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <p className="text-sm font-semibold">{ui.transactions}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-subtle">{ui.transactionsHint}</p>
              <ol className="mt-3 space-y-3">
                {form.transactions.map((tx, i) => (
                  <li key={i} className="rounded-2xl border border-line bg-surface-2/60 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="num text-sm font-bold text-muted">#{i + 1}</span>
                      {form.transactions.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, transactions: f.transactions.filter((_, j) => j !== i) }))}
                          className="grid size-8 place-items-center rounded-full text-muted hover:bg-line"
                          aria-label={ui.removeTx(i + 1)}
                        >
                          <X aria-hidden="true" className="size-4" />
                        </button>
                      ) : null}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field id={`${id}-tx${i}-at`} label={ui.txAt}>
                        <input id={`${id}-tx${i}-at`} type="datetime-local" className={cn(inputClass, 'h-10')} value={tx.at} onChange={(e) => updateTx(i, { at: e.target.value })} />
                      </Field>
                      <Field id={`${id}-tx${i}-amount`} label={ui.txAmount}>
                        <input
                          id={`${id}-tx${i}-amount`}
                          inputMode="decimal"
                          className={cn(inputClass, 'num h-10')}
                          value={tx.amount}
                          onChange={(e) => updateTx(i, { amount: e.target.value })}
                        />
                      </Field>
                      <Field id={`${id}-tx${i}-ref`} label={ui.txRef} className="sm:col-span-2">
                        <input id={`${id}-tx${i}-ref`} className={cn(inputClass, 'num h-10')} value={tx.reference} onChange={(e) => updateTx(i, { reference: e.target.value })} />
                      </Field>
                      <Field id={`${id}-tx${i}-from`} label={ui.txFrom}>
                        <input id={`${id}-tx${i}-from`} className={cn(inputClass, 'h-10')} value={tx.from} onChange={(e) => updateTx(i, { from: e.target.value })} />
                      </Field>
                      <Field id={`${id}-tx${i}-to`} label={ui.txTo}>
                        <input id={`${id}-tx${i}-to`} className={cn(inputClass, 'h-10')} value={tx.to} onChange={(e) => updateTx(i, { to: e.target.value })} />
                      </Field>
                    </div>
                  </li>
                ))}
              </ol>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => setForm((f) => ({ ...f, transactions: [...f.transactions, blankTx()] }))}
              >
                <Plus aria-hidden="true" />
                {ui.addTx}
              </Button>
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 font-display text-xl font-bold">{ui.suspects}</legend>
            <textarea
              id={`${id}-suspects`}
              aria-label={ui.suspects}
              aria-describedby={`${id}-suspects-hint`}
              rows={3}
              className={cn(inputClass, 'py-2.5 font-mono text-sm leading-relaxed')}
              value={form.suspects}
              onChange={(e) => set('suspects', e.target.value)}
              spellCheck={false}
            />
            <p id={`${id}-suspects-hint`} className="mt-1 text-xs text-subtle">
              {ui.suspectsHint}
            </p>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="mb-3 font-display text-xl font-bold">{ui.steps}</legend>
            {(
              [
                ['called1930', 'ack1930', ui.called1930, ui.ack],
                ['reportedOnline', 'ackOnline', ui.reportedOnline, ui.ack],
                ['informedBank', 'bankRef', ui.informedBank, ui.bankRef],
              ] as const
            ).map(([flag, ref, label, refLabel]) => (
              <div key={flag} className="rounded-2xl border border-line bg-surface p-4">
                <label className="flex cursor-pointer items-center gap-3 font-semibold">
                  <input
                    type="checkbox"
                    checked={form[flag]}
                    onChange={(e) => set(flag, e.target.checked)}
                    className="size-5 accent-[var(--brand-bg)]"
                  />
                  {label}
                </label>
                {form[flag] ? (
                  <Field id={`${id}-${ref}`} label={refLabel} className="mt-3">
                    <input id={`${id}-${ref}`} className={cn(inputClass, 'num h-10')} value={form[ref]} onChange={(e) => set(ref, e.target.value)} />
                  </Field>
                ) : null}
              </div>
            ))}
          </fieldset>

          <Button variant="ghost" size="sm" onClick={() => setForm(initialForm(form.lang))}>
            <RotateCcw aria-hidden="true" />
            {ui.clear}
          </Button>
        </form>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-xl font-bold">{ui.preview}</h3>
          </div>
          <div
            id="complaint-print"
            lang={form.lang}
            className="print-plain mt-3 max-h-[70dvh] overflow-y-auto rounded-2xl border border-line bg-surface p-5 font-mono text-[0.86rem] leading-relaxed whitespace-pre-wrap text-fg shadow-card lg:max-h-[calc(100dvh-14rem)]"
            data-testid="complaint-preview"
            tabIndex={0}
          >
            {text}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="primary" size="md" onClick={() => void copy()} data-testid="complaint-copy">
              {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              {copied ? ui.copied : ui.copy}
            </Button>
            <Button variant="secondary" size="md" onClick={print}>
              <Printer aria-hidden="true" />
              {ui.print}
            </Button>
            <Button variant="secondary" size="md" onClick={download}>
              <Download aria-hidden="true" />
              {ui.download}
            </Button>
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            {copied ? ui.copied : ''}
          </p>
          <ButtonLink
            href={config.official.cybercrime}
            variant="ghost"
            size="md"
            className="mt-3 text-accent"
            external
            newTabLabel={pick(helpStrings, locale).steps.report.cta}
          >
            {pick(helpStrings, locale).steps.report.cta}
            <ExternalLink aria-hidden="true" />
          </ButtonLink>
          <Link to="/privacy" className="mt-2 block text-sm text-subtle underline-offset-4 hover:underline">
            {ui.privacy}
          </Link>
        </div>
      </div>
    </section>
  );
}
