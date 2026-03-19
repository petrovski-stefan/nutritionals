import { useState } from 'react';
import { Link } from 'react-router-dom';
import routes from '../../routes';
import MenuItem from './MenuItem';
import { useAuthContext } from '../../context/AuthContext';
import { LogOutIcon, MenuIcon, XIcon } from 'lucide-react';
import USER_CARD_TEXT from '../../locale/user-card';
import Tooltip from '../Tooltip';

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
        handleLinkClick={() => setMobileMenuOpen(false)}
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

          <div className="ml-10 flex items-center justify-around gap-3">
            {isLoggedIn && (
              <>
                <p className="bg-accent hover:bg-accent/90 flex max-w-[160px] items-center rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors sm:max-w-none sm:text-base">
                  <span className="mr-1 hidden sm:inline">{USER_CARD_TEXT['welcome']}</span>
                  <span className="truncate">{username}</span>
                </p>

                <button
                  className="hover:text-accent cursor-pointer align-middle text-2xl"
                  onClick={() => {
                    logout();
                  }}
                >
                  <Tooltip
                    text="Одјави се"
                    placement="bottom"
                  >
                    <LogOutIcon size={24} />
                  </Tooltip>
                </button>
              </>
            )}

            <button
              className="text-accent text-2xl md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
