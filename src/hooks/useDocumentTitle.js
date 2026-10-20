import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} | PageTurn`;

    // Restore the previous title on unmount
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}
