import { useLocation } from 'react-router-dom';

import type { AuthRedirectState } from '@/shared/types/navigation';

const useLocationFrom = () => {
  const location = useLocation();

  const from = (location.state as AuthRedirectState | null)?.from?.pathname ?? '/';

  return { from };
};

export default useLocationFrom;
