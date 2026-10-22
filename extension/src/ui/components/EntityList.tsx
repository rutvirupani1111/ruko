import type { Entities } from '@ruko/engine';
import { AtSign, IndianRupee, Link2, Phone, QrCode, ShieldCheck, Wallet } from 'lucide-react';
import type { ReactNode } from 'react';
import { formatRupees } from '../../shared/i18n/format';
import { displayUrl } from '../../shared/url';
import { useI18n } from '../i18n';
import { RiskPill } from './Chips';

function Row({ icon, main, tags, reason, risk, official }: { icon: ReactNode; main: ReactNode; tags?: ReactNode; reason?: string; risk?: number; official?: boolean }) {
  return (
    <li className="flex gap-3 py-2.5">
      <span className="mt-0.5 text-[var(--muted)]" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="min-w-0 break-all font-mono text-[13px]">{main}</span>
          {tags}
        </div>
        {reason ? <p className="mt-0.5 text-[13px] leading-snug text-[var(--muted)]">{reason}</p> : null}
      </div>
      {risk !== undefined ? <RiskPill risk={risk} official={official} /> : null}
    </li>
  );
}

function Tag({ children, tone }: { children: ReactNode; tone: 'good' | 'bad' | 'neutral' }) {
  const cls =
    tone === 'good'
      ? 'bg-safe/15 text-[var(--safe-text)]'
      : tone === 'bad'
        ? 'bg-danger/12 text-[var(--danger-text)]'
        : 'bg-[var(--surface-2)] text-[var(--muted)]';
  return <span className={`rounded-md px-1.5 py-0.5 text-[11.5px] font-semibold ${cls}`}>{children}</span>;
}

/** Links, UPI IDs, numbers and amounts found in the text, each with its own mini verdict. */
export function EntityList({ entities }: { entities: Entities }) {
  const { t, locale } = useI18n();
  const groups: Array<{ key: string; title: string; rows: ReactNode[] }> = [
    {
      key: 'urls',
      title: t('linksLabel'),
      rows: entities.urls.map((u, i) => (
        <Row
          key={`u${i}`}
          icon={u.official ? <ShieldCheck size={16} /> : <Link2 size={16} />}
          main={displayUrl(u.url, 64)}
          risk={u.risk}
          official={u.official}
          reason={u.reasons[0]}
          tags={
            <>
              {u.official ? <Tag tone="good">{t('officialSite')}</Tag> : null}
              {u.impersonates && !u.official ? <Tag tone="bad">{t('imitates', { brand: u.impersonates })}</Tag> : null}
              {u.shortener ? <Tag tone="neutral">{t('shortLink')}</Tag> : null}
            </>
          }
        />
      )),
    },
    {
      key: 'upi',
      title: t('upiLabel'),
      rows: entities.upiIds.map((u, i) => (
        <Row key={`v${i}`} icon={<Wallet size={16} />} main={u.vpa} risk={u.risk} reason={u.reasons[0]} tags={u.app ? <Tag tone="neutral">{u.app}</Tag> : null} />
      )),
    },
    {
      key: 'upiRequests',
      title: t('upiRequestsLabel'),
      rows: entities.upiRequests.map((r, i) => (
        <Row
          key={`r${i}`}
          icon={<QrCode size={16} />}
          main={r.payeeName ? `${r.payeeName} (${r.payee})` : r.payee}
          risk={r.risk}
          reason={r.reasons[0]}
          tags={r.amount ? <Tag tone="bad">{formatRupees(r.amount, locale)}</Tag> : null}
        />
      )),
    },
    {
      key: 'phones',
      title: t('phonesLabel'),
      rows: entities.phones.map((p, i) => (
        <Row key={`p${i}`} icon={<Phone size={16} />} main={p.e164 || p.raw} risk={p.risk} reason={p.reasons[0]} tags={p.country && p.country !== 'IN' ? <Tag tone="bad">{p.country}</Tag> : null} />
      )),
    },
    {
      key: 'emails',
      title: t('emailsLabel'),
      rows: entities.emails.map((e, i) => <Row key={`e${i}`} icon={<AtSign size={16} />} main={e} />),
    },
    {
      key: 'amounts',
      title: t('amountsLabel'),
      rows: entities.amounts.slice(0, 6).map((a, i) => (
        <Row key={`a${i}`} icon={<IndianRupee size={16} />} main={a.currency === 'INR' ? formatRupees(a.value, locale) : a.text} />
      )),
    },
  ].filter((g) => g.rows.length > 0);

  if (!groups.length) return null;
  return (
    <section aria-labelledby="rk-entities" className="px-4 pt-4">
      <h3 id="rk-entities" className="rk-eyebrow">
        {t('foundInText')}
      </h3>
      {groups.map((group) => (
        <div key={group.key} className="mt-2">
          <h4 className="text-[13px] font-semibold text-[var(--muted)]">{group.title}</h4>
          <ul className="divide-y divide-[var(--border)]">{group.rows}</ul>
        </div>
      ))}
    </section>
  );
}
