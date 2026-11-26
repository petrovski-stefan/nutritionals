import { createContext, type ReactNode, useContext, useState } from 'react';

type AuthContextValue = {
  username: string;
  accessToken: string;
  isLoggedIn: boolean;
  hasSessionExpired: boolean;
  login: (username: string, accessToken: string) => void;
  logout: () => void;
  expireSession: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = Readonly<{
  children: ReactNode;
}>;

const USERNAME_LOCALSTORAGE_KEY = 'NUTRITIONALS_USERNAME';
const ACCESS_TOKEN_LOCALSTORAGE_KEY = 'NUTRITIONALS_ACCESS_TOKEN';

type LocalStorageKey = typeof USERNAME_LOCALSTORAGE_KEY | typeof ACCESS_TOKEN_LOCALSTORAGE_KEY;

const getInitialValue = (key: LocalStorageKey) => localStorage.getItem(key) ?? '';
const setLocalStorage = (key: LocalStorageKey, value: string) => {
  localStorage.setItem(key, value);
};
const removeLocalStorage = (key: LocalStorageKey) => {
  localStorage.removeItem(key);
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [username, setUsername] = useState(() => getInitialValue(USERNAME_LOCALSTORAGE_KEY));
  const [accessToken, setAccessToken] = useState(getInitialValue(ACCESS_TOKEN_LOCALSTORAGE_KEY));
  const [hasSessionExpired, setHasSessionExpired] = useState(false);

  const isLoggedIn = username !== '' && accessToken !== '';

  const login = (username: string, accessToken: string) => {
    setAccessToken(accessToken);
    setUsername(username);
    setHasSessionExpired(false);

    setLocalStorage(USERNAME_LOCALSTORAGE_KEY, username);
    setLocalStorage(ACCESS_TOKEN_LOCALSTORAGE_KEY, accessToken);
  };

  const clearSession = () => {
    setAccessToken('');
    setUsername('');

    removeLocalStorage(USERNAME_LOCALSTORAGE_KEY);
    removeLocalStorage(ACCESS_TOKEN_LOCALSTORAGE_KEY);
  };

  const logout = () => {
    clearSession();
    setHasSessionExpired(false);
  };

  const expireSession = () => {
    clearSession();
    setHasSessionExpired(true);
  };

  const value = {
    username,
    accessToken,
    isLoggedIn,
    hasSessionExpired,
    login,
    logout,
    expireSession,
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}
// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('AuthContext must be used inside AuthProvider!');
  }

  return context;
};
