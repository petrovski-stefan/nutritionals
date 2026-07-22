import { useLocation } from 'react-router-dom';

type LocationState = {
  from?: {
    pathname?: string;
  };
};

const useLocationFrom = () => {
  const location = useLocation();

  const from = (location.state as LocationState | null)?.from?.pathname ?? '/';

  return { from };
};

export default useLocationFrom;
