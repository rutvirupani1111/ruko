import type { Locale } from '@ruko/engine';

/** Compact English / Hindi switch. Each option names itself in its own language. */
export function LanguageSwitch({ locale, onChange, label }: { locale: Locale; onChange: (next: Locale) => void; label: string }) {
  const options: Array<{ value: Locale; text: string }> = [
    { value: 'en', text: 'English' },
    { value: 'hi', text: 'हिन्दी' },
  ];
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] p-0.5 text-[12.5px]">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={locale === option.value}
          lang={option.value}
          data-testid={`lang-${option.value}`}
          onClick={() => onChange(option.value)}
          className={`rounded-full px-2.5 py-1 font-semibold transition-colors ${
            locale === option.value ? 'bg-ink text-paper dark:bg-paper dark:text-ink' : 'text-[var(--muted)] hover:text-[var(--text)]'
          }`}
        >
          {option.text}
        </button>
      ))}
    </div>
  );
}
