import type { ComponentType } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { Mark } from '@/components/brand/Mark';
import { Shell } from '@/components/layout/Shell';
import { RouteError } from '@/components/layout/RouteError';
import CheckPage from '@/features/check/CheckPage';
import { LocaleProvider } from '@/i18n/core';
import { ThemeProvider } from '@/lib/theme';

const page = (load: () => Promise<{ default: ComponentType }>) => async () => {
  const mod = await load();
  return { Component: mod.default };
};

export const routes: RouteObject[] = [
  {
    element: <Shell />,
    errorElement: <RouteError />,
    HydrateFallback: BootFallback,
    children: [
      {
        errorElement: <RouteError />,
        children: [
          { index: true, element: <CheckPage /> },
          { path: 'check', element: <CheckPage /> },
          { path: 'learn', lazy: page(() => import('@/features/learn/LearnPage')) },
          { path: 'learn/:category', lazy: page(() => import('@/features/learn/CategoryPage')) },
          { path: 'simulator', lazy: page(() => import('@/features/simulator/SimulatorPage')) },
          { path: 'help', lazy: page(() => import('@/features/help/HelpPage')) },
          { path: 'report', lazy: page(() => import('@/features/report/ReportPage')) },
          { path: 'privacy', lazy: page(() => import('@/features/privacy/PrivacyPage')) },
          { path: 'about', lazy: page(() => import('@/features/about/AboutPage')) },
          { path: '*', lazy: page(() => import('@/features/notfound/NotFoundPage')) },
        ],
      },
    ],
  },
];

/** Shown only while the very first lazily loaded page arrives (e.g. opening /learn directly). */
function BootFallback() {
  return (
    <div className="boot" aria-hidden="true">
      <Mark size={56} />
    </div>
  );
}

const router = createBrowserRouter(routes);

export function App() {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <RouterProvider router={router} />
      </LocaleProvider>
    </ThemeProvider>
  );
}
