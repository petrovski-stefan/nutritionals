import type { PropsWithChildren } from 'react';

type Props = Readonly<
  PropsWithChildren & {
    hover?: boolean;
    className?: string;
  }
>;

export default function Card({ hover = false, className = '', children }: Props) {
  return (
    <div
      className={`border-border bg-surface-raised rounded-xl border shadow-sm ${hover ? 'transition-shadow hover:shadow-md' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
