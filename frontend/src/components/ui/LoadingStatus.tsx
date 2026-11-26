type Props = Readonly<{
  message?: string;
}>;

// Screen-reader announcement for a region that shows skeletons while it loads
export default function LoadingStatus({ message = 'Се вчитува ...' }: Props) {
  return (
    <p
      role="status"
      className="sr-only"
    >
      {message}
    </p>
  );
}
