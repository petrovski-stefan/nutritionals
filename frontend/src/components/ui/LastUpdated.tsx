import { checkIsPossiblyUnavailable, formatDate } from '@/shared/utils/dates';

type Props = Readonly<{
  isoDate: string;
  label?: string;
  className?: string;
}>;

// When a price was last scraped. A stale one says so in words as well as color,
// so the warning doesn't depend on seeing the amber
export default function LastUpdated({ isoDate, label = 'Ажурирано', className = '' }: Props) {
  const isStale = checkIsPossiblyUnavailable(new Date(isoDate));

  return (
    <p className={`${isStale ? 'text-warning' : 'text-text-muted'} ${className}`}>
      {label}: {formatDate(isoDate)}
      {isStale && ' · цената можеби не е актуелна'}
    </p>
  );
}
