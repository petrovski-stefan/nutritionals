import { useCallback, useSyncExternalStore } from 'react';

const useMediaQuery = (query: string) => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener('change', onChange);
      return () => {
        mediaQueryList.removeEventListener('change', onChange);
      };
    },
    [query]
  );

  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches);
};

export default useMediaQuery;
