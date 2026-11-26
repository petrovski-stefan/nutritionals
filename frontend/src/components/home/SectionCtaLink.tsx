import { ArrowRightIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

type Props = Readonly<{
  to: string;
  // Router state for the target page, e.g. which list My Lists should open
  state?: unknown;
  children: string;
}>;

export default function SectionCtaLink({ to, state, children }: Props) {
  return (
    <Link
      to={to}
      state={state}
      className="text-primary focus-visible:outline-primary group inline-flex items-center gap-2 rounded text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {children}
      <ArrowRightIcon
        aria-hidden="true"
        className="h-4 w-4 transition-transform duration-150 ease-out group-hover:translate-x-1 motion-reduce:transition-none"
      />
    </Link>
  );
}
