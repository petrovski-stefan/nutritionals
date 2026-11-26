import type { ButtonHTMLAttributes } from 'react';

type Variant = 'ghost' | 'primaryGhost' | 'filled' | 'danger' | 'info' | 'warning' | 'onPrimary';
type Size = 'sm' | 'md';

const VARIANT_CLASSES: Record<Variant, string> = {
  ghost: 'text-text-muted hover:bg-surface-sunken hover:text-text focus-visible:outline-primary',
  primaryGhost:
    'text-text-muted hover:bg-primary/10 hover:text-primary focus-visible:outline-primary',
  filled: 'bg-primary text-on-fill hover:bg-primary/90 focus-visible:outline-primary',
  danger: 'bg-danger text-on-fill hover:bg-danger/90 focus-visible:outline-danger',
  info: 'bg-info text-on-fill hover:bg-info/90 focus-visible:outline-info',
  warning: 'bg-warning text-on-fill hover:bg-warning/90 focus-visible:outline-warning',
  onPrimary: 'text-white hover:bg-white/15 focus-visible:outline-white',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'p-1.5',
  md: 'p-2',
};

type Props = Readonly<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    label: string;
    variant?: Variant;
    size?: Size;
  }
>;

export default function IconButton({
  label,
  variant = 'ghost',
  size = 'md',
  type = 'button',
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button
      type={type}
      aria-label={label}
      className={`inline-flex cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
