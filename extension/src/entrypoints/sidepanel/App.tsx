import type { Verdict } from '@ruko/engine';
import { browser } from 'wxt/browser';
import { Eraser, History as HistoryIcon, Search, Settings as SettingsIcon, ShieldCheck, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { clearHistory, removeHistory, type HistoryEntry } from '../../shared/history';
import { timeAgo } from '../../shared/i18n/format';
import { categoryLabel } from '../../shared/i18n/inpage';
import type { PendingCheck } from '../../shared/messages';
import { PENDING_KEY } from '../../shared/panel';
import { isStubEngine, recordCheck, runCheck, type CheckInput } from '../../ui/analysis';
import { AiExplain } from '../../ui/components/AiExplain';
import { SeverityChip } from '../../ui/components/Chips';
import { CommunityNote } from '../../ui/components/CommunityNote';
import { HelpCard } from '../../ui/components/HelpCard';
import { LanguageSwitch } from '../../ui/components/LanguageSwitch';
import { Mark, Wordmark } from '../../ui/components/Mark';
import { VerdictCard } from '../../ui/components/VerdictCard';
import { useHistory } from '../../ui/hooks/useHistory';
import { useSettings } from '../../ui/hooks/useSettings';
import { I18nProvider, useI18n } from '../../ui/i18n';
import { openOptions } from '../../ui/panel-client';
import { prefersReducedMotion } from '../../ui/theme';
import { SAMPLES, SOURCE_META } from '../../ui/sources';

type SettingsApi = ReturnType<typeof useSettings>;
type Tab = 'check' | 'history';

export default function SidePanelRoot() {
  const api = useSettings();
  return (
    <I18nProvider locale={api.settings.locale}>
      <SidePanel {...api} />
    </I18nProvider>
  );
}

async function takePendingCheck(): Promise<PendingCheck | null> {
  for (const area of [browser.storage.session, browser.storage.local]) {
    try {
      const stored = await area.get(PENDING_KEY);
      const pending = stored[PENDING_KEY] as PendingCheck | undefined;
      if (pending && typeof pending.text === 'string') {
        await area.remove(PENDING_KEY);
        return pending;
      }
    } catch {
      // storage.session may be unavailable; try the next area.
    }
  }
  return null;
}

function SidePanel({ settings, update }: SettingsApi) {
  const { t, locale } = useI18n();
  const [tab, setTab] = useState<Tab>('check');
  const [input, setInput] = useState('');
  const [current, setCurrent] = useState<CheckInput | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const verdict: Verdict | null = useMemo(() => (current ? runCheck(current, locale) : null), [current, locale]);

  const check = useCallback(
    (next: CheckInput, record: boolean) => {
      setInput(next.text);
      setCurrent(next);
      setTab('check');
      if (record && settings.keepHistory) recordCheck(next, runCheck(next, locale));
      requestAnimationFrame(() => {
        const result = resultRef.current;
        if (!result) return;
        // Move focus to the verdict for screen readers and scroll its top (meter and
        // headline) just under the sticky header.
        result.focus({ preventScroll: true });
        result.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      });
    },
    [locale, settings.keepHistory],
  );

  // Text handed over by the context menu, the popup or an in-page "See full analysis".
  useEffect(() => {
    let alive = true;
    const consume = () =>
      takePendingCheck().then((pending) => {
        if (!alive || !pending) return;
        check({ text: pending.text, source: pending.source, kind: pending.kind, sender: pending.sender, pageUrl: pending.pageUrl }, pending.source === 'context' || pending.source === 'manual');
      });
    void consume();
    const onChanged = (changes: Record<string, unknown>) => {
      if (PENDING_KEY in changes) void consume();
    };
    browser.storage.onChanged.addListener(onChanged);
    return () => {
      alive = false;
      browser.storage.onChanged.removeListener(onChanged);
    };
  }, [check]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    check({ text, source: 'manual' }, true);
  };

  return (
    <div className="flex min-h-screen flex-col" lang={locale}>
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg)]/95 px-4 pt-3 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <Wordmark subtitle={t('tagline')} />
          <div className="flex items-center gap-1.5">
            <LanguageSwitch locale={locale} label={t('sectionLanguage')} onChange={(l) => void update({ locale: l })} />
            <button type="button" className="rk-btn rk-btn-quiet h-9 min-h-0 w-9 p-0" aria-label={t('settings')} title={t('settings')} onClick={openOptions}>
              <SettingsIcon size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div role="tablist" aria-label="Ruko" className="mt-3 flex gap-1">
          {(['check', 'history'] as const).map((id) => (
            <button
              key={id}
              role="tab"
              id={`tab-${id}`}
              aria-selected={tab === id}
              aria-controls={`panel-${id}`}
              data-testid={`tab-${id}`}
              onClick={() => setTab(id)}
              className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 pb-2.5 text-[14px] font-semibold transition-colors ${
                tab === id ? 'border-saffron text-[var(--text)]' : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              {id === 'check' ? <Search size={15} aria-hidden="true" /> : <HistoryIcon size={15} aria-hidden="true" />}
              {id === 'check' ? t('tabCheck') : t('tabHistory')}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 px-4 py-4">
        <div id="panel-check" role="tabpanel" aria-labelledby="tab-check" hidden={tab !== 'check'} className="space-y-4">
          <form onSubmit={onSubmit} className="rk-card p-3.5">
            <label htmlFor="check-input" className="rk-eyebrow">
              {t('inputLabel')}
            </label>
            <textarea
              id="check-input"
              ref={inputRef}
              data-testid="panel-input"
              className="rk-input mt-2 min-h-28 resize-y text-[14.5px]"
              placeholder={t('inputPlaceholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) onSubmit(e);
              }}
            />
            <div className="mt-2 flex gap-2">
              <button type="submit" className="rk-btn rk-btn-primary flex-1" disabled={!input.trim()} data-testid="panel-check">
                <Search size={16} aria-hidden="true" />
                {t('checkNow')}
              </button>
              <button
                type="button"
                className="rk-btn rk-btn-quiet"
                disabled={!input && !current}
                onClick={() => {
                  setInput('');
                  setCurrent(null);
                  inputRef.current?.focus();
                }}
              >
                <Eraser size={16} aria-hidden="true" />
                {t('clear')}
              </button>
            </div>
            {!current ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[12.5px]">
                <span className="text-[var(--muted)]">{t('trySample')}:</span>
                <button type="button" className="rounded-full bg-danger/10 px-2.5 py-1 font-semibold text-[var(--danger-text)]" onClick={() => check({ text: SAMPLES.scam[locale], source: 'manual' }, false)}>
                  {t('sampleScam')}
                </button>
                <button type="button" className="rounded-full bg-safe/12 px-2.5 py-1 font-semibold text-[var(--safe-text)]" onClick={() => check({ text: SAMPLES.safe[locale], source: 'manual' }, false)}>
                  {t('sampleSafe')}
                </button>
              </div>
            ) : null}
          </form>

          {verdict && current ? (
            <div ref={resultRef} tabIndex={-1} className="scroll-mt-28 space-y-3 outline-none" data-testid="panel-result">
              {current.sender || current.source !== 'manual' ? (
                <p className="flex flex-wrap items-center gap-x-2 text-[12.5px] text-[var(--muted)]">
                  <SourceLabel source={current.source ?? 'manual'} />
                  {current.sender ? <span>· {t('fromSender', { sender: current.sender })}</span> : null}
                </p>
              ) : null}
              {isStubEngine() ? <p className="rounded-xl bg-caution/15 px-3 py-2 text-[12.5px]">{t('engineStub')}</p> : null}
              <VerdictCard verdict={verdict} text={current.text}>
                <CommunityNote verdict={verdict} enabled={settings.community} />
                <AiExplain verdict={verdict} text={current.text} />
              </VerdictCard>
            </div>
          ) : (
            <EmptyState />
          )}
          <HelpCard compact />
        </div>

        <div id="panel-history" role="tabpanel" aria-labelledby="tab-history" hidden={tab !== 'history'}>
          <HistoryList
            enabled={settings.keepHistory}
            onOpen={(entry) => check({ text: entry.text, source: entry.source, sender: entry.sender, kind: entry.kind, pageUrl: entry.host ? `https://${entry.host}/` : undefined }, false)}
          />
        </div>
      </main>
    </div>
  );
}

function SourceLabel({ source }: { source: HistoryEntry['source'] }) {
  const { t } = useI18n();
  const meta = SOURCE_META[source] ?? SOURCE_META.manual;
  const Icon = meta.icon;
  return (
    <span className="inline-flex items-center gap-1">
      <Icon size={13} aria-hidden="true" />
      {t(meta.label)}
    </span>
  );
}

function EmptyState() {
  const { t } = useI18n();
  return (
    <section className="flex flex-col items-center px-6 py-6 text-center" data-testid="panel-empty">
      <div className="relative">
        <div className="absolute inset-0 -z-10 scale-150 rounded-full bg-saffron/15 blur-2xl" aria-hidden="true" />
        <Mark size={72} />
      </div>
      <h2 className="rk-display mt-4 text-[20px] font-extrabold">{t('emptyTitle')}</h2>
      <p className="mt-1.5 max-w-[34ch] text-[14px] leading-relaxed text-[var(--muted)]">{t('emptyBody')}</p>
    </section>
  );
}

function HistoryList({ enabled, onOpen }: { enabled: boolean; onOpen: (entry: HistoryEntry) => void }) {
  const { t, locale } = useI18n();
  const { history, loaded } = useHistory();
  const [confirming, setConfirming] = useState(false);
  const [notice, setNotice] = useState('');

  if (!loaded) return null;

  return (
    <section aria-labelledby="history-title" data-testid="history">
      <div className="flex items-center justify-between gap-2">
        <h2 id="history-title" className="rk-display text-[18px] font-extrabold">
          {t('tabHistory')}
        </h2>
        {history.length ? (
          <button type="button" className="rk-btn rk-btn-quiet min-h-0 py-1.5 text-[13px]" onClick={() => setConfirming(true)} data-testid="clear-history">
            <Trash2 size={15} aria-hidden="true" />
            {t('clearHistory')}
          </button>
        ) : null}
      </div>

      {!enabled ? <p className="mt-2 rounded-xl bg-caution/15 px-3 py-2 text-[13px]">{t('historyOff')}</p> : null}
      <p className="sr-only" role="status" aria-live="polite">
        {notice}
      </p>

      {confirming ? (
        <div role="alertdialog" aria-labelledby="confirm-clear" className="rk-card mt-3 border-danger/40 p-3.5" data-testid="confirm-clear">
          <p id="confirm-clear" className="text-[14px] font-semibold">
            {t('clearHistoryConfirm', { count: history.length })}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="rk-btn rk-btn-danger flex-1"
              data-testid="confirm-clear-yes"
              onClick={() =>
                void clearHistory().then(() => {
                  setConfirming(false);
                  setNotice(t('historyCleared'));
                })
              }
            >
              {t('confirmDelete')}
            </button>
            <button type="button" className="rk-btn rk-btn-quiet flex-1" onClick={() => setConfirming(false)} autoFocus>
              {t('cancel')}
            </button>
          </div>
        </div>
      ) : null}

      {history.length ? (
        <ul className="mt-3 space-y-2" data-testid="history-list">
          {history.map((entry) => {
            const Icon = (SOURCE_META[entry.source] ?? SOURCE_META.manual).icon;
            return (
              <li key={entry.id} className="rk-card group relative">
                <button type="button" className="flex w-full gap-3 p-3 pr-10 text-left" onClick={() => onOpen(entry)}>
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--surface-2)] text-[var(--muted)]" aria-hidden="true">
                    <Icon size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <SeverityChip severity={entry.severity} />
                      <span className="text-[12px] text-[var(--muted)]">
                        {t((SOURCE_META[entry.source] ?? SOURCE_META.manual).label)} · {timeAgo(entry.at, locale)}
                      </span>
                    </span>
                    <span className="mt-1 block text-[14px] font-semibold leading-snug">
                      {entry.category && entry.severity !== 'safe' ? categoryLabel(locale, entry.category) : entry.headline}
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-[12.5px] leading-snug text-[var(--muted)]">{entry.text}</span>
                  </span>
                </button>
                <button
                  type="button"
                  className="absolute top-2 right-2 grid h-8 w-8 place-items-center rounded-lg text-[var(--muted)] opacity-70 hover:bg-[var(--surface-2)] hover:opacity-100 focus-visible:opacity-100"
                  aria-label={t('deleteItem')}
                  title={t('deleteItem')}
                  onClick={() => void removeHistory(entry.id)}
                >
                  <X size={15} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-6 flex flex-col items-center text-center" data-testid="history-empty">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-safe/12 text-[var(--safe-text)]" aria-hidden="true">
            <ShieldCheck size={26} />
          </span>
          <p className="mt-3 text-[15px] font-bold">{t('historyEmpty')}</p>
          <p className="mt-1 max-w-[34ch] text-[13px] leading-relaxed text-[var(--muted)]">{t('historyEmptyBody')}</p>
        </div>
      )}
    </section>
  );
}
