import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

type LocationState = {
  from?: {
    pathname?: string;
  };
};

const useLocationFrom = () => {
  const location = useLocation();
  const [from, setFrom] = useState('/');

  useEffect(() => {
    const state = location.state as LocationState | null;

    const fromPath = state?.from?.pathname ?? '/';

    setFrom(fromPath);
  }, [location.state]);

  return { from };
};

export default useLocationFrom;
