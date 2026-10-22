import { useDeferredValue, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Search, X } from 'lucide-react';
import { CATEGORIES } from '@ruko/engine';
import { SeverityChip } from '@/components/verdict/SeverityChip';
import { useLocale, useT } from '@/i18n/core';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { CategoryArt } from './categoryArt';
import { localize, matches, orderedCategories } from './data';
import { learnStrings } from './strings';

export default function LearnPage() {
  const t = useT(learnStrings);
  const { locale } = useLocale();
  useDocumentTitle(t.title);
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query);

  const all = useMemo(() => orderedCategories(CATEGORIES).map((c) => localize(c, locale)), [locale]);
  const visible = useMemo(() => (deferred.trim() ? all.filter((c) => matches(c, deferred)) : all), [all, deferred]);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-20 sm:px-6 sm:pt-12 lg:px-8">
      <header className="max-w-3xl">
        <p className="text-sm font-bold tracking-[0.16em] text-brand uppercase">{t.eyebrow}</p>
        <h1 className="display mt-3 text-[2.5rem] sm:text-6xl">{t.heading}</h1>
        <p className="mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-muted">{t.sub}</p>
      </header>

      <div className="sticky top-16 z-20 -mx-4 mt-8 bg-bg/95 px-4 py-3 sm:mx-0 sm:px-0">
        <label htmlFor="learn-search" className="sr-only">
          {t.searchLabel}
        </label>
        <div className="relative max-w-xl">
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-subtle" />
          <input
            id="learn-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            autoComplete="off"
            className="h-13 w-full rounded-full border border-line-strong bg-field pr-12 pl-12 text-[1.02rem] text-fg shadow-card outline-none placeholder:text-subtle focus:border-brand-bg focus:shadow-[0_0_0_4px_rgb(255_122_26/0.18)] [&::-webkit-search-cancel-button]:hidden"
            data-testid="learn-search"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-surface-2"
              aria-label={t.clearSearch}
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          ) : null}
        </div>
        <p className="mt-2 text-sm text-subtle" role="status" aria-live="polite">
          {all.length ? t.count(visible.length) : ''}
        </p>
      </div>

      {all.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-line bg-surface p-6 text-muted">{t.unavailable}</p>
      ) : visible.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-line bg-surface p-6 text-muted">{t.noResults(deferred)}</p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="learn-grid">
          {visible.map((c, i) => (
            <li key={c.id} className="enter" style={{ ['--i' as string]: Math.min(i, 8) }}>
              <Link
                to={`/learn/${c.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-[1.4rem] border border-line bg-surface shadow-card transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lift"
                data-category={c.id}
              >
                <CategoryArt id={c.id} />
                <div className="flex flex-1 flex-col p-5">
                  <SeverityChip severity={c.severity} size="sm" className="self-start" />
                  <h2 className="display mt-3 text-[1.35rem] text-fg">{c.name}</h2>
                  <p lang={c.altLang} className={c.altLang === 'hi' ? 'font-deva text-sm font-semibold text-subtle' : 'text-sm font-semibold text-subtle'}>
                    {c.altName}
                  </p>
                  <p className="mt-2 line-clamp-3 leading-relaxed text-muted">{c.short}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-accent">
                    {t.readMore}
                    <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
