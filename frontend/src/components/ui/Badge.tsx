import type { PropsWithChildren } from 'react';

type Variant = 'accent' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const VARIANT_CLASSES: Record<Variant, string> = {
  accent: 'bg-accent/15 text-accent',
  neutral: 'bg-surface-sunken text-text-muted border border-border',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
  info: 'bg-info/15 text-info',
};

type Props = Readonly<
  PropsWithChildren & {
    variant?: Variant;
    className?: string;
  }
>;

export default function Badge({ variant = 'accent', className = '', children }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
