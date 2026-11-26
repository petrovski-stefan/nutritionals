import type { ReactNode } from 'react';

type Props = Readonly<{
  label: string;
  error?: string | undefined;
  hint?: string;
  children: ReactNode;
}>;

export default function Field({ label, error, hint, children }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex flex-col gap-1.5">
        <span className="text-text text-sm font-medium">{label}</span>
        {children}
      </label>
      {error ? (
        <p className="text-danger text-sm">{error}</p>
      ) : (
        hint && <p className="text-text-muted text-xs">{hint}</p>
      )}
    </div>
  );
}
