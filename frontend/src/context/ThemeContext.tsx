import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';

type Theme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_LOCALSTORAGE_KEY = 'theme';

const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem(THEME_LOCALSTORAGE_KEY);

  if (stored === 'dark' || stored === 'light') {
    return stored;
  }

  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

type ThemeProviderProps = Readonly<{
  children: ReactNode;
}>;

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // useLayoutEffect so the class is applied before the browser paints the render
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Follow OS preference changes only while the user hasn't made an explicit choice
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem(THEME_LOCALSTORAGE_KEY) !== null) return;

      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';

    setTheme(next);
    localStorage.setItem(THEME_LOCALSTORAGE_KEY, next);
  };

  const value = { theme, toggle };

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useThemeContext = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('ThemeContext must be used inside ThemeProvider!');
  }

  return context;
};
