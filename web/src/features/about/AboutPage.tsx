import { Link } from 'react-router';
import {
  ArrowRight,
  BookOpen,
  Bug,
  Code2,
  Download,
  Flag,
  Gamepad2,
  GraduationCap,
  HeartHandshake,
  IndianRupee,
  LifeBuoy,
  Lock,
  Mail,
  Puzzle,
  ShieldCheck,
  Smartphone,
  type LucideIcon,
} from 'lucide-react';
import { Mark } from '@/components/brand/Mark';
import { ButtonLink } from '@/components/ui/Button';
import { config, type ConfigLink } from '@/config';
import { common } from '@/i18n/common';
import { useT } from '@/i18n/core';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { aboutStrings } from './strings';

const PRINCIPLES = [
  { key: 'device', Icon: Smartphone },
  { key: 'india', Icon: IndianRupee },
  { key: 'teach', Icon: GraduationCap },
  { key: 'open', Icon: Code2 },
] as const;
const WHAT: Array<{ key: 'check' | 'learn' | 'simulator' | 'help' | 'report' | 'privacy'; to: string; Icon: LucideIcon }> = [
  { key: 'check', to: '/', Icon: ShieldCheck },
  { key: 'learn', to: '/learn', Icon: BookOpen },
  { key: 'simulator', to: '/simulator', Icon: Gamepad2 },
  { key: 'help', to: '/help', Icon: LifeBuoy },
  { key: 'report', to: '/report', Icon: Flag },
  { key: 'privacy', to: '/privacy', Icon: Lock },
];

