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
    if (!shouldRedirect) return;

    if (isPrivateRoute) {
      // Login and register send the user back to `from` once they are signed in
      void navigate(redirectTo, { state: { from: location } });
      return;
    }

    const state = location.state as LocationState | null;
    void navigate(state?.from?.pathname ?? redirectTo);
  }, [location, navigate, shouldRedirect, isPrivateRoute, redirectTo]);

  return shouldRedirect ? null : children;
}
