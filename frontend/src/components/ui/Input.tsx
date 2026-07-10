import type { InputHTMLAttributes, Ref } from 'react';

type Props = Readonly<
  InputHTMLAttributes<HTMLInputElement> & {
    ref?: Ref<HTMLInputElement>;
  }
>;

export default function Input({ className = '', ...rest }: Props) {
  return (
    <input
      className={`border-border bg-surface-raised text-text placeholder:text-text-muted focus-visible:outline-primary w-full rounded-lg border px-4 py-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-0 ${className}`}
      {...rest}
    />
  );
}
