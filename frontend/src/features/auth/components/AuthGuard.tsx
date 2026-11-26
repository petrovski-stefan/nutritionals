import { type PropsWithChildren, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuthContext } from '@/context/AuthContext';
import type { AuthRedirectReason, AuthRedirectState } from '@/shared/types/navigation';

type Props = Readonly<
  PropsWithChildren & {
    mode: 'guestOnly' | 'private';
    redirectTo: string;
    // Shown on the sign-in page, so the redirect doesn't come without an explanation
    reason?: AuthRedirectReason;
  }
>;

export default function AuthGuard({ children, mode, redirectTo, reason }: Props) {
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
      const state: AuthRedirectState = reason ? { from: location, reason } : { from: location };
      void navigate(redirectTo, { state });
      return;
    }

    const state = location.state as AuthRedirectState | null;
    void navigate(state?.from?.pathname ?? redirectTo);
  }, [location, navigate, shouldRedirect, isPrivateRoute, redirectTo, reason]);

  return shouldRedirect ? null : children;
}
