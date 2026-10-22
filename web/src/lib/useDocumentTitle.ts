import { useEffect } from 'react';

/** Set the tab title for the current page (screen readers announce it on navigation). */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title.includes('Ruko') ? title : `${title} · Ruko`;
  }, [title]);
}
