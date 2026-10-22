import type { Advice, Severity } from '@ruko/engine';
import { ArrowRight, ExternalLink, Phone } from 'lucide-react';
import { verdictActions } from '../../shared/actions';
import { useI18n } from '../i18n';

/** Advice steps with big action buttons (Call 1930, cybercrime.gov.in, Chakshu). */
export function AdviceList({ advice, severity }: { advice: Advice[]; severity: Severity }) {
  const { t, locale } = useI18n();
  const actions = verdictActions(advice, severity, locale);
  if (!advice.length && !actions.length) return null;
  return (
    <section aria-labelledby="rk-advice" className="px-4 pt-4">
      <h3 id="rk-advice" className="rk-eyebrow">
        {t('whatToDoNow')}
      </h3>
      {advice.length ? (
        <ol className="mt-2 space-y-2.5">
          {advice.map((item) => (
            <li key={item.id} className="flex gap-2.5">
              <ArrowRight size={16} className={`mt-0.5 shrink-0 ${item.urgent ? 'text-[var(--danger-text)]' : 'text-[var(--indigo-text)]'}`} aria-hidden="true" />
              <div>
                <p className="text-[14px] font-semibold leading-snug">{item.title}</p>
                {item.detail ? <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--muted)]">{item.detail}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      ) : null}
      {actions.length ? (
        <div className="mt-3 grid gap-2">
          {actions.slice(0, 4).map((action, i) => {
            const tel = action.href.startsWith('tel:');
            return (
              <a
                key={action.href}
                href={action.href}
                target={tel ? undefined : '_blank'}
                rel="noopener noreferrer"
                className={`rk-btn min-h-12 w-full justify-start text-[15px] ${i === 0 ? 'rk-btn-primary' : 'rk-btn-quiet'}`}
              >
                {tel ? <Phone size={18} aria-hidden="true" /> : <ExternalLink size={18} aria-hidden="true" />}
                {action.label}
              </a>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
