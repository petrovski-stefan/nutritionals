import Badge from '@/components/ui/Badge';
import LastUpdated from '@/components/ui/LastUpdated';
import type { BackendProduct } from '@/features/products/types/products';
import { formatPrice } from '@/shared/utils/prices';

export default function DropdownGroupOffer({
  price,
  discount_price,
  discount_percent,
  pharmacy_name,
  url,
  last_scraped_at,
}: Readonly<BackendProduct>) {
  return (
    <div className="border-border flex items-center justify-between gap-3 border-b py-2 last:border-0">
      <div className="flex min-w-0 flex-col">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary focus-visible:outline-primary truncate rounded py-1 text-sm font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {pharmacy_name}
        </a>
        <LastUpdated
          isoDate={last_scraped_at}
          className="text-xs"
        />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {!!discount_percent && <Badge variant="accent">-{discount_percent}%</Badge>}

        {discount_price !== null ? (
          <div className="flex flex-col items-end">
            <p className="text-text-muted text-xs tabular-nums line-through">
              {formatPrice(price)}
            </p>
            <p className="text-accent text-sm font-semibold tabular-nums">
              {formatPrice(discount_price)}
            </p>
          </div>
        ) : (
          <p className="text-primary text-sm font-semibold tabular-nums">{formatPrice(price)}</p>
        )}
      </div>
    </div>
  );
}
