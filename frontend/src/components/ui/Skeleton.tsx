type Props = Readonly<{
  className?: string;
}>;

// Decorative only: the loading region around it announces the state with LoadingStatus
export default function Skeleton({ className = '' }: Props) {
  return (
    <div
      aria-hidden="true"
      className={`bg-border animate-pulse rounded-lg motion-reduce:animate-none ${className}`}
    />
  );
}
