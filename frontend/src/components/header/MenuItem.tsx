import { NavLink } from 'react-router-dom';

type Props = Readonly<{
  path: string;
  linkText: string;
  handleLinkClick: () => void;
}>;

const BASE_CLASSES =
  'block rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

export default function MenuItem({ path, linkText, handleLinkClick }: Props) {
  return (
    <NavLink
      to={path}
      onClick={handleLinkClick}
      className={({ isActive }) =>
        `${BASE_CLASSES} ${
          isActive ? 'text-accent bg-white/15 font-bold' : 'text-white/90 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      {linkText}
    </NavLink>
  );
}
