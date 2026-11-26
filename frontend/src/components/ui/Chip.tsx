import type { ReactNode } from 'react';

const BASE_CLASSES =
  'focus-visible:outline-primary shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm pointer-coarse:py-2.5 font-medium transition duration-150 ease-out focus-visible:outline-2 active:scale-95 motion-reduce:transition-none focus-visible:outline-offset-2';

type Props = Readonly<{
  children: ReactNode;
  onClick: () => void;
  // Set for toggle chips (filters): styles the selected one and announces it via aria-pressed.
  // Leave unset for action chips (suggestions)
  isSelected?: boolean;
}>;

// A pill-shaped button for filters and suggestions
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
