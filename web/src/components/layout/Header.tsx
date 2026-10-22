import { useState } from 'react';
import { NavLink } from 'react-router';
import { LifeBuoy, Menu } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { common } from '@/i18n/common';
import { useT } from '@/i18n/core';
import { cn } from '@/lib/cn';
import { LanguageSwitch } from './LanguageSwitch';
import { MobileMenu } from './MobileMenu';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const t = useT(common);
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: '/', label: t.nav.check, end: true, cls: '' },
    { to: '/learn', label: t.nav.learn, cls: '' },
    { to: '/simulator', label: t.nav.simulator, cls: '' },
    { to: '/report', label: t.nav.report, cls: '' },
    { to: '/privacy', label: t.nav.privacy, cls: 'hidden xl:flex' },
    { to: '/about', label: t.nav.about, cls: 'hidden xl:flex' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-bg/95 pt-[env(safe-area-inset-top)] no-print">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label={t.nav.main} className="ml-6 hidden lg:block">
          <ul className="flex items-center gap-1">
            {links.map((link) => (
              <li key={link.to} className={link.cls}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    cn(
                      'relative flex h-10 items-center rounded-full px-3.5 text-[0.95rem] font-semibold transition-colors',
                      isActive ? 'bg-surface text-fg shadow-card' : 'text-muted hover:text-fg',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <NavLink
            to="/help"
            className={({ isActive }) =>
              cn(
                'hidden h-10 items-center gap-2 rounded-full border-2 px-4 text-sm font-bold transition-colors lg:inline-flex',
                isActive ? 'border-critical bg-critical-bg text-on-critical' : 'border-critical/40 text-critical hover:bg-critical-tint',
              )
            }
          >
            <LifeBuoy aria-hidden="true" className="size-4" />
            {t.nav.help}
          </NavLink>
          <LanguageSwitch />
          <ThemeToggle className="hidden sm:grid" />
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full text-fg hover:bg-surface-2 lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label={t.header.menu}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            data-testid="menu-button"
          >
            <Menu aria-hidden="true" className="size-6" />
          </button>
        </div>
      </div>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
