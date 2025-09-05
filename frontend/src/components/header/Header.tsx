import { Link } from 'react-router-dom';
import routes from '../../routes/routes';
import MenuItem from './MenuItem';

export default function Header() {
  const menuItemsElements = routes
    .filter(({ showInMenu }) => showInMenu)
    .map((route) => <MenuItem {...route} />);

  return (
    <div className="bg-primary flex w-screen justify-center">
      <div className="text-accent w-[25%] text-3xl font-bold italic">
        <Link to="/">Nutritionals</Link>
      </div>
      <div className="flex w-[60%] justify-around">{menuItemsElements}</div>
    </div>
  );
}
