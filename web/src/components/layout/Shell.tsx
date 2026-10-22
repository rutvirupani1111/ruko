import { useEffect, useRef, useState } from 'react';
import { Outlet, ScrollRestoration, useLocation, useNavigation } from 'react-router';
import { RefreshCw, WifiOff, X } from 'lucide-react';
import { common } from '@/i18n/common';
import { useT } from '@/i18n/core';
import { useOnline } from '@/lib/useOnline';
import { dismissPwaToast, usePwaState } from '@/pwa';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';
import { Header } from './Header';

/** Thin bar at the top while a lazy page loads. Appears only if loading takes a moment. */
function RouteProgress() {
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);
  const loading = navigation.state !== 'idle';
  useEffect(() => {
    if (!loading) {
      setVisible(false);
      return;
    }
    const id = window.setTimeout(() => setVisible(true), 120);
    return () => window.clearTimeout(id);
  }, [loading]);
  if (!visible) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-1 overflow-hidden" role="progressbar" aria-busy="true" aria-label="Loading">
      <div className="progress-indeterminate h-full w-full" />
    </div>
  );
}

/** After a client-side navigation, move focus to the new page's heading for screen reader users. */
function useRouteFocus() {
  const location = useLocation();
  const previous = useRef(location.pathname);
  useEffect(() => {
    // Compare paths rather than counting renders: StrictMode runs effects twice.
    if (previous.current === location.pathname) return;
    previous.current = location.pathname;
    if (location.hash) return;
    const id = window.requestAnimationFrame(() => {
      const main = document.getElementById('main');
      const heading = main?.querySelector<HTMLElement>('h1');
      const target = heading ?? main;
      if (!target) return;
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(id);
  }, [location.pathname, location.hash]);
}

function StatusToasts() {
  const t = useT(common);
  const online = useOnline();
  const pwa = usePwaState();
  const showPwa = pwa.needRefresh || pwa.offlineReady;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 lg:bottom-6 no-print" aria-live="polite">
      {!online ? (
        <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-paper shadow-lift dark:bg-paper dark:text-ink" role="status" data-testid="offline-badge">
          <WifiOff aria-hidden="true" className="size-4" />
          {t.pwa.offline}
        </div>
      ) : null}
      {showPwa ? (
        <div className="pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm shadow-lift" role="status">
          <span className="flex-1 font-medium text-fg">{pwa.needRefresh ? t.pwa.updateReady : t.pwa.offlineReady}</span>
          {pwa.needRefresh && pwa.update ? (
            <button
              type="button"
              onClick={() => void pwa.update?.()}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand-bg px-3.5 font-bold text-on-brand"
            >
              <RefreshCw aria-hidden="true" className="size-4" />
              {t.pwa.update}
            </button>
          ) : null}
          <button
            type="button"
            onClick={dismissPwaToast}
            className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-2"
            aria-label={t.pwa.dismiss}
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function Shell() {
  const t = useT(common);
  useRouteFocus();
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="fixed top-2 left-2 z-[60] -translate-y-24 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition-transform focus:translate-y-0"
      >
        {t.header.skip}
      </a>
      <RouteProgress />
      <Header />
      <main id="main" className="flex-1 outline-none" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <StatusToasts />
      <ScrollRestoration />
    </div>
  );
}
