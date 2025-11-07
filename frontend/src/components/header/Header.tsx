import { Link } from 'react-router-dom';
import routes from '../../routes/routes';
import MenuItem from './MenuItem';
import { useAuthContext } from '../../context/AuthContext';
import UserCard from './UserCard';

export default function Header() {
  const { username, isLoggedIn, logout } = useAuthContext();

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
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="text-accent hover:text-accent/80 text-2xl font-bold italic transition-colors sm:text-3xl"
        >
          Nutritionals
        </Link>

        {/* Menu */}
        <nav className="hidden space-x-6 md:flex">{menuItemsLinks}</nav>

        {/* User */}
        {isLoggedIn && (
          <UserCard
            username={username}
            handleLogout={logout}
          />
        )}
      </div>
    </header>
  );
}
