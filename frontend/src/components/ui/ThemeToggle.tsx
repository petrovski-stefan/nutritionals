import { MoonIcon, SunIcon } from 'lucide-react';

import { useThemeContext } from '@/context/ThemeContext';

import IconButton from './IconButton';

export default function ThemeToggle() {
  const { theme, toggle } = useThemeContext();

  const label = theme === 'dark' ? 'Светла тема' : 'Темна тема';

  return (
    <IconButton
      label={label}
      variant="onPrimary"
      onClick={toggle}
    >
      {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </IconButton>
  );
}
