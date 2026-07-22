import type { ButtonHTMLAttributes } from 'react';

import Spinner from './Spinner';

type Variant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary/90 focus-visible:outline-primary',
  accent: 'bg-accent text-white hover:bg-accent/90 focus-visible:outline-accent',
  outline:
    'border border-border bg-surface-raised text-text hover:bg-surface-sunken focus-visible:outline-primary',
  ghost: 'text-text-muted hover:bg-surface-sunken hover:text-text focus-visible:outline-primary',
  danger: 'bg-danger text-white hover:bg-danger/90 focus-visible:outline-danger',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

type Props = Readonly<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    size?: Size;
    isPending?: boolean;
  }
>;

export default function Button({
  variant = 'primary',
  size = 'md',
  isPending = false,
  disabled = false,
  type = 'button',
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled || isPending}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {isPending && <Spinner size="sm" />}
      {children}
    </button>
  );
}
