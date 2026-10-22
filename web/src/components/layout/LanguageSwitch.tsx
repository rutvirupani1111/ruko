import { common } from '@/i18n/common';
import { useLocale, useT, type Locale } from '@/i18n/core';
import { cn } from '@/lib/cn';

const OPTIONS: Array<{ value: Locale; short: string; name: string }> = [
  { value: 'en', short: 'EN', name: 'English' },
  { value: 'hi', short: 'हिं', name: 'हिंदी' },
];

/** EN | हिं segmented switch. Remembered on this device; updates <html lang>. */
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
            aria-label={opt.name}
            onClick={() => setLocale(opt.value)}
            className={cn(
              'h-8 min-w-11 rounded-full px-2.5 text-sm font-bold transition-colors duration-150',
              opt.value === 'hi' && 'font-deva text-[0.95rem]',
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
