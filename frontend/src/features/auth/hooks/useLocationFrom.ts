import { useLocation } from 'react-router-dom';

import type { AuthRedirectState } from '@/shared/types/navigation';

const useLocationFrom = () => {
  const location = useLocation();

  const fromLocation = (location.state as AuthRedirectState | null)?.from;
  const from = fromLocation?.pathname ? fromLocation.pathname + (fromLocation.search ?? '') : '/';

  return { from };
};

export default useLocationFrom;
