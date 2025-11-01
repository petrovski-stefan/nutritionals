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
    <div className="bg-primary sticky top-0 z-10 flex h-16 justify-center">
      <div className="text-accent flex w-[25%] items-center text-3xl font-bold italic">
        <Link to="/">Nutritionals</Link>
      </div>
      <div className="flex w-[50%] justify-around">{menuItemsLinks}</div>
      {isLoggedIn && (
        <UserCard
          handleLogout={() => logout()}
          username={username}
        />
      )}
    </div>
  );
}
