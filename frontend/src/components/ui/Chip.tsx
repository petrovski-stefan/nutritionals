import type { ReactNode } from 'react';

const BASE_CLASSES =
  'focus-visible:outline-primary shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm pointer-coarse:py-2.5 font-medium transition duration-150 ease-out focus-visible:outline-2 active:scale-95 motion-reduce:transition-none focus-visible:outline-offset-2';

type Props = Readonly<{
  children: ReactNode;
  onClick: () => void;
  // Leave undefined for action chips (suggestions), so they get no aria-pressed
  isSelected?: boolean;
}>;

export default function Chip({ children, onClick, isSelected }: Props) {
  const stateClasses = isSelected
    ? 'border-primary bg-primary/10 text-primary'
    : 'border-border text-text-muted hover:border-primary hover:text-primary';

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
      className={`${BASE_CLASSES} ${stateClasses}`}
    >
      {children}
    </button>
  );
}
