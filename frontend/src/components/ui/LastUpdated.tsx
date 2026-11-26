import { TriangleAlertIcon } from 'lucide-react';

import { checkIsPossiblyUnavailable, formatDate } from '@/shared/utils/dates';

import Tooltip from './Tooltip';

const STALE_TEXT = 'Цената можеби не е актуелна';

type Props = Readonly<{
  isoDate: string;
  label?: string;
  className?: string;
}>;

// When a price was last scraped. A stale one adds a warning icon (tooltip on hover, the same
// words for screen readers), so the warning doesn't depend on seeing the amber
export default function LastUpdated({ isoDate, label = 'Ажурирано', className = '' }: Props) {
  const isStale = checkIsPossiblyUnavailable(new Date(isoDate));

  return (
    <p className={`${isStale ? 'text-warning' : 'text-text-muted'} ${className}`}>
      {label}: {formatDate(isoDate)}
      {isStale && (
        <>
          <span className="sr-only"> · {STALE_TEXT}</span>
          <Tooltip text={STALE_TEXT}>
            <TriangleAlertIcon
              aria-hidden="true"
              className="ml-1 inline h-3.5 w-3.5 align-middle"
            />
          </Tooltip>
        </>
      )}
    </p>
  );
}
