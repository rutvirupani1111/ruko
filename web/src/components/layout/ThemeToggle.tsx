import { Monitor, Moon, Sun } from 'lucide-react';
import { common } from '@/i18n/common';
import { useT } from '@/i18n/core';
import { cn } from '@/lib/cn';
import { useTheme, type ThemePref } from '@/lib/theme';

const NEXT: Record<ThemePref, ThemePref> = { system: 'light', light: 'dark', dark: 'system' };

/** Cycles Auto, Light, Dark. */
export function ThemeToggle({ className }: { className?: string }) {
  const { pref, setPref } = useTheme();
  const t = useT(common);
  const label = { system: t.header.themeSystem, light: t.header.themeLight, dark: t.header.themeDark }[pref];
  const Icon = pref === 'system' ? Monitor : pref === 'light' ? Sun : Moon;
  return (
    <button
      type="button"
      onClick={() => setPref(NEXT[pref])}
      className={cn('grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-fg', className)}
      aria-label={`${t.header.theme}: ${label}`}
      title={`${t.header.theme}: ${label}`}
      data-testid="theme-toggle"
    >
      <Icon aria-hidden="true" className="size-5" />
    </button>
  );
}

/** Three-way theme picker for the mobile menu. */
export function ThemePicker() {
  const { pref, setPref } = useTheme();
  const t = useT(common);
  const options: Array<{ value: ThemePref; label: string; Icon: typeof Sun }> = [
    { value: 'system', label: t.header.themeSystem, Icon: Monitor },
    { value: 'light', label: t.header.themeLight, Icon: Sun },
    { value: 'dark', label: t.header.themeDark, Icon: Moon },
  ];
  return (
    <div role="radiogroup" aria-label={t.header.theme} className="grid grid-cols-3 gap-1 rounded-2xl border border-line bg-surface-2 p-1">
      {options.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={pref === value}
          onClick={() => setPref(value)}
          className={cn(
            'flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors',
            pref === value ? 'bg-surface text-fg shadow-card' : 'text-muted hover:text-fg',
          )}
        >
          <Icon aria-hidden="true" className="size-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
