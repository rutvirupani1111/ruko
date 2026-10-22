import type { ReactNode } from 'react';
import { AtSign, BadgeCheck, Link2, Phone, QrCode, Users, Wallet } from 'lucide-react';
import type { Entities } from '@ruko/engine';
import { checkStrings } from '@/features/check/strings';
import { formatInr, useLocale, useT } from '@/i18n/core';
import { cn } from '@/lib/cn';
import { COMMUNITY_THRESHOLD, communityKey, type CommunityHit } from '@/lib/community';
import { SeverityChip } from './SeverityChip';
import { severityOf } from './severity';

interface EntityListProps {
  entities: Entities;
  community: Map<string, CommunityHit>;
}

function CommunityNote({ hit }: { hit?: CommunityHit }) {
  const t = useT(checkStrings);
  if (!hit || hit.reports < COMMUNITY_THRESHOLD) return null;
  return (
    <p className="mt-2 flex items-start gap-2 rounded-xl bg-accent-tint px-3 py-2 text-sm text-fg" data-testid="community-note">
      <Users aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
      <span>
        <strong className="font-semibold">{t.community.reportedBy(hit.reports)}</strong>
        <span className="text-muted"> · {t.community.notVerified}</span>
      </span>
    </p>
  );
}

/** Mini-verdict for one link, UPI ID or number. Low risk is shown neutrally, never as "safe". */
function RiskChip({ risk }: { risk: number }) {
  const t = useT(checkStrings);
  const severity = severityOf(risk);
  if (severity === 'safe') {
    return <span className="inline-flex rounded-full bg-surface-2 px-2 py-0.5 text-xs font-semibold text-muted">{t.entities.notFlagged}</span>;
  }
  return <SeverityChip severity={severity} size="sm" />;
}

function Row({ icon, title, chip, children }: { icon: ReactNode; title: ReactNode; chip?: ReactNode; children?: ReactNode }) {
  return (
    <li className="rounded-2xl border border-line bg-surface p-3.5">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-surface-2 text-muted [&_svg]:size-4">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <span className="min-w-0 font-semibold break-all text-fg">{title}</span>
            {chip}
          </div>
          {children}
        </div>
      </div>
    </li>
  );
}

function Reasons({ reasons }: { reasons: string[] }) {
  if (!reasons.length) return null;
  return (
    <ul className="mt-1.5 space-y-1 text-sm leading-relaxed text-muted">
      {reasons.slice(0, 4).map((r, i) => (
        <li key={i} className="flex gap-2">
          <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-line-strong" />
          <span>{r}</span>
        </li>
      ))}
    </ul>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section>
      <h4 className="mb-2 text-sm font-semibold text-muted">{label}</h4>
      <ul className="space-y-2">{children}</ul>
    </section>
  );
}

