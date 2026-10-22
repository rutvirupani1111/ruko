import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, getSettings, saveSettings, watchSettings, type Settings } from '../../shared/settings';

/** Live extension settings for React pages, shared with every other context through storage. */
export function useSettings(): {
  settings: Settings;
  loaded: boolean;
  update: (patch: Partial<Settings> | ((current: Settings) => Settings)) => Promise<Settings>;
} {
  const [settings, setSettings] = useState<Settings>({ ...DEFAULT_SETTINGS });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    getSettings().then((s) => {
      if (!alive) return;
      setSettings(s);
      setLoaded(true);
    });
    const unwatch = watchSettings((s) => alive && setSettings(s));
    return () => {
      alive = false;
      unwatch();
    };
  }, []);

  const update = useCallback(async (patch: Partial<Settings> | ((current: Settings) => Settings)) => {
    const apply = (current: Settings) => (typeof patch === 'function' ? patch(current) : { ...current, ...patch });
    // Optimistic: controlled inputs (radios, switches) reflect the click immediately.
    setSettings((current) => apply(current));
    // Persist against the latest stored copy so changes made in other contexts survive.
    const saved = await saveSettings(apply(await getSettings()));
    setSettings(saved);
    return saved;
  }, []);

  return { settings, loaded, update };
}
