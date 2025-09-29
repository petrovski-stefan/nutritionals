import { NavLink } from 'react-router-dom';

type Props = {
  path: string;
  linkText: string;
};

export default function MenuItem({ path, linkText }: Props) {
  const activeLinkStyles = 'font-bold text-accent underline decoration-accent';
  const notActiveLinkStyles = 'text-neutral hover:underline decoration-secondary';

  return (
    <div className="flex items-center justify-center underline-offset-4">
      <NavLink
        key={path}
        to={path}
        className={({ isActive }) => (isActive ? activeLinkStyles : notActiveLinkStyles)}
      >
        {linkText}
      </NavLink>
    </div>
  );
}
