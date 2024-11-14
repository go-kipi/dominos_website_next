import Router from 'next/router';
import { useEffect } from 'react';

export const usePrompt = (hasMenuData) => {
  useEffect(() => {
    // For reloading.
    // window.onbeforeunload = () => {
    //   if (unsavedChanges) {
    //     return 'You have unsaved changes. Do you really want to leave?';
    //   }
    // };

    // For changing in-app route.
    if (!hasMenuData) {
      const routeChangeStart = () => {
        Router.replace('/');
      };

      Router.events.on('routeChangeStart', routeChangeStart);
      return () => {
        Router.events.off('routeChangeStart', routeChangeStart);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMenuData]);
};