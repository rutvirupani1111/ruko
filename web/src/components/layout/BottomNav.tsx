import { NavLink } from 'react-router';
import { BookOpen, Gamepad2, LifeBuoy, ShieldCheck } from 'lucide-react';
import { common } from '@/i18n/common';
import { useT } from '@/i18n/core';
import { cn } from '@/lib/cn';

/** Thumb-reach tab bar for phones. Hidden from lg upwards where the header has the links. */
export function BottomNav() {
  const t = useT(common);
  const items = [
    { to: '/', label: t.nav.short.check, Icon: ShieldCheck, end: true, critical: false },
    { to: '/learn', label: t.nav.short.learn, Icon: BookOpen, end: false, critical: false },
    { to: '/simulator', label: t.nav.short.simulator, Icon: Gamepad2, end: false, critical: false },
    { to: '/help', label: t.nav.short.help, Icon: LifeBuoy, end: false, critical: true },
  ];
  return (
    <nav
      aria-label={t.nav.main}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/97 pb-[env(safe-area-inset-bottom)] lg:hidden no-print"
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-4">
        {items.map(({ to, label, Icon, end, critical }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex h-full flex-col items-center justify-center gap-1 text-[0.78rem] font-semibold transition-colors',
                  isActive ? (critical ? 'text-critical' : 'text-fg') : critical ? 'text-critical/80' : 'text-subtle',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'grid h-7 w-12 place-items-center rounded-full transition-colors duration-200',
                      isActive && (critical ? 'bg-critical-tint' : 'bg-brand-tint'),
                    )}
                  >
                    <Icon aria-hidden="true" className="size-[1.3rem]" strokeWidth={isActive ? 2.4 : 2} />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
