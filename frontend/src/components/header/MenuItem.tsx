import { NavLink } from 'react-router-dom';

type Props = {
  path: string;
  linkText: string;
  handleLinkClick: () => void;
};

export default function MenuItem({ path, linkText, handleLinkClick }: Props) {
  const activeLinkStyles = 'font-bold text-accent underline decoration-accent';
  const notActiveLinkStyles = 'text-neutral hover:underline decoration-secondary';

  return (
    <div className="flex items-center justify-center underline-offset-4">
      <NavLink
        key={path}
        to={path}
        className={({ isActive }) => (isActive ? activeLinkStyles : notActiveLinkStyles)}
        onClick={handleLinkClick}
      >
        {linkText}
      </NavLink>
    </div>
  );
}
