import type { ReactNode } from 'react';

type Variant = 'empty' | 'error';

const DEFAULT_MESSAGES: Record<Variant, string> = {
  empty: 'Нема резултати.',
  error: 'Податоците не можеа да се вчитаат. Проверете ја врската и обидете се повторно.',
};

const TEXT_CLASSES: Record<Variant, string> = {
  empty: 'text-text-muted',
  error: 'text-danger',
};

type Props = Readonly<{
  variant: Variant;
  message?: string;
  className?: string;
  children?: ReactNode;
}>;

export default function StateMessage({ variant, message, className = '', children }: Props) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-6 text-center ${className}`}>
      <p
        role={variant === 'error' ? 'alert' : undefined}
        className={`text-sm ${TEXT_CLASSES[variant]}`}
      >
        {message ?? DEFAULT_MESSAGES[variant]}
      </p>
      {children}
    </div>
  );
}
