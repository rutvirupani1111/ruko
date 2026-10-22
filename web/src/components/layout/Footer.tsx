import { Link } from 'react-router';
import { PhoneCall } from 'lucide-react';
import { Mark } from '@/components/brand/Mark';
import { config } from '@/config';
import { common } from '@/i18n/common';
import { useLocale, useT } from '@/i18n/core';

export function Footer() {
  const t = useT(common);
  const { locale } = useLocale();
  const explore = [
    { to: '/', label: t.nav.check },
    { to: '/learn', label: t.nav.learn },
    { to: '/simulator', label: t.nav.simulator },
    { to: '/help', label: t.nav.help },
    { to: '/report', label: t.nav.report },
    { to: '/privacy', label: t.nav.privacy },
    { to: '/about', label: t.nav.about },
  ];
  const helplines = [
    { href: config.official.helplineHref, label: '1930', external: false },
    { href: config.official.cybercrime, label: 'cybercrime.gov.in', external: true },
    { href: config.official.chakshu, label: locale === 'hi' ? 'चक्षु (संचार साथी)' : 'Chakshu (Sanchar Saathi)', external: true },
    { href: config.official.ceir, label: locale === 'hi' ? 'CEIR: खोया फ़ोन ब्लॉक करें' : 'CEIR: block a lost phone', external: true },
  ];

  return (
    <footer className="mt-auto border-t border-line bg-surface-2/60 pb-24 lg:pb-0 no-print">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <Mark size={40} />
            <div>
              <p className="font-display text-2xl font-extrabold">Ruko</p>
              <p className="text-sm font-semibold text-muted">
                {t.brand.tagline}
                {locale === 'en' ? (
                  <span lang="hi" className="mt-0.5 block font-deva">
                    {t.brand.taglineHi}
                  </span>
                ) : null}
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">{t.footer.guidance}</p>
          <p className="mt-3 max-w-sm text-sm font-semibold leading-relaxed text-fg">{t.footer.neverAsks}</p>
          <a
            href={config.official.helplineHref}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-critical-bg px-5 text-sm font-bold text-on-critical"
          >
            <PhoneCall aria-hidden="true" className="size-4" />
            {t.footer.lostMoney}
          </a>
        </div>
        <nav aria-labelledby="footer-explore">
          <h2 id="footer-explore" className="text-xs font-bold tracking-[0.14em] text-muted uppercase">
            {t.footer.explore}
          </h2>
          <ul className="mt-4 space-y-2.5">
            {explore.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-[0.95rem] font-medium text-fg underline-offset-4 hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="text-xs font-bold tracking-[0.14em] text-muted uppercase">{t.footer.helplines}</h2>
          <ul className="mt-4 space-y-2.5">
            {helplines.map((h) => (
              <li key={h.href}>
                <a
                  href={h.href}
                  {...(h.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="text-[0.95rem] font-medium text-fg underline-offset-4 hover:underline"
                >
                  {h.label}
                  {h.external ? <span className="sr-only"> {t.actions.opensNewTab}</span> : null}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-xs text-subtle sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p>{t.footer.notAffiliated}</p>
          <p>{t.footer.madeIn}</p>
        </div>
      </div>
    </footer>
  );
}