/** Links, UPI IDs, payment requests, numbers, emails and amounts, each with its own mini-verdict. */
export function EntityList({ entities, community }: EntityListProps) {
  const t = useT(checkStrings);
  const { locale } = useLocale();
  const { urls, upiIds, upiRequests, phones, emails, amounts } = entities;
  const empty = !urls.length && !upiIds.length && !upiRequests.length && !phones.length && !emails.length && !amounts.length;
  if (empty) return null;

  return (
    <div className="space-y-5" data-testid="entities">
      {upiRequests.length > 0 ? (
        <Group label={t.entities.upiRequests}>
          {upiRequests.map((r, i) => (
            <li key={`req-${i}`} className="rounded-2xl border-2 border-danger/50 bg-danger-tint p-4">
              <div className="flex items-start gap-3">
                <QrCode aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-danger" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-fg">
                    {t.entities.payTo}{' '}
                    <span className="break-all">{r.payeeName ? `${r.payeeName} (${r.payee})` : r.payee}</span>
                  </p>
                  <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
                    {typeof r.amount === 'number' ? (
                      <>
                        <dt className="text-muted">{t.entities.amount}</dt>
                        <dd className="num font-semibold">{formatInr(r.amount, locale)}</dd>
                      </>
                    ) : null}
                    {r.note ? (
                      <>
                        <dt className="text-muted">{t.entities.note}</dt>
                        <dd className="break-words">“{r.note}”</dd>
                      </>
                    ) : null}
                  </dl>
                  <p className="mt-2 text-sm font-semibold text-danger">{t.entities.payWarning}</p>
                  <Reasons reasons={r.reasons} />
                  <CommunityNote hit={community.get(communityKey('upi', r.payee))} />
                </div>
              </div>
            </li>
          ))}
        </Group>
      ) : null}

      {urls.length > 0 ? (
        <Group label={t.entities.links}>
          {urls.map((u, i) => (
            <Row
              key={`url-${i}`}
              icon={u.official ? <BadgeCheck /> : <Link2 />}
              title={u.registrableDomain || u.host || u.url}
              chip={
                u.official ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-safe-tint px-2 py-0.5 text-xs font-semibold text-safe">
                    <BadgeCheck aria-hidden="true" className="size-3.5" />
                    {t.entities.official}
                  </span>
                ) : (
                  <RiskChip risk={u.risk} />
                )
              }
            >
              <p className="mt-0.5 truncate font-mono text-xs text-subtle" title={u.url}>
                {u.url}
              </p>
              {u.impersonates ? <p className="mt-1.5 text-sm font-semibold text-danger">{t.entities.impersonates(u.impersonates)}</p> : null}
              {u.shortener ? <p className="mt-1 text-sm text-caution">{t.entities.shortener}</p> : null}
              <Reasons reasons={u.reasons} />
              <CommunityNote
                hit={community.get(communityKey(u.shortener ? 'url' : 'domain', u.shortener ? u.url : u.registrableDomain))}
              />
            </Row>
          ))}
        </Group>
      ) : null}

      {upiIds.length > 0 ? (
        <Group label={t.entities.upi}>
          {upiIds.map((u, i) => (
            <Row key={`upi-${i}`} icon={<Wallet />} title={u.vpa} chip={<RiskChip risk={u.risk} />}>
              <p className="mt-0.5 text-sm text-subtle">
                {t.entities.app}: {u.app ?? t.entities.unknownApp}
              </p>
              <Reasons reasons={u.reasons} />
              <CommunityNote hit={community.get(communityKey('upi', u.vpa))} />
            </Row>
          ))}
        </Group>
      ) : null}

      {phones.length > 0 ? (
        <Group label={t.entities.phones}>
          {phones.map((p, i) => (
            <Row
              key={`ph-${i}`}
              icon={<Phone />}
              title={<span className="num">{p.e164 || p.raw}</span>}
              chip={<RiskChip risk={p.risk} />}
            >
              <p className="mt-0.5 text-sm text-subtle">
                {t.entities.phoneKinds[p.kind ?? 'unknown']}
                {p.country && p.country !== 'IN' ? ` · ${t.entities.country(p.country)}` : ''}
              </p>
              <Reasons reasons={p.reasons} />
              <CommunityNote hit={community.get(communityKey('phone', p.e164 || p.raw))} />
            </Row>
          ))}
        </Group>
      ) : null}

      {emails.length > 0 ? (
        <Group label={t.entities.emails}>
          {emails.map((e, i) => (
            <Row key={`em-${i}`} icon={<AtSign />} title={e}>
              <CommunityNote hit={community.get(communityKey('email', e))} />
            </Row>
          ))}
        </Group>
      ) : null}

      {amounts.length > 0 ? (
        <section>
          <h4 className="mb-2 text-sm font-semibold text-muted">{t.entities.amounts}</h4>
          <ul className="flex flex-wrap gap-2">
            {amounts.slice(0, 8).map((a, i) => (
              <li
                key={`amt-${i}`}
                className={cn('num inline-flex items-center rounded-full border border-line bg-surface px-3 py-1 text-sm font-semibold')}
              >
                {a.currency === 'INR' ? formatInr(a.value, locale) : a.text}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
