import type { PropsWithChildren } from 'react';

type Props = Readonly<
  PropsWithChildren & {
    className?: string;
  }
>;

export default function Card({ className = '', children }: Props) {
  return (
    <div className={`border-border bg-surface-raised rounded-xl border shadow-sm ${className}`}>
      {children}
    </div>
  );
}