export default function AboutPage() {
  const t = useT(aboutStrings);
  const c = useT(common);
  useDocumentTitle(t.title);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-20 sm:px-6 sm:pt-10 lg:px-8">
      <header className="grid items-end gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12">
        <div className="max-w-3xl">
          <p className="text-sm font-bold tracking-[0.16em] text-brand uppercase">{t.eyebrow}</p>
          <h1 className="display mt-3 text-[2.5rem] sm:text-6xl">{t.heading}</h1>
          <p className="mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-muted">{t.intro}</p>
        </div>
        <div className="hidden rounded-[2rem] bg-ink p-8 text-paper shadow-lift lg:block dark:bg-surface-2 dark:text-fg">
          <Mark size={84} animate />
          <p className="display mt-5 text-3xl text-saffron">Ruko</p>
          <p className="mt-1 font-semibold">{c.brand.tagline}</p>
          <p lang="hi" className="font-deva text-paper/75 dark:text-muted">
            {c.brand.taglineHi}
          </p>
        </div>
      </header>

      <section aria-labelledby="about-mission" className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
        <div>
          <h2 id="about-mission" className="display text-3xl sm:text-4xl">
            {t.mission.title}
          </h2>
          {t.mission.body.map((p, i) => (
            <p key={i} className="mt-4 text-[1.05rem] leading-relaxed text-muted">
              {p}
            </p>
          ))}
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {PRINCIPLES.map(({ key, Icon }) => {
            const p = t.principles[key];
            return (
              <li key={key} className="rounded-[1.4rem] border border-line bg-surface p-5 shadow-card">
                <Icon aria-hidden="true" className="size-6 text-brand" />
                <h3 className="mt-3 font-display text-lg font-bold">{p.title}</h3>
                <p className="mt-1 text-[0.95rem] leading-relaxed text-muted">{p.body}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="about-what" className="mt-14">
        <h2 id="about-what" className="display text-3xl sm:text-4xl">
          {t.what.title}
        </h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {WHAT.map(({ key, to, Icon }) => (
            <li key={key}>
              <Link
                to={to}
                className="group flex h-full items-start gap-4 rounded-[1.4rem] border border-line bg-surface p-5 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-tint text-brand">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 font-display text-lg font-bold">
                    {t.what.items[key].title}
                    <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <span className="mt-1 block text-[0.95rem] leading-relaxed text-muted">{t.what.items[key].body}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-14 grid gap-4 lg:grid-cols-2">
        <section
          aria-labelledby="about-extension"
          className="min-w-0 rounded-[1.6rem] border border-line bg-surface p-6 shadow-card sm:p-8"
          data-testid="about-extension"
        >
          <span className="grid size-12 place-items-center rounded-2xl bg-accent-tint text-accent">
            <Puzzle aria-hidden="true" className="size-6" />
          </span>
          <h2 id="about-extension" className="display mt-4 text-3xl">
            {t.extension.title}
          </h2>
          <p className="mt-3 leading-relaxed text-muted">{t.extension.body}</p>
          <ButtonLink href={config.releases.url} variant="accent" size="lg" className="mt-5 h-auto! min-h-13 w-full py-3 text-center whitespace-normal! sm:w-auto" external newTabLabel={c.actions.opensNewTab}>
            <Download aria-hidden="true" />
            {t.extension.cta}
          </ButtonLink>
          <h3 className="mt-6 text-xs font-bold tracking-[0.12em] text-muted uppercase">{t.extension.stepsTitle}</h3>
          <ol className="mt-3 space-y-3">
            {t.extension.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-[0.95rem] leading-relaxed">
                <span className="num grid size-7 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-bold">{i + 1}</span>
                <span className="min-w-0 pt-0.5 [overflow-wrap:anywhere]">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm leading-relaxed text-subtle">{t.extension.stores}</p>
        </section>

        <section
          aria-labelledby="about-open"
          className="flex min-w-0 flex-col rounded-[1.6rem] bg-ink p-6 text-paper shadow-lift sm:p-8 dark:bg-surface-2 dark:text-fg"
        >
          <span className="grid size-12 place-items-center rounded-2xl bg-white/10">
            <Code2 aria-hidden="true" className="size-6 text-saffron" />
          </span>
          <h2 id="about-open" className="display mt-4 text-3xl">
            {t.open.title}
          </h2>
          <p className="mt-3 leading-relaxed text-paper/80 dark:text-muted">{t.open.body}</p>
          <p className="mt-3 font-mono text-sm break-all text-paper/70 dark:text-muted">{config.repo.url.replace(/^https:\/\//, '')}</p>
          <div className="mt-auto flex flex-wrap gap-3 pt-6">
            <ButtonLink href={config.repo.url} variant="primary" size="lg" external newTabLabel={c.actions.opensNewTab}>
              <Code2 aria-hidden="true" />
              {t.open.code}
            </ButtonLink>
            <ButtonLink
              href={config.issues.url}
              variant="ghost"
              size="lg"
              external
              newTabLabel={c.actions.opensNewTab}
              className="text-paper hover:bg-white/10 dark:text-fg"
            >
              <Bug aria-hidden="true" />
              {t.open.issue}
            </ButtonLink>
          </div>
        </section>
      </div>

      <section aria-labelledby="about-support" className="mt-4 rounded-[1.6rem] border border-line bg-surface p-6 sm:p-8" data-testid="about-support">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          <div className="max-w-xl">
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-tint text-brand">
              <HeartHandshake aria-hidden="true" className="size-6" />
            </span>
            <h2 id="about-support" className="display mt-4 text-3xl">
              {t.support.title}
            </h2>
            <p className="mt-3 leading-relaxed text-muted">{t.support.body}</p>
            <p className="mt-3 text-sm leading-relaxed text-subtle">{t.support.other}</p>
          </div>
          <ul className="grid w-full gap-2.5 sm:grid-cols-2 lg:max-w-md lg:grid-cols-1">
            {Object.values(config.support).map((link) => (
              <SupportLink key={link.label} link={link} />
            ))}
            <SupportLink link={{ ...config.contact, label: `${t.support.contact} (${config.contact.label})` }} icon={Mail} />
          </ul>
        </div>
      </section>

      <p className="mt-10 max-w-3xl text-sm leading-relaxed text-subtle">{t.disclaimer}</p>
    </div>
  );
}

/** A support or contact link. Placeholders render as a clearly marked, non-clickable row. */
function SupportLink({ link, icon: Icon = HeartHandshake }: { link: ConfigLink; icon?: LucideIcon }) {
  const t = useT(aboutStrings);
  const c = useT(common);
  if (link.placeholder) {
    return (
      <li
        className="flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-dashed border-line-strong px-4 py-2.5 text-muted"
        data-placeholder="true"
      >
        <span className="flex min-w-0 items-center gap-2 font-semibold">
          <Icon aria-hidden="true" className="size-4 shrink-0" />
          <span className="truncate">{link.label}</span>
        </span>
        <span className="shrink-0 rounded-full bg-caution-tint px-2.5 py-1 text-xs font-bold text-caution">{t.support.notSet}</span>
      </li>
    );
  }
  return (
    <li>
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-line-strong px-4 py-2.5 font-semibold hover:bg-surface-2"
      >
        <span className="flex items-center gap-2">
          <Icon aria-hidden="true" className="size-4" />
          {link.label}
        </span>
        <span className="sr-only">{c.actions.opensNewTab}</span>
      </a>
    </li>
  );
}
