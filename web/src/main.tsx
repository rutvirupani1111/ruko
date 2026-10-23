import './styles/app.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { isLocale, loadLocale } from './i18n/core';
import { registerPwa } from './pwa';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root');

const render = () =>
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

// Gujarati and Marathi copy is code-split: fetch it before the first render so
// the page never flashes in another language (the boot shield shows meanwhile).
const lang = document.documentElement.lang;
if (isLocale(lang) && (lang === 'gu' || lang === 'mr')) void loadLocale(lang).catch(() => undefined).then(render);
else render();

// Offline support: register the service worker once the page has loaded.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  const register = () => void registerPwa();
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}
