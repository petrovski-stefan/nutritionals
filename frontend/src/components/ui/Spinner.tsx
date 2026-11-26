// Inline progress for actions (pending buttons); data views load with skeletons instead
export default function Spinner() {
  return (
    <div
      role="status"
      aria-label="Се вчитува"
      className="border-border border-t-primary h-4 w-4 animate-spin rounded-full border-2"
    />
  );
}
