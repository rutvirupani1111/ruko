/**
 * localStorage that never throws (private mode, quota, disabled storage).
 * Only small preferences live here; Ruko never stores what you check.
 */
export function readPref(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writePref(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable: preference simply is not remembered */
  }
}

export function readJson<T>(key: string, fallback: T): T {
  const raw = readPref(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  writePref(key, JSON.stringify(value));
}

export const PREF = {
  locale: 'ruko.locale',
  theme: 'ruko.theme',
  communityLookups: 'ruko.community',
  simulator: 'ruko.sim.progress',
  elder: 'ruko.sim.elder',
  helpChecklist: 'ruko.help.steps',
} as const;
