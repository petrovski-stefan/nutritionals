import { Link } from 'react-router-dom';
import routes from '../../routes/routes';
import MenuItem from './MenuItem';

export default function Header() {
  const menuItemsLinks = routes
    .filter(({ showInMenu }) => showInMenu)
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
      <div className="flex w-[60%] justify-around">{menuItemsLinks}</div>
    </div>
  );
}
