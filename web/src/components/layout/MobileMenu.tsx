import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router';
import { BookOpen, Flag, Gamepad2, Info, LifeBuoy, Lock, ShieldCheck, X } from 'lucide-react';
import { common } from '@/i18n/common';
import { useT } from '@/i18n/core';
import { cn } from '@/lib/cn';
import { LanguageSwitch } from './LanguageSwitch';
import { ThemePicker } from './ThemeToggle';

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT(common);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const links = [
    { to: '/', label: t.nav.check, Icon: ShieldCheck, end: true },
    { to: '/learn', label: t.nav.learn, Icon: BookOpen },
    { to: '/simulator', label: t.nav.simulator, Icon: Gamepad2 },
    { to: '/help', label: t.nav.help, Icon: LifeBuoy },
    { to: '/report', label: t.nav.report, Icon: Flag },
    { to: '/privacy', label: t.nav.privacy, Icon: Lock },
    { to: '/about', label: t.nav.about, Icon: Info },
  ];

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-label={t.header.menu}
      className="mt-0 mr-0 ml-auto h-dvh max-h-none w-[min(22rem,88vw)] max-w-none bg-bg p-0 text-fg shadow-lift open:animate-[sheet-in_220ms_var(--ease-snappy)]"
    >
      <div className="flex h-full flex-col px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold tracking-wide text-muted uppercase">{t.header.menu}</span>
          <button
            type="button"
            onClick={onClose}
            className="grid size-11 place-items-center rounded-full hover:bg-surface-2"
            aria-label={t.header.closeMenu}
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <nav aria-label={t.nav.main} className="mt-4">
          <ul className="space-y-1">
            {links.map(({ to, label, Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex h-12 items-center gap-3 rounded-2xl px-3 text-[1.05rem] font-semibold transition-colors',
                      isActive ? 'bg-surface text-fg shadow-card' : 'text-muted hover:bg-surface-2 hover:text-fg',
                      to === '/help' && 'text-critical',
                    )
                  }
                >
                  <Icon aria-hidden="true" className="size-5" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto space-y-4 pt-6">
          <div>
            <p className="mb-2 text-sm font-semibold text-muted">{t.header.language}</p>
            <LanguageSwitch />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-muted">{t.header.theme}</p>
            <ThemePicker />
          </div>
        </div>
      </div>
    </dialog>
  );
}
