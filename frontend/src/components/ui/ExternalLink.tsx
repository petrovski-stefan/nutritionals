import { ExternalLinkIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = Readonly<{
  href: string;
  children: ReactNode;
  className?: string;
  // For the text only, e.g. truncate, so the icon never gets cut off
  textClassName?: string;
}>;

export default function ExternalLink({
  href,
  children,
  className = '',
  textClassName = '',
}: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex max-w-full min-w-0 items-baseline gap-1 ${className}`}
    >
      <span className={`min-w-0 ${textClassName}`}>{children}</span>
      <ExternalLinkIcon
        aria-hidden="true"
        className="h-3.5 w-3.5 shrink-0 self-center"
      />
      <span className="sr-only">(се отвора во нов прозорец)</span>
    </a>
  );
}
