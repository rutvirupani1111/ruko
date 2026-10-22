import { ExternalLink, LifeBuoy, Phone } from 'lucide-react';
import { LINKS } from '../../config';
import { useI18n } from '../i18n';

/** "Lost money or shared details?" emergency card with 1930, cybercrime.gov.in and Chakshu. */
export function HelpCard({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  return (
    <section className="rounded-2xl border border-danger/25 bg-danger/6 p-4" aria-labelledby="rk-help-title">
      <h2 id="rk-help-title" className="flex items-center gap-2 text-[15px] font-bold">
        <LifeBuoy size={18} className="text-[var(--danger-text)]" aria-hidden="true" />
        {t('helpTitle')}
      </h2>
      <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--muted)]">{t('helpBody')}</p>
      <div className={`mt-3 grid gap-2 ${compact ? '' : 'sm:grid-cols-3'}`}>
        <a href={LINKS.helpline} className="rk-btn rk-btn-primary">
          <Phone size={16} aria-hidden="true" />
          {t('call1930')}
        </a>
        <a href={LINKS.cybercrime} target="_blank" rel="noopener noreferrer" className="rk-btn rk-btn-quiet">
          <ExternalLink size={16} aria-hidden="true" />
          {t('reportCybercrime')}
        </a>
        <a href={LINKS.chakshu} target="_blank" rel="noopener noreferrer" className="rk-btn rk-btn-quiet">
          <ExternalLink size={16} aria-hidden="true" />
          {t('reportChakshu')}
        </a>
      </div>
    </section>
  );
}
