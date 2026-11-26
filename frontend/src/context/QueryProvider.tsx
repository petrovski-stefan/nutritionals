import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import type { AuthRedirectState } from '@/shared/types/navigation';

import { useAuthContext } from './AuthContext';

const isUnauthorized = (error: unknown) => isAxiosError(error) && error.response?.status === 401;

type Props = Readonly<{
  children: ReactNode;
}>;

// React Query for the whole app, plus one place that handles an expired session: a 401 on any
// request while signed in logs the user out and sends them to sign in, then back to this page
export default function QueryProvider({ children }: Props) {
  const { isLoggedIn, expireSession } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  // The client lives as long as the app; its error handler reads the current auth state and route
  const latestRef = useRef({ isLoggedIn, expireSession, navigate, location });
  useEffect(() => {
    latestRef.current = { isLoggedIn, expireSession, navigate, location };
  });

  const [queryClient] = useState(() => {
    const handleError = (error: unknown) => {
      const latest = latestRef.current;
      // A failed sign-in is also a 401, so only act when the user was signed in
      if (!latest.isLoggedIn || !isUnauthorized(error)) return;

      // On a guarded page the guard redirects too; both carry the same reason, so either may land last
      const state: AuthRedirectState = { from: latest.location, reason: 'session-expired' };
      void latest.navigate('/login', { state });
      latest.expireSession();
    };

    return new QueryClient({
      queryCache: new QueryCache({ onError: handleError }),
      mutationCache: new MutationCache({ onError: handleError }),
      defaultOptions: {
        // Retrying a 401 can't succeed, so it only delays the redirect
        queries: { retry: (failureCount, error) => !isUnauthorized(error) && failureCount < 1 },
      },
    });
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
