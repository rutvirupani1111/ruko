import { ENGINE_VERSION } from '@ruko/engine';
import { browser } from 'wxt/browser';
import { Check, Coffee, Copy, Globe, Heart, Info, Languages, Lock, ShieldCheck, Sparkles, Users, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { isPlaceholder, SUPPORT } from '../../config';
import { WARN_AT_VALUES, type WarnAt } from '../../shared/severity';
import { normalizeApiUrl, withSiteAllowed, withSiteDisabled, type Settings } from '../../shared/settings';
import { promptAvailability, translatorAvailability, type AiAvailability } from '../../ui/ai';
import { HelpCard } from '../../ui/components/HelpCard';
import { LanguageSwitch } from '../../ui/components/LanguageSwitch';
import { Wordmark } from '../../ui/components/Mark';
import { Toggle } from '../../ui/components/Toggle';
import { useSettings } from '../../ui/hooks/useSettings';
import { I18nProvider, useI18n } from '../../ui/i18n';

type SettingsApi = ReturnType<typeof useSettings>;

export default function OptionsRoot() {
  const api = useSettings();
  return (
    <I18nProvider locale={api.settings.locale}>
      <Options {...api} />
    </I18nProvider>
  );
}

function Section({ id, icon, title, children }: { id: string; icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="rk-card p-5 sm:p-6" data-testid={`section-${id}`}>
      <h2 id={id} className="flex items-center gap-2.5 text-[17px] font-bold">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-saffron/15 text-saffron-strong" aria-hidden="true">
          {icon}
        </span>
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function PlaceholderTag() {
  const { t } = useI18n();
  return (
    <span className="ml-2 inline-flex items-center rounded-md border border-dashed border-caution bg-caution/15 px-1.5 py-0.5 text-[11px] font-bold text-[var(--caution-text)]" title={t('placeholderHint')} data-testid="placeholder-tag">
      {t('placeholder')}
    </span>
  );
}

function Options({ settings, update, loaded }: SettingsApi) {
  const { t, locale } = useI18n();
  const [saved, setSaved] = useState(false);
  const [prompt, setPrompt] = useState<AiAvailability>('unavailable');
  const [translator, setTranslator] = useState<AiAvailability>('unavailable');

  useEffect(() => {
    void promptAvailability().then(setPrompt);
    void translatorAvailability('en', 'hi').then(setTranslator);
  }, []);

  const save = async (patch: Partial<Settings> | ((s: Settings) => Settings)) => {
    await update(patch);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  if (!loaded) return null;

  const warnLabels: Record<WarnAt, { label: string; hint: string }> = {
    low: { label: t('warnLow'), hint: t('warnLowHint') },
    medium: { label: t('warnMedium'), hint: t('warnMediumHint') },
    high: { label: t('warnHigh'), hint: t('warnHighHint') },
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]" lang={locale}>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Wordmark size={40} subtitle={t('tagline')} />
          <p className={`text-[13px] font-semibold text-[var(--safe-text)] transition-opacity ${saved ? 'opacity-100' : 'opacity-0'}`} role="status" aria-live="polite">
            <Check size={14} className="mr-1 inline" aria-hidden="true" />
            {saved ? t('saved') : ''}
          </p>
        </header>
        <h1 className="rk-display mt-6 text-[30px] font-extrabold leading-tight">{t('optionsTitle')}</h1>
        <p className="mt-1 text-[15px] text-[var(--muted)]">{t('optionsIntro')}</p>

        <div className="mt-6 space-y-4">
          <Section id="language" icon={<Languages size={17} />} title={t('sectionLanguage')}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[13.5px] text-[var(--muted)]">{t('languageHint')}</p>
              <LanguageSwitch locale={locale} label={t('sectionLanguage')} onChange={(l) => void save({ locale: l })} />
            </div>
          </Section>

          <Section id="sensitivity" icon={<ShieldCheck size={17} />} title={t('sectionSensitivity')}>
            <fieldset>
              <legend className="sr-only">{t('sectionSensitivity')}</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {WARN_AT_VALUES.map((value) => (
                  <label
                    key={value}
                    className={`flex cursor-pointer flex-col rounded-xl border p-3 transition-colors ${
                      settings.warnAt === value ? 'border-saffron bg-saffron/10 ring-1 ring-saffron' : 'border-[var(--border)] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-[14.5px] font-semibold">
                      <input
                        type="radio"
                        name="warnAt"
                        value={value}
                        checked={settings.warnAt === value}
                        onChange={() => void save({ warnAt: value })}
                        className="h-4 w-4 accent-[#FF7A1A]"
                        data-testid={`warn-${value}`}
                      />
                      {warnLabels[value].label}
                    </span>
                    <span className="mt-1 text-[12.5px] leading-snug text-[var(--muted)]">{warnLabels[value].hint}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </Section>

          <Section id="protection" icon={<Globe size={17} />} title={t('sectionProtection')}>
            <div className="divide-y divide-[var(--border)]">
              <Toggle checked={settings.whatsapp} onChange={(v) => void save({ whatsapp: v })} label={t('toggleWhatsapp')} hint={t('toggleWhatsappHint')} testId="toggle-whatsapp" />
              <Toggle checked={settings.gmail} onChange={(v) => void save({ gmail: v })} label={t('toggleGmail')} hint={t('toggleGmailHint')} testId="toggle-gmail" />
              <Toggle checked={settings.lookalikeShield} onChange={(v) => void save({ lookalikeShield: v })} label={t('toggleLookalike')} hint={t('toggleLookalikeHint')} testId="toggle-lookalike" />
              <Toggle
                checked={settings.linkTooltipsEverywhere}
                onChange={(v) => void save({ linkTooltipsEverywhere: v })}
                label={t('toggleTooltips')}
                hint={t('toggleTooltipsHint')}
                testId="toggle-tooltips"
              />
              <Toggle checked={settings.upiGuard} onChange={(v) => void save({ upiGuard: v })} label={t('toggleUpi')} hint={t('toggleUpiHint')} testId="toggle-upi" />
            </div>
          </Section>

          <Section id="sites" icon={<Lock size={17} />} title={t('sectionSites')}>
            <SiteList title={t('sitesDisabled')} sites={settings.disabledSites} onRemove={(site) => void save((s) => withSiteDisabled(s, site, false))} />
            <SiteList title={t('sitesAllowed')} sites={settings.allowedSites} onRemove={(site) => void save((s) => withSiteAllowed(s, site, false))} />
          </Section>

          <Section id="history" icon={<Info size={17} />} title={t('sectionHistory')}>
            <Toggle checked={settings.keepHistory} onChange={(v) => void save({ keepHistory: v })} label={t('toggleHistory')} hint={t('toggleHistoryHint')} testId="toggle-history" />
          </Section>

          <Section id="community" icon={<Users size={17} />} title={t('sectionCommunity')}>
            <CommunitySettings settings={settings} save={save} />
          </Section>

          <Section id="ai" icon={<Sparkles size={17} />} title={t('sectionAi')}>
            <p className="text-[14px] leading-relaxed" data-testid="ai-status">
              {prompt === 'available' ? t('aiAvailable') : prompt === 'unavailable' ? t('aiUnavailable') : t('aiDownloadable')}
            </p>
            {translator !== 'unavailable' ? <p className="mt-1 text-[13.5px] text-[var(--muted)]">{t('translatorAvailable')}</p> : null}
          </Section>

          <Section id="support" icon={<Heart size={17} />} title={t('sectionSupport')}>
            <SupportPanel />
          </Section>

          <HelpCard />

          <Section id="about" icon={<Info size={17} />} title={t('sectionAbout')}>
            <p className="text-[14px]">{t('aboutPrivacy')}</p>
            <p className="mt-2 text-[13px] text-[var(--muted)]">
              {t('aboutVersion', { version: browser.runtime.getManifest().version })} · {t('aboutEngine', { version: ENGINE_VERSION })}
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}

function SiteList({ title, sites, onRemove }: { title: string; sites: string[]; onRemove: (site: string) => void }) {
  const { t } = useI18n();
  return (
    <div className="py-2">
      <h3 className="text-[13.5px] font-semibold text-[var(--muted)]">{title}</h3>
      {sites.length ? (
        <ul className="mt-2 flex flex-wrap gap-2">
          {sites.map((site) => (
            <li key={site} className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-2)] py-1 pr-1 pl-3 font-mono text-[12.5px]">
              {site}
              <button type="button" className="grid h-6 w-6 place-items-center rounded-full hover:bg-[var(--border)]" aria-label={`${t('remove')} ${site}`} onClick={() => onRemove(site)}>
                <X size={13} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-[13px] text-[var(--muted)]">{t('sitesNone')}</p>
      )}
    </div>
  );
}

function CommunitySettings({ settings, save }: { settings: Settings; save: (patch: Partial<Settings>) => Promise<void> }) {
  const { t } = useI18n();
  const [url, setUrl] = useState(settings.communityApiUrl);
  const [error, setError] = useState('');

  useEffect(() => setUrl(settings.communityApiUrl), [settings.communityApiUrl]);

  const enable = async (on: boolean) => {
    setError('');
    if (!on) return save({ community: false });
    const clean = normalizeApiUrl(url);
    if (!clean) {
      setError(url.trim() ? t('communityUrlInvalid') : t('communityNeedsUrl'));
      return;
    }
    try {
      // Ask the browser for permission to contact only this one origin.
      const granted = await browser.permissions.request({ origins: [`${new URL(clean).origin}/*`] });
      if (!granted) {
        setError(t('communityPermissionDenied'));
        return;
      }
    } catch {
      // Host already covered by the extension's permissions.
    }
    await save({ community: true, communityApiUrl: clean });
  };

  return (
    <div>
      <Toggle checked={settings.community} onChange={(v) => void enable(v)} label={t('toggleCommunity')} hint={t('toggleCommunityHint')} testId="toggle-community" />
      <div className="mt-2">
        <label htmlFor="api-url" className="text-[13.5px] font-semibold">
          {t('communityUrl')}
        </label>
        <input
          id="api-url"
          type="url"
          inputMode="url"
          className="rk-input mt-1.5 font-mono text-[13px]"
          placeholder="https://"
          value={url}
          aria-describedby="api-url-hint"
          aria-invalid={!!error}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={() => {
            const clean = normalizeApiUrl(url);
            if (clean !== settings.communityApiUrl && (clean || !url.trim())) void save({ communityApiUrl: clean, community: clean ? settings.community : false });
          }}
        />
        <p id="api-url-hint" className="mt-1 text-[12.5px] text-[var(--muted)]">
          {t('communityUrlHint')}
        </p>
        {error ? (
          <p className="mt-1 text-[13px] font-semibold text-[var(--danger-text)]" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function SupportPanel() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT.upiId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };
  const links = [
    { key: 'kofiUrl' as const, label: t('supportKofi'), href: SUPPORT.kofiUrl, icon: <Coffee size={16} aria-hidden="true" /> },
    { key: 'buyMeACoffeeUrl' as const, label: t('supportBmc'), href: SUPPORT.buyMeACoffeeUrl, icon: <Heart size={16} aria-hidden="true" /> },
  ];
  return (
    <div data-testid="support">
      <p className="text-[14px] leading-relaxed text-[var(--muted)]">{t('supportIntro')}</p>
      <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3.5">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--muted)]">
          {t('supportUpi')}
          {isPlaceholder('upiId') ? <PlaceholderTag /> : null}
        </p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-[15px] font-semibold" data-testid="support-upi">
            {SUPPORT.upiId}
            <span className="ml-2 font-sans text-[12.5px] font-normal text-[var(--muted)]">
              {SUPPORT.upiName}
              {isPlaceholder('upiName') ? <PlaceholderTag /> : null}
            </span>
          </p>
          <button type="button" className="rk-btn rk-btn-quiet min-h-0 py-1.5 text-[13px]" onClick={() => void copy()}>
            {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
            {copied ? t('supportCopied') : t('supportCopy')}
          </button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {links.map((link) => (
          <a key={link.key} href={link.href} target="_blank" rel="noopener noreferrer" className="rk-btn rk-btn-quiet">
            {link.icon}
            {link.label}
            {isPlaceholder(link.key) ? <PlaceholderTag /> : null}
          </a>
        ))}
      </div>
      {isPlaceholder('upiId') || isPlaceholder('kofiUrl') || isPlaceholder('buyMeACoffeeUrl') ? (
        <p className="mt-2 text-[12.5px] text-[var(--caution-text)]">{t('placeholderHint')}</p>
      ) : null}
    </div>
  );
}
