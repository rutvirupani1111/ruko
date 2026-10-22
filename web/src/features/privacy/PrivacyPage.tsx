import { useState } from 'react';
import { Ban, Check, Code2, Cpu, ExternalLink, ImageOff, UserX } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { apiEnabled, config } from '@/config';
import { common } from '@/i18n/common';
import { useT } from '@/i18n/core';
import { communityLookupsEnabled, setCommunityLookups } from '@/lib/community';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { KAnonDiagram, TryFingerprint } from './KAnonDiagram';
import { privacyStrings } from './strings';

const CARDS = [
  { key: 'engine', Icon: Cpu },
  { key: 'screenshots', Icon: ImageOff },
  { key: 'account', Icon: UserX },
] as const;

export default function PrivacyPage() {
  const t = useT(privacyStrings);
  const c = useT(common);
  useDocumentTitle(t.title);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-20 sm:px-6 sm:pt-10 lg:px-8">
      <header className="max-w-3xl">
        <p className="text-sm font-bold tracking-[0.16em] text-brand uppercase">{t.eyebrow}</p>
        <h1 className="display mt-3 text-[2.5rem] sm:text-6xl">{t.heading}</h1>
        <p className="mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-muted">{t.intro}</p>
      </header>

      <ul className="mt-8 grid gap-3 md:grid-cols-3">
        {CARDS.map(({ key, Icon }) => {
          const card = t.cards[key];
          return (
            <li key={key} className="rounded-[1.4rem] border border-line bg-surface p-5 shadow-card">
              <span className="grid size-11 place-items-center rounded-2xl bg-safe-tint text-safe">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <h2 className="mt-4 font-display text-xl font-bold leading-snug">{card.title}</h2>
              <p className="mt-1.5 leading-relaxed text-muted">{card.body}</p>
            </li>
          );
        })}
      </ul>

      <section aria-labelledby="kanon-title" className="mt-14">
        <div className="max-w-3xl">
          <h2 id="kanon-title" className="display text-3xl sm:text-4xl">
            {t.diagram.heading}
          </h2>
          <p className="mt-3 text-[1.05rem] leading-relaxed text-muted">{t.diagram.intro}</p>
        </div>
        <div className="mt-6">
          <KAnonDiagram />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <TryFingerprint />
          {apiEnabled ? <LookupToggle /> : null}
        </div>
      </section>

      <section aria-labelledby="server-title" className="mt-14">
        <h2 id="server-title" className="display text-3xl sm:text-4xl">
          {t.server.heading}
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.4rem] border border-line bg-surface p-5">
            <h3 className="text-xs font-bold tracking-[0.12em] text-muted uppercase">{t.server.keepsTitle}</h3>
            <ul className="mt-3 space-y-3">
              {t.server.keeps.map((item, i) => (
                <li key={i} className="flex gap-3 leading-relaxed">
                  <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-safe" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[1.4rem] border border-line bg-surface p-5">
            <h3 className="text-xs font-bold tracking-[0.12em] text-muted uppercase">{t.server.neverTitle}</h3>
            <ul className="mt-3 space-y-3">
              {t.server.never.map((item, i) => (
                <li key={i} className="flex gap-3 leading-relaxed">
                  <Ban aria-hidden="true" className="mt-1 size-4 shrink-0 text-danger" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-4 max-w-3xl leading-relaxed text-muted">{t.server.reports}</p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-subtle">{t.server.hosting}</p>
      </section>

      <section className="mt-14 flex flex-col gap-5 rounded-[1.6rem] bg-ink p-6 text-paper sm:flex-row sm:items-center sm:justify-between sm:p-8 dark:bg-surface-2 dark:text-fg">
        <div className="flex gap-4">
          <Code2 aria-hidden="true" className="mt-1 size-7 shrink-0 text-saffron" />
          <div>
            <h2 className="font-display text-2xl font-bold">{t.open.title}</h2>
            <p className="mt-1.5 max-w-xl leading-relaxed text-paper/80 dark:text-muted">{t.open.body}</p>
          </div>
        </div>
        <ButtonLink
          href={config.repo.url}
          variant="primary"
          size="lg"
          external
          newTabLabel={c.actions.opensNewTab}
          className="self-start sm:self-center"
        >
          {t.open.cta}
          <ExternalLink aria-hidden="true" className="opacity-70" />
        </ButtonLink>
      </section>
    </div>
  );
}

function LookupToggle() {
  const t = useT(privacyStrings).toggle;
  const [on, setOn] = useState(communityLookupsEnabled);
  return (
    <label className="flex cursor-pointer items-start gap-4 rounded-[1.4rem] border border-line bg-surface p-4 shadow-card sm:p-5">
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input
          type="checkbox"
          role="switch"
          checked={on}
          onChange={(e) => {
            setOn(e.target.checked);
            setCommunityLookups(e.target.checked);
          }}
          className="peer sr-only"
          data-testid="lookups-toggle"
        />
        <span className="h-7 w-12 rounded-full bg-line-strong transition-colors peer-checked:bg-safe-bg peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--focus)]" />
        <span className="absolute top-1 left-1 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
      <span>
        <span className="block font-bold">{t.title}</span>
        <span className="mt-0.5 block text-sm leading-relaxed text-muted" aria-live="polite">
          {on ? t.on : t.off}
        </span>
      </span>
    </label>
  );
}
