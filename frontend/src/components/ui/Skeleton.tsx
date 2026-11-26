type Props = Readonly<{
  className?: string;
}>;

export default function Skeleton({ className = '' }: Props) {
  return (
    <div
      aria-hidden="true"
      className={`bg-border animate-pulse rounded-lg motion-reduce:animate-none ${className}`}
    />
  );
}
