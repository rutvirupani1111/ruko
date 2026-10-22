import { CircleCheck, ExternalLink, X } from 'lucide-react';
import { browser } from 'wxt/browser';
import { LINKS } from '../../config';
import { HelpCard } from '../../ui/components/HelpCard';
import { Mark } from '../../ui/components/Mark';
import { useSettings } from '../../ui/hooks/useSettings';
import { I18nProvider, useI18n } from '../../ui/i18n';

export default function SafeRoot() {
  const { settings } = useSettings();
  return (
    <I18nProvider locale={settings.locale}>
      <Safe />
    </I18nProvider>
  );
}

function Safe() {
  const { t, locale } = useI18n();
  const params = new URLSearchParams(location.search);
  const host = (params.get('host') ?? '').slice(0, 253);
  const brand = (params.get('brand') ?? '').slice(0, 60);
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 py-10" lang={locale}>
      <div className="w-full max-w-xl">
        <div className="rk-card animate-rise p-7 sm:p-9">
          <div className="relative w-fit">
            <div className="absolute inset-0 -z-10 scale-150 rounded-full bg-safe/20 blur-2xl" aria-hidden="true" />
            <Mark size={64} />
          </div>
          <h1 className="rk-display mt-5 flex items-center gap-2 text-[30px] font-extrabold leading-tight">
            <CircleCheck size={28} className="text-[var(--safe-text)]" aria-hidden="true" />
            {t('leftTitle')}
          </h1>
          {host ? (
            <p className="mt-3 text-[16px] leading-relaxed" data-testid="left-body">
              {brand ? t('leftBodyBrand', { host, brand }) : t('leftBody', { host })}
            </p>
          ) : null}
          <h2 className="rk-eyebrow mt-6">{t('leftTipsTitle')}</h2>
          <ul className="mt-2 space-y-2 text-[14.5px] leading-relaxed">
            {(['leftTip1', 'leftTip2', 'leftTip3'] as const).map((key) => (
              <li key={key} className="flex gap-2">
                <CircleCheck size={17} className="mt-1 shrink-0 text-[var(--safe-text)]" aria-hidden="true" />
                {t(key)}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            <a className="rk-btn rk-btn-quiet" href={LINKS.cybercrime} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={16} aria-hidden="true" />
              {t('leftReport')}
            </a>
            <button
              type="button"
              className="rk-btn rk-btn-quiet"
              onClick={() =>
                void browser.tabs.getCurrent().then((tab) => (tab?.id !== undefined ? browser.tabs.remove(tab.id) : window.close()))
              }
            >
              <X size={16} aria-hidden="true" />
              {t('leftClose')}
            </button>
          </div>
        </div>
        <div className="mt-4">
          <HelpCard />
        </div>
      </div>
    </main>
  );
}
