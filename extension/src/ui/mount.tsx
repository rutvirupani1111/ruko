import { StrictMode, type ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { followSystemTheme } from './theme';

/** Shared bootstrap for popup, side panel, options and the "you left" page. */
export function mount(App: ComponentType): void {
  followSystemTheme();
  const root = document.getElementById('root');
  if (!root) throw new Error('Missing #root');
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
