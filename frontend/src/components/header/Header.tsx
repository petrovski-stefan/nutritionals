import { LogOutIcon, MenuIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import IconButton from '@/components/ui/IconButton';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Tooltip from '@/components/ui/Tooltip';
import { useAuthContext } from '@/context/AuthContext';
import routes from '@/routes';

import MenuItem from './MenuItem';

export default function Header() {
  const { username, isLoggedIn, logout } = useAuthContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const showMenuLinkCondition = (
    isLoggedIn: boolean,
    showInHeaderMode: 'show' | 'hide' | 'showIfAuthOnly' | 'showIfNotAuthOnly'
  ) => {
    if (isLoggedIn) {
      return showInHeaderMode === 'show' || showInHeaderMode === 'showIfAuthOnly';
    }
    return showInHeaderMode === 'show' || showInHeaderMode === 'showIfNotAuthOnly';
  };

  const menuItemsLinks = routes
    .filter(({ showInHeaderMode }) => showMenuLinkCondition(isLoggedIn, showInHeaderMode))
    .map((route) => (
      <MenuItem
        key={route.path}
        handleLinkClick={() => {
          setMobileMenuOpen(false);
        }}
        {...route}
      />
    ));

  return (
    <header className="bg-header sticky top-0 z-50 shadow-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          className="text-2xl font-bold text-white italic transition-colors hover:text-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-3xl"
        >
          Nutriceni
        </Link>

        <nav className="hidden items-center gap-1 md:flex">{menuItemsLinks}</nav>

        <div className="flex items-center gap-2">
          {isLoggedIn && (
            <>
              <p className="hidden items-center rounded-full bg-white/15 px-3 py-1.5 text-sm text-white sm:flex">
                <span className="mr-1">Добредојде, </span>
                <span className="truncate font-medium">{username}</span>
              </p>

              <Tooltip
                text="Одјави се"
                placement="bottom"
              >
                <IconButton
                  label="Одјави се"
                  variant="onPrimary"
                  onClick={logout}
                >
                  <LogOutIcon className="h-5 w-5" />
                </IconButton>
              </Tooltip>
            </>
          )}

          <ThemeToggle />

          <IconButton
            label="Мени"
            variant="onPrimary"
            className="md:hidden"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
            }}
          >
            {mobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </IconButton>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav
          id="mobile-nav"
          className="border-t border-white/20 px-4 py-3 transition duration-200 ease-out motion-reduce:transition-none md:hidden starting:-translate-y-1 starting:opacity-0"
        >
          {/* Below sm the header has no room for the username, so the menu shows it */}
          {isLoggedIn && (
            <p className="truncate px-3 pb-2 text-sm text-white/90 sm:hidden">
              Најавени сте како <span className="font-medium text-white">{username}</span>
            </p>
          )}
          <div className="flex flex-col gap-1">{menuItemsLinks}</div>
        </nav>
      )}
    </header>
  );
}
