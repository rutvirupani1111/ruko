import './styles/app.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { registerPwa } from './pwa';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Offline support: register the service worker once the page has loaded.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  const register = () => void registerPwa();
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}
