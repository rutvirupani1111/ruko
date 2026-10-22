import { ChevronRight, ExternalLink, Flag, Landmark, PhoneCall, Siren } from 'lucide-react';
import type { Advice, Severity } from '@ruko/engine';
import { ButtonLink } from '@/components/ui/Button';
import { config } from '@/config';
import { common } from '@/i18n/common';
import { useT } from '@/i18n/core';
import { cn } from '@/lib/cn';
import { atLeast } from './severity';

type OfficialKind = 'call' | 'cyber' | 'chakshu';

export function officialKind(href: string): OfficialKind | null {
  const h = href.toLowerCase();
  if (h === 'tel:1930') return 'call';
  if (h.includes('cybercrime.gov.in')) return 'cyber';
  if (h.includes('sancharsaathi.gov.in')) return 'chakshu';
  return null;
}

export function isOfficialHref(href: string): boolean {
  return officialKind(href) !== null;
}

const isExternal = (href: string) => /^https?:\/\//i.test(href);

/** The three big actions: Call 1930, report at cybercrime.gov.in, report on Chakshu. */
export function OfficialActions() {
  const t = useT(common);
  return (
    <div className="@container">
      <div className="grid gap-2.5 @2xl:grid-cols-3" data-testid="official-actions">
        <ButtonLink href={config.official.helplineHref} variant="critical" size="lg" block>
          <PhoneCall aria-hidden="true" />
          {t.actions.call1930}
        </ButtonLink>
        <ButtonLink href={config.official.cybercrime} variant="secondary" size="lg" block external newTabLabel={t.actions.opensNewTab}>
          <Landmark aria-hidden="true" />
          {t.actions.reportCyber}
        </ButtonLink>
        <ButtonLink href={config.official.chakshu} variant="secondary" size="lg" block external newTabLabel={t.actions.opensNewTab}>
          <Flag aria-hidden="true" />
          {t.actions.chakshu}
        </ButtonLink>
      </div>
    </div>
  );
}

/**
 * The engine's advice in its own order. Items that point to the official
 * channels (1930, cybercrime.gov.in, Chakshu) get big action buttons; if the
 * engine gave none for a risky verdict, the three buttons are added anyway.
 */
export function AdviceList({ advice, severity }: { advice: Advice[]; severity: Severity }) {
  const t = useT(common);
  const hasOfficial = advice.some((a) => a.action && isOfficialHref(a.action.href));
  const fallback = atLeast(severity, 'medium') && !hasOfficial;

  return (
    <div className="space-y-4" data-testid="advice">
      {advice.length > 0 ? (
        <ol className="space-y-2.5">
          {advice.map((item) => {
            const action = item.action;
            const kind = action ? officialKind(action.href) : null;
            const external = action ? isExternal(action.href) : false;
            const label =
              kind === 'call' ? t.actions.call1930 : kind === 'cyber' ? t.actions.reportCyber : kind === 'chakshu' ? t.actions.chakshu : action?.label;
            const Icon = kind === 'call' ? PhoneCall : kind === 'cyber' ? Landmark : kind === 'chakshu' ? Flag : null;
            return (
              <li
                key={item.id}
                className={cn(
                  'flex gap-3 rounded-2xl p-3.5',
                  item.urgent ? 'border-2 border-critical/30 bg-critical-tint' : 'border border-line bg-surface',
                )}
                data-advice={item.id}
              >
                {item.urgent ? (
                  <Siren aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-critical" />
                ) : (
                  <ChevronRight aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-snug text-fg">{item.title}</p>
                  {item.detail ? <p className="mt-1 text-[0.95rem] leading-relaxed text-muted">{item.detail}</p> : null}
                  {action ? (
                    <ButtonLink
                      href={action.href}
                      variant={kind === 'call' ? 'critical' : kind ? 'secondary' : 'secondary'}
                      size={kind ? 'lg' : 'md'}
                      className={cn('mt-3', kind && 'w-full @lg:w-auto')}
                      external={external}
                      newTabLabel={t.actions.opensNewTab}
                      data-official={kind ?? undefined}
                    >
                      {Icon ? <Icon aria-hidden="true" /> : null}
                      {label}
                      {external && !kind ? <ExternalLink aria-hidden="true" className="opacity-70" /> : null}
                    </ButtonLink>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      ) : null}
      {fallback ? <OfficialActions /> : null}
    </div>
  );
}
