import { type PropsWithChildren, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuthContext } from '@/context/AuthContext';
import type { AuthRedirectReason, AuthRedirectState } from '@/shared/types/navigation';

type Props = Readonly<
  PropsWithChildren & {
    mode: 'guestOnly' | 'private';
    redirectTo: string;
    reason?: AuthRedirectReason;
  }
>;

export default function AuthGuard({ children, mode, redirectTo, reason }: Props) {
  const { isLoggedIn, hasSessionExpired } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const isPrivateRoute = mode === 'private';
  const isGuestOnlyRoute = mode === 'guestOnly';
  const shouldRedirect = (isGuestOnlyRoute && isLoggedIn) || (isPrivateRoute && !isLoggedIn);

  useEffect(() => {
    if (!shouldRedirect) return;

    if (isPrivateRoute) {
      const redirectReason = hasSessionExpired ? 'session-expired' : reason;
      const state: AuthRedirectState = redirectReason
        ? { from: location, reason: redirectReason }
        : { from: location };
      void navigate(redirectTo, { state });
      return;
    }

    const state = location.state as AuthRedirectState | null;
    const from = state?.from;
    void navigate(from?.pathname ? from.pathname + (from.search ?? '') : redirectTo);
  }, [location, navigate, shouldRedirect, isPrivateRoute, redirectTo, reason, hasSessionExpired]);

  return shouldRedirect ? null : children;
}
