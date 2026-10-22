import { ArrowRight, ExternalLink, PhoneCall, ShieldCheck } from 'lucide-react';
import { Mark } from '@/components/brand/Mark';
import { ButtonLink, ButtonRouterLink } from '@/components/ui/Button';
import { config } from '@/config';
import { common } from '@/i18n/common';
import { defineStrings, useT } from '@/i18n/core';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

const strings = defineStrings(
  {
    soon: 'Coming soon',
    meanwhile: 'In the meantime',
    check: 'Check a message',
    cyber: 'Report at cybercrime.gov.in',
  },
  {
    soon: 'जल्द आ रहा है',
    meanwhile: 'तब तक',
    check: 'मैसेज जाँचें',
    cyber: 'cybercrime.gov.in पर शिकायत करें',
  },
);

/** A finished-looking placeholder for pages that are planned but not built yet. */
export function ComingSoon({ title, body }: { title: string; body: string }) {
  const t = useT(strings);
  const c = useT(common);
  useDocumentTitle(title);
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 pb-24 sm:px-6 sm:pt-16">
      <div className="relative overflow-hidden rounded-[2rem] border border-line bg-surface p-8 shadow-card sm:p-12">
        <div aria-hidden="true" className="pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-brand-bg/15 blur-3xl" />
        <Mark size={56} animate />
        <p className="relative mt-6 inline-flex rounded-full bg-brand-tint px-3 py-1 text-sm font-bold text-brand">{t.soon}</p>
        <h1 className="display relative mt-4 text-4xl sm:text-5xl">{title}</h1>
        <p className="relative mt-4 max-w-xl text-[1.05rem] leading-relaxed text-muted">{body}</p>
        <p className="relative mt-8 text-sm font-semibold tracking-wide text-subtle uppercase">{t.meanwhile}</p>
        <div className="relative mt-3 flex flex-wrap gap-3">
          <ButtonRouterLink to="/" variant="primary" size="lg">
            <ShieldCheck aria-hidden="true" />
            {t.check}
            <ArrowRight aria-hidden="true" />
          </ButtonRouterLink>
          <ButtonLink href={config.official.cybercrime} variant="secondary" size="lg" external newTabLabel={c.actions.opensNewTab}>
            {t.cyber}
            <ExternalLink aria-hidden="true" className="opacity-70" />
          </ButtonLink>
          <ButtonLink href={config.official.helplineHref} variant="critical" size="lg">
            <PhoneCall aria-hidden="true" />
            {c.actions.call1930}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
