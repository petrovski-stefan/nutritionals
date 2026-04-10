import { type PropsWithChildren,useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuthContext } from '../context/AuthContext';

type Props = PropsWithChildren & {
  mode: 'guestOnly' | 'private';
  redirectTo: string;
};

export default function AuthGuard({ children, mode, redirectTo }: Props) {
  const { isLoggedIn } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const isPrivateRoute = mode === 'private';
  const isGuestOnlyRoute = mode === 'guestOnly';
  const shouldRedirect = (isGuestOnlyRoute && isLoggedIn) || (isPrivateRoute && !isLoggedIn);

  useEffect(() => {
    const fromPathname = location.state?.from.pathname;

    const target = fromPathname ? fromPathname : redirectTo;

    if (shouldRedirect) {
      navigate(target);
    }
  }, [isLoggedIn, navigate, shouldRedirect, redirectTo]);

  return shouldRedirect ? null : children;
}
