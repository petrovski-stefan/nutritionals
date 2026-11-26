type Props = Readonly<{
  // Element to jump to; it needs tabIndex={-1} so it can take focus
  targetId: string;
  children: string;
  className?: string;
}>;

export default function SkipLink({ targetId, children, className = '' }: Props) {
  return (
    <a
      href={`#${targetId}`}
      onClick={(e) => {
        // Move focus without adding #id to the URL
        e.preventDefault();
        document.getElementById(targetId)?.focus();
      }}
      className={`bg-surface-raised text-text focus-visible:outline-primary sr-only rounded-lg text-sm font-semibold shadow-md focus:not-sr-only focus:px-4 focus:py-2 focus-visible:outline-2 ${className}`}
    >
      {children}
    </a>
  );
}
