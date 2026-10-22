import { ArrowRight, BookOpen, LifeBuoy } from 'lucide-react';
import { Mark } from '@/components/brand/Mark';
import { ButtonRouterLink } from '@/components/ui/Button';
import { defineStrings, useT } from '@/i18n/core';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

const strings = defineStrings(
  {
    title: 'Page not found',
    eyebrow: 'Error 404',
    heading: 'This page took a pause.',
    body: 'The link may be old or mistyped. If someone sent you this link saying it is a bank or government page, be careful: it was not.',
    check: 'Check a message',
    learn: 'Learn about scams',
    help: 'I think I have been scammed',
  },
  {
    title: 'पेज नहीं मिला',
    eyebrow: 'त्रुटि 404',
    heading: 'यह पेज रुक गया है।',
    body: 'लिंक पुराना या गलत लिखा हो सकता है। अगर किसी ने यह लिंक बैंक या सरकारी पेज बताकर भेजा है, तो सावधान रहें: यह वैसा नहीं था।',
    check: 'कोई मैसेज जाँचें',
    learn: 'स्कैम के बारे में जानें',
    help: 'मुझे लगता है मेरे साथ ठगी हुई है',
  },
);

export default function NotFoundPage() {
  const t = useT(strings);
  useDocumentTitle(t.title);
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <Mark size={88} animate />
      <p className="mt-6 text-sm font-bold tracking-[0.18em] text-brand uppercase">{t.eyebrow}</p>
      <h1 className="display mt-2 text-4xl sm:text-5xl">{t.heading}</h1>
      <p className="mt-4 max-w-lg text-[1.05rem] leading-relaxed text-muted">{t.body}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonRouterLink to="/" variant="primary" size="lg">
          {t.check}
          <ArrowRight aria-hidden="true" />
        </ButtonRouterLink>
        <ButtonRouterLink to="/learn" variant="secondary" size="lg">
          <BookOpen aria-hidden="true" />
          {t.learn}
        </ButtonRouterLink>
      </div>
      <ButtonRouterLink to="/help" variant="ghost" size="md" className="mt-3 text-critical">
        <LifeBuoy aria-hidden="true" />
        {t.help}
      </ButtonRouterLink>
    </div>
  );
}
