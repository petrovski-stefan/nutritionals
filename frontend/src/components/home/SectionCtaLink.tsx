import { ArrowRightIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

type Props = Readonly<{
  to: string;
  children: string;
}>;

export default function SectionCtaLink({ to, children }: Props) {
  return (
    <Link
      to={to}
      className="text-primary hover:text-accent focus-visible:outline-primary group inline-flex items-center gap-2 rounded text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {children}
      <ArrowRightIcon
        aria-hidden="true"
        className="h-4 w-4 transition-transform group-hover:translate-x-1"
      />
    </Link>
  );
}
