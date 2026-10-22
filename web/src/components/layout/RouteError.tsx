import { Link, useRouteError } from 'react-router';
import { RotateCcw } from 'lucide-react';
import { Mark } from '@/components/brand/Mark';
import { Button, buttonClass } from '@/components/ui/Button';
import { common } from '@/i18n/common';
import { useT } from '@/i18n/core';

/** Shown when a page crashes or its code chunk fails to load (for example, offline before it was cached). */
export function RouteError() {
  const t = useT(common);
  const error = useRouteError();
  if (import.meta.env.DEV) console.error(error);
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
      <Mark size={72} />
      <h1 className="display mt-6 text-3xl">{t.routeError.title}</h1>
      <p className="mt-3 leading-relaxed text-muted">{t.routeError.body}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button variant="primary" onClick={() => window.location.reload()}>
          <RotateCcw aria-hidden="true" />
          {t.routeError.reload}
        </Button>
        <Link to="/" className={buttonClass({ variant: 'secondary' })} reloadDocument>
          {t.routeError.home}
        </Link>
      </div>
    </div>
  );
}
