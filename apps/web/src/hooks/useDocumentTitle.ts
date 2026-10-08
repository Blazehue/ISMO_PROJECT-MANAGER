import { useEffect } from 'react';

/** Gives every page its own tab title (helps with tabs, history and screen readers). */
export function useDocumentTitle(title: string | undefined) {
  useEffect(() => {
    document.title = title ? `${title} · ISMO Workspace` : 'ISMO Workspace';
  }, [title]);
}
