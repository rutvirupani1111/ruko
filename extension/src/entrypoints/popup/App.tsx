import type { Verdict } from '@ruko/engine';
import { ChevronRight, PanelRight, Search, Settings as SettingsIcon, ShieldCheck, ShieldOff, ShieldQuestion } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { browser } from 'wxt/browser';
import { COUNTS_KEY, totalOf, type AllCounts } from '../../background/counts';
import { timeAgo } from '../../shared/i18n/format';
import { categoryLabel } from '../../shared/i18n/inpage';
import { send } from '../../shared/messages';
import { severityRank } from '../../shared/severity';
import { isSiteDisabled, withSiteDisabled } from '../../shared/settings';
import { isHttpUrl, siteKey } from '../../shared/url';
import { isStubEngine, recordCheck, runCheck } from '../../ui/analysis';
import { SeverityChip } from '../../ui/components/Chips';
import { LanguageSwitch } from '../../ui/components/LanguageSwitch';
import { Wordmark } from '../../ui/components/Mark';
import { Toggle } from '../../ui/components/Toggle';
import { VerdictCard } from '../../ui/components/VerdictCard';
import { useHistory } from '../../ui/hooks/useHistory';
import { useSettings } from '../../ui/hooks/useSettings';
import { I18nProvider, useI18n } from '../../ui/i18n';
import { getActiveTab, openOptions, openSidePanelWith, type ActiveTab } from '../../ui/panel-client';

type SettingsApi = ReturnType<typeof useSettings>;

export default function PopupRoot() {
  const api = useSettings();
  return (
    <I18nProvider locale={api.settings.locale}>
      <Popup {...api} />
    </I18nProvider>
  );
}

