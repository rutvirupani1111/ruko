import { useSyncExternalStore } from 'react';

/** Service worker registration state, shared with the toast UI. */
export interface PwaState {
  offlineReady: boolean;
  needRefresh: boolean;
  update: (() => Promise<void>) | null;
}

let state: PwaState = { offlineReady: false, needRefresh: false, update: null };
const listeners = new Set<() => void>();

function set(patch: Partial<PwaState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function usePwaState(): PwaState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => state,
  );
}

export function dismissPwaToast() {
  set({ offlineReady: false, needRefresh: false });
}

export async function registerPwa() {
  if (!('serviceWorker' in navigator)) return;
  const { registerSW } = await import('virtual:pwa-register');
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh: () => set({ needRefresh: true }),
    onOfflineReady: () => set({ offlineReady: true }),
  });
  set({ update: () => updateSW(true) });
}
