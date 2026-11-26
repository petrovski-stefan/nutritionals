type Props = Readonly<{
  message?: string;
}>;

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
