import { useSyncExternalStore } from 'react';
import type * as EngineModule from '@ruko/engine';

/**
 * The detection engine is code-split from the app shell so the first paint
 * stays small on low-end phones. It starts loading as soon as the checker
 * mounts and is cached by the service worker for offline use.
 */
export type Engine = typeof EngineModule;

let promise: Promise<Engine> | null = null;
let loaded: Engine | null = null;
const listeners = new Set<() => void>();

export function loadEngine(): Promise<Engine> {
  if (!promise) {
    promise = import('@ruko/engine').then((mod) => {
      loaded = mod;
      listeners.forEach((notify) => notify());
      return mod;
    });
    promise.catch(() => {
      // Let a later call retry (e.g. after coming back online).
      promise = null;
    });
  }
  return promise;
}

export function getLoadedEngine(): Engine | null {
  return loaded;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The engine module once loaded, otherwise null. Triggers loading on first use. */
export function useEngine(): Engine | null {
  const engine = useSyncExternalStore(
    subscribe,
    () => loaded,
    () => null,
  );
  if (!engine) void loadEngine().catch(() => undefined);
  return engine;
}