function Popup({ settings, update }: SettingsApi) {
  const { t, locale } = useI18n();
  const { history } = useHistory();
  const [tab, setTab] = useState<ActiveTab | null>(null);
  const [count, setCount] = useState(0);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{ verdict: Verdict; text: string } | null>(null);

  useEffect(() => {
    void getActiveTab().then((active) => {
      setTab(active);
      if (active?.id !== undefined) {
        send<'tab-count'>({ type: 'tab-count', tabId: active.id })
          .then(({ total }) => setCount(total))
          .catch(() => setCount(0));
      }
    });
  }, []);

  // Live: badges keep appearing while the popup is open (e.g. WhatsApp still loading).
  useEffect(() => {
    const id = tab?.id;
    if (id === undefined) return;
    const onChanged = (changes: Record<string, { newValue?: unknown }>, area: string) => {
      if (area !== 'session' || !(COUNTS_KEY in changes)) return;
      const all = (changes[COUNTS_KEY]?.newValue ?? {}) as AllCounts;
      setCount(totalOf(all[id]));
    };
    browser.storage.onChanged.addListener(onChanged);
    return () => browser.storage.onChanged.removeListener(onChanged);
  }, [tab?.id]);

  const site = tab?.url && isHttpUrl(tab.url) ? siteKey(new URL(tab.url).hostname) : null;
  const disabled = site ? isSiteDisabled(settings, site) : false;
  const recent = useMemo(() => history.filter((h) => h.warned || severityRank(h.severity) >= 2).slice(0, 3), [history]);

  // Re-run the quick check when the language changes so the verdict text follows.
  useEffect(() => {
    setResult((current) => (current ? { text: current.text, verdict: runCheck({ text: current.text }, locale) } : current));
  }, [locale]);

  const onCheck = (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    const verdict = runCheck({ text, source: 'manual' }, locale);
    setResult({ verdict, text });
    if (settings.keepHistory) recordCheck({ text, source: 'manual' }, verdict);
  };

  return (
    <div className="w-[380px] bg-[var(--bg)]" lang={locale}>
      <header className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
        <Wordmark subtitle={t('tagline')} />
        <div className="flex items-center gap-1.5">
          <LanguageSwitch locale={locale} label={t('sectionLanguage')} onChange={(l) => void update({ locale: l })} />
          <button type="button" className="rk-btn rk-btn-quiet h-9 min-h-0 w-9 p-0" aria-label={t('settings')} title={t('settings')} onClick={openOptions}>
            <SettingsIcon size={17} aria-hidden="true" />
          </button>
        </div>
      </header>

      <main className="space-y-3 px-4 pb-4">
        <section className="rk-card p-3.5" aria-label={t('allOn')} data-testid="site-card">
          {site ? (
            <>
              <div className="flex items-center gap-3">
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${disabled ? 'bg-[var(--surface-2)] text-[var(--muted)]' : 'bg-safe/15 text-[var(--safe-text)]'}`}
                  aria-hidden="true"
                >
                  {disabled ? <ShieldOff size={20} /> : <ShieldCheck size={20} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-bold">{disabled ? t('popupSiteOff') : t('popupSiteOn')}</p>
                  <p className="truncate font-mono text-[12.5px] text-[var(--muted)]">{site}</p>
                </div>
              </div>
              <div className="-my-1 border-t border-[var(--border)] mt-3">
                <Toggle
                  checked={!disabled}
                  onChange={(on) => void update((s) => withSiteDisabled(s, site, !on))}
                  label={t('popupSiteToggle', { site })}
                  testId="site-toggle"
                />
              </div>
              <p className={`flex items-center gap-2 text-[13px] font-semibold ${count ? 'text-[var(--danger-text)]' : 'text-[var(--muted)]'}`} data-testid="tab-count">
                <span className={`h-2 w-2 rounded-full ${count ? 'bg-danger' : 'bg-safe'}`} aria-hidden="true" />
                {count === 0 ? t('popupWarningsNone') : count === 1 ? t('popupWarningsOne') : t('popupWarningsMany', { count })}
              </p>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--surface-2)] text-[var(--muted)]" aria-hidden="true">
                <ShieldQuestion size={20} />
              </span>
              <div>
                <p className="text-[14.5px] font-bold">{t('popupUnsupported')}</p>
                <p className="text-[12.5px] leading-snug text-[var(--muted)]">{t('popupUnsupportedHint')}</p>
              </div>
            </div>
          )}
        </section>

        <form onSubmit={onCheck} className="rk-card p-3.5" aria-labelledby="quick-check-title">
          <label id="quick-check-title" htmlFor="quick-check" className="rk-eyebrow">
            {t('quickCheck')}
          </label>
          <textarea
            id="quick-check"
            data-testid="quick-check-input"
            className="rk-input mt-2 h-20 resize-none text-[14px]"
            placeholder={t('quickCheckPlaceholder')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) onCheck(e);
            }}
          />
          <button type="submit" className="rk-btn rk-btn-primary mt-2 w-full" disabled={!input.trim()} data-testid="quick-check-submit">
            <Search size={16} aria-hidden="true" />
            {t('check')}
          </button>
        </form>

        {result ? (
          <div className="space-y-2" data-testid="quick-result">
            {isStubEngine() ? <p className="text-[12px] text-[var(--muted)]">{t('engineStub')}</p> : null}
            <VerdictCard verdict={result.verdict} text={result.text} compact />
            <button
              type="button"
              className="rk-btn rk-btn-quiet w-full"
              onClick={() => void openSidePanelWith(tab, { text: result.text, source: 'manual' }).then(() => window.close())}
            >
              {t('openFull')}
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        ) : null}

        <section aria-labelledby="recent-title">
          <h2 id="recent-title" className="rk-eyebrow px-1">
            {t('recentDetections')}
          </h2>
          {recent.length ? (
            <ul className="mt-2 space-y-1.5" data-testid="recent-list">
              {recent.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="rk-card flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[var(--surface-2)]"
                    onClick={() =>
                      void openSidePanelWith(tab, { text: item.text, source: item.source, sender: item.sender, kind: item.kind }).then(() => window.close())
                    }
                  >
                    <SeverityChip severity={item.severity} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-semibold">{item.category ? categoryLabel(locale, item.category) : item.headline}</span>
                      <span className="block truncate text-[12px] text-[var(--muted)]">
                        {item.host ? `${item.host} · ` : ''}
                        {timeAgo(item.at, locale)}
                      </span>
                    </span>
                    <ChevronRight size={16} className="text-[var(--muted)]" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 px-1 text-[13px] text-[var(--muted)]">{t('noRecent')}</p>
          )}
        </section>
      </main>

      <footer className="grid grid-cols-2 gap-2 border-t border-[var(--border)] px-4 py-3">
        <button type="button" className="rk-btn rk-btn-quiet" data-testid="open-panel" onClick={() => void openSidePanelWith(tab).then(() => window.close())}>
          <PanelRight size={16} aria-hidden="true" />
          {t('openSidePanel')}
        </button>
        <button type="button" className="rk-btn rk-btn-quiet" onClick={openOptions}>
          <SettingsIcon size={16} aria-hidden="true" />
          {t('settings')}
        </button>
      </footer>
    </div>
  );
}
