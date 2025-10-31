import { useEffect, type PropsWithChildren } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type Props = PropsWithChildren & {
  mode: 'guestOnly' | 'private';
  redirectTo: string;
};

export default function AuthGuard({ children, mode, redirectTo }: Props) {
  const { isLoggedIn } = useAuthContext();
  const navigate = useNavigate();

  const isPrivateRoute = mode === 'private';
  const isGuestOnlyRoute = mode === 'guestOnly';
  const shouldRedirect = (isGuestOnlyRoute && isLoggedIn) || (isPrivateRoute && !isLoggedIn);

  useEffect(() => {
    if (shouldRedirect) {
      navigate(redirectTo);
    }
  }, [isLoggedIn, navigate, shouldRedirect, redirectTo]);

  return shouldRedirect ? null : children;
}
