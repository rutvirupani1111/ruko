import { useEffect, useState } from 'react';
import { getHistory, watchHistory, type HistoryEntry } from '../../shared/history';

export function useHistory(): { history: HistoryEntry[]; loaded: boolean } {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let alive = true;
    getHistory()
      .then((list) => alive && setHistory(list))
      .finally(() => alive && setLoaded(true));
    const unwatch = watchHistory((list) => alive && setHistory(list));
    return () => {
      alive = false;
      unwatch();
    };
  }, []);
  return { history, loaded };
}
