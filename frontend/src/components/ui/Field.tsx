import type { ReactNode } from 'react';

type Props = Readonly<{
  label: string;
  error?: string | undefined;
  children: ReactNode;
}>;

export default function Field({ label, error, children }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-text text-sm font-medium">{label}</span>
      {children}
      {error && <p className="text-danger text-sm">{error}</p>}
    </div>
  );
}
