import { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, ArrowRight, CircleCheck, Gamepad2, LifeBuoy, PhoneCall, ShieldCheck, TriangleAlert } from 'lucide-react';
import { CATEGORIES } from '@ruko/engine';
import { ButtonLink, ButtonRouterLink } from '@/components/ui/Button';
import { OfficialActions } from '@/components/verdict/AdviceList';
import { SeverityChip } from '@/components/verdict/SeverityChip';
import { atLeast } from '@/components/verdict/severity';
import { config } from '@/config';
import { common } from '@/i18n/common';
import { useLocale, useT } from '@/i18n/core';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { CategoryArt } from './categoryArt';
import { localize, orderedCategories } from './data';
import { learnStrings } from './strings';

export default function CategoryPage() {
  const t = useT(learnStrings);
  const c = useT(common);
  const { locale } = useLocale();
  const { category = '' } = useParams();

  const list = useMemo(() => orderedCategories(CATEGORIES), []);
  const index = list.findIndex((x) => x.id === category);
  const info = index >= 0 ? localize(list[index]!, locale) : null;
  const prev = index > 0 ? localize(list[index - 1]!, locale) : null;
  const next = index >= 0 && index < list.length - 1 ? localize(list[index + 1]!, locale) : null;

  useDocumentTitle(info ? `${info.name} · ${t.breadcrumb}` : t.notFound);

  if (!info) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="display text-3xl">{t.notFound}</h1>
        <ButtonRouterLink to="/learn" variant="primary" size="lg" className="mt-8">
          {t.allTypes}
        </ButtonRouterLink>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-6xl px-4 pt-6 pb-20 sm:px-6 sm:pt-10 lg:px-8" data-testid="category-page" data-category={info.id}>
      <nav aria-label="Breadcrumb" className="text-sm">
        <Link to="/learn" className="inline-flex items-center gap-1.5 font-semibold text-accent underline-offset-4 hover:underline">
          <ArrowLeft aria-hidden="true" className="size-4" />
          {t.breadcrumb}
        </Link>
      </nav>

      <header className="mt-5 grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_20rem] md:gap-10">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <span>{t.typical}:</span>
            <SeverityChip severity={info.severity} size="sm" />
          </div>
          <h1 className="display mt-3 text-[2.4rem] sm:text-6xl">{info.name}</h1>
          <p lang={info.altLang} className={`mt-1 text-lg font-semibold text-subtle ${info.altLang === 'hi' ? 'font-deva' : ''}`}>
            {info.altName}
          </p>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{info.short}</p>
        </div>
        <CategoryArt id={info.id} size="lg" className="rounded-[1.75rem] border border-line" />
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="space-y-12">
          {info.howItWorks.length ? (
            <section aria-labelledby="how">
              <h2 id="how" className="display text-2xl sm:text-3xl">
                {t.howItWorks}
              </h2>
              <ol className="relative mt-6 space-y-5 before:absolute before:top-3 before:bottom-3 before:left-[1.05rem] before:w-0.5 before:bg-line">
                {info.howItWorks.map((step, i) => (
                  <li key={i} className="relative flex gap-4">
                    <span className="num relative z-10 grid size-9 shrink-0 place-items-center rounded-full border-2 border-line-strong bg-bg text-sm font-bold text-fg">
                      {i + 1}
                    </span>
                    <div className="pt-1.5">
                      <p className="sr-only">{t.step(i + 1)}</p>
                      <p className="text-[1.05rem] leading-relaxed text-fg">{step}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {info.redFlags.length ? (
            <section aria-labelledby="flags">
              <h2 id="flags" className="display flex items-center gap-2 text-2xl sm:text-3xl">
                <TriangleAlert aria-hidden="true" className="size-7 text-danger" />
                {t.redFlags}
              </h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {info.redFlags.map((flag, i) => (
                  <li key={i} className="rounded-2xl border border-line bg-surface p-4 leading-relaxed">
                    <span className="hl hl-danger" style={{ ['--i' as string]: i }}>
                      {flag}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {info.whatToDo.length ? (
            <section aria-labelledby="todo">
              <h2 id="todo" className="display flex items-center gap-2 text-2xl sm:text-3xl">
                <ShieldCheck aria-hidden="true" className="size-7 text-safe" />
                {t.whatToDo}
              </h2>
              <ul className="mt-6 space-y-3">
                {info.whatToDo.map((item, i) => (
                  <li key={i} className="flex gap-3 rounded-2xl bg-safe-tint p-4">
                    <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-safe" />
                    <span className="leading-relaxed text-fg">{item}</span>
                  </li>
                ))}
              </ul>
              {atLeast(info.severity, 'high') ? (
                <div className="mt-6">
                  <OfficialActions />
                </div>
              ) : null}
            </section>
          ) : null}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[1.4rem] border border-line bg-surface p-5 shadow-card">
            <h2 className="display text-xl">{t.checkTitle}</h2>
            <p className="mt-2 leading-relaxed text-muted">{t.checkBody}</p>
            <ButtonRouterLink to="/" variant="primary" size="md" className="mt-4">
              <ShieldCheck aria-hidden="true" />
              {t.checkCta}
            </ButtonRouterLink>
          </div>
          <div className="rounded-[1.4rem] bg-accent-tint p-5">
            <h2 className="display text-xl">{t.practice}</h2>
            <p className="mt-2 leading-relaxed text-muted">{t.practiceBody}</p>
            <ButtonRouterLink to="/simulator" variant="accent" size="md" className="mt-4">
              <Gamepad2 aria-hidden="true" />
              {t.play}
            </ButtonRouterLink>
          </div>
          <div className="rounded-[1.4rem] bg-critical-tint p-5">
            <h2 className="display flex items-center gap-2 text-xl">
              <LifeBuoy aria-hidden="true" className="size-5 text-critical" />
              {t.lostMoney}
            </h2>
            <p className="mt-2 leading-relaxed text-muted">{t.lostMoneyBody}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <ButtonLink href={config.official.helplineHref} variant="critical" size="md">
                <PhoneCall aria-hidden="true" />
                {c.actions.call1930}
              </ButtonLink>
              <ButtonRouterLink to="/help" variant="secondary" size="md">
                {c.nav.help}
              </ButtonRouterLink>
            </div>
          </div>
        </aside>
      </div>

      {(prev || next) && (
        <nav aria-label={t.breadcrumb} className="mt-16 grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
          {prev ? (
            <Link to={`/learn/${prev.id}`} className="group rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-line-strong">
              <span className="flex items-center gap-1.5 text-sm text-muted">
                <ArrowLeft aria-hidden="true" className="size-4" />
                {t.prev}
              </span>
              <span className="mt-1 block font-display text-lg font-bold">{prev.name}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link to={`/learn/${next.id}`} className="group rounded-2xl border border-line bg-surface p-4 text-right transition-colors hover:border-line-strong">
              <span className="flex items-center justify-end gap-1.5 text-sm text-muted">
                {t.next}
                <ArrowRight aria-hidden="true" className="size-4" />
              </span>
              <span className="mt-1 block font-display text-lg font-bold">{next.name}</span>
            </Link>
          ) : null}
        </nav>
      )}
    </article>
  );
}
