import { type PropsWithChildren, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuthContext } from '@/context/AuthContext';

type Props = Readonly<
  PropsWithChildren & {
    mode: 'guestOnly' | 'private';
    redirectTo: string;
  }
>;
type LocationState = {
  from?: {
    pathname?: string;
  };
};

export default function AuthGuard({ children, mode, redirectTo }: Props) {
  const { isLoggedIn } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const isPrivateRoute = mode === 'private';
  const isGuestOnlyRoute = mode === 'guestOnly';
  const shouldRedirect = (isGuestOnlyRoute && isLoggedIn) || (isPrivateRoute && !isLoggedIn);

  useEffect(() => {
    const state = location.state as LocationState | null;

    const from = state?.from?.pathname ?? '/';

    const target = from || redirectTo;

    if (shouldRedirect) {
      void navigate(target);
    }
  }, [location.state, navigate, shouldRedirect, redirectTo]);

  return shouldRedirect ? null : children;
}
