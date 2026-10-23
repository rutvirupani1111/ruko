import { common } from '@/i18n/common';
import { LOCALE_NAMES, loadLocale, useLocale, useT, type Locale } from '@/i18n/core';
import { cn } from '@/lib/cn';

const OPTIONS: Array<{ value: Locale; short: string; font?: string }> = [
  { value: 'en', short: 'EN' },
  { value: 'hi', short: 'हिं', font: 'font-deva text-[0.95rem]' },
  { value: 'gu', short: 'ગુ', font: 'font-gujr text-[0.95rem]' },
  { value: 'mr', short: 'मरा', font: 'font-deva text-[0.95rem]' },
];

/** EN | हिं | ગુ | मरा segmented switch. Remembered on this device; updates <html lang>. */
export function LanguageSwitch({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  const t = useT(common);
  return (
    <div role="group" aria-label={t.header.language} className={cn('inline-flex rounded-full border border-line-strong bg-surface p-0.5', className)}>
      {OPTIONS.map((opt) => {
        const active = locale === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            lang={opt.value}
            aria-pressed={active}
            aria-label={LOCALE_NAMES[opt.value]}
            title={LOCALE_NAMES[opt.value]}
            onClick={() => setLocale(opt.value)}
            // Start fetching the Gujarati/Marathi bundle as soon as a finger or pointer lands.
            onPointerEnter={() => void loadLocale(opt.value).catch(() => undefined)}
            className={cn(
              'h-8 min-w-10 rounded-full px-2 text-sm font-bold transition-colors duration-150',
              opt.font,
              active ? 'bg-fg text-bg' : 'text-muted hover:text-fg',
            )}
            data-testid={`lang-${opt.value}`}
          >
            {opt.short}
          </button>
        );
      })}
    </div>
  );
}
