import Spinner from './Spinner';

type Variant = 'loading' | 'empty' | 'error';

const DEFAULT_MESSAGES: Record<Variant, string> = {
  loading: 'Се вчитува ...',
  empty: 'Нема резултати.',
  error: 'Се случи неочекувана грешка. Обидете се повторно.',
};

const TEXT_CLASSES: Record<Variant, string> = {
  loading: 'text-text-muted',
  empty: 'text-text-muted',
  error: 'text-danger',
};

type Props = Readonly<{
  variant: Variant;
  message?: string;
  className?: string;
}>;

export default function StateMessage({ variant, message, className = '' }: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 p-6 text-center ${className}`}
    >
      {variant === 'loading' && <Spinner />}
      <p className={`text-sm ${TEXT_CLASSES[variant]}`}>{message ?? DEFAULT_MESSAGES[variant]}</p>
    </div>
  );
}
