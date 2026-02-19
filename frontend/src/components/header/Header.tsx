import { useState } from 'react';
import { Link } from 'react-router-dom';
import routes from '../../routes';
import MenuItem from './MenuItem';
import { useAuthContext } from '../../context/AuthContext';
import UserCard from './UserCard';
import { MenuIcon, XIcon } from 'lucide-react';

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
        {...route}
      />
    ));

  return (
    <header className="bg-primary sticky top-0 z-50 shadow-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div>
          <Link
            to="/"
            className="text-accent hover:text-accent/80 text-2xl font-bold italic transition-colors sm:text-3xl"
          >
            Nutritionals
          </Link>
        </div>

        <div className="flex justify-between">
          <nav className="ml-10 hidden space-x-8 md:flex">{menuItemsLinks}</nav>

          <div className="flex-1" />

          <div className="flex shrink-0 items-center gap-3">
            {isLoggedIn && (
              <UserCard
                username={username}
                handleLogout={logout}
              />
            )}

            <button
              className="text-accent text-2xl md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="bg-primary px-4 pb-4 md:hidden">
          <div className="flex flex-col space-y-4">{menuItemsLinks}</div>
        </nav>
      )}
    </header>
  );
}
