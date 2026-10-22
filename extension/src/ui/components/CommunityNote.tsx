import type { Verdict } from '@ruko/engine';
import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { communityQueries, isShowable } from '../../shared/community';
import { formatNumber } from '../../shared/i18n/format';
import { send, type CommunityResult } from '../../shared/messages';
import { useI18n } from '../i18n';

/** "Reported by N people" (N >= 3), only when the user turned community lookups on. */
export function CommunityNote({ verdict, enabled }: { verdict: Verdict; enabled: boolean }) {
  const { t, locale } = useI18n();
  const [top, setTop] = useState<CommunityResult | null>(null);

  useEffect(() => {
    setTop(null);
    if (!enabled) return;
    const queries = communityQueries(verdict);
    if (!queries.length) return;
    let alive = true;
    send<'community'>({ type: 'community', queries })
      .then(({ results }) => {
        if (!alive) return;
        const shown = results.filter((r) => isShowable(r.reports)).sort((a, b) => b.reports - a.reports);
        setTop(shown[0] ?? null);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [verdict, enabled]);

  if (!top) return null;
  return (
    <p className="mx-4 mt-4 flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded-xl bg-indigo/10 px-3 py-2 text-[13.5px]" role="note">
      <Users size={15} aria-hidden="true" className="text-[var(--indigo-text)]" />
      <span className="font-semibold">{t('communityReports', { count: formatNumber(top.reports, locale) })}</span>
      <span className="text-[12.5px] text-[var(--muted)]">{t('communityNote')}</span>
    </p>
  );
}
