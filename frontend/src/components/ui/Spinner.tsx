type Size = 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-4',
  lg: 'h-16 w-16 border-4',
};

type Props = Readonly<{
  size?: Size;
  className?: string;
}>;

export default function Spinner({ size = 'md', className = '' }: Props) {
  return (
    <div
      role="status"
      aria-label="Се вчитува"
      className={`border-border border-t-accent animate-spin rounded-full ${SIZE_CLASSES[size]} ${className}`}
    />
  );
}
