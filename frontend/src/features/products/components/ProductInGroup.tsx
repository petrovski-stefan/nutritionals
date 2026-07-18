import { StarIcon } from 'lucide-react';

import Badge from '@/components/ui/Badge';
import IconButton from '@/components/ui/IconButton';
import Tooltip from '@/components/ui/Tooltip';
import type { BackendProduct } from '@/features/products/types/products';
import { checkIsPossiblyUnavailable } from '@/shared/utils/dates';
import { formatPrice } from '@/shared/utils/prices';

type Props = Readonly<
  BackendProduct & {
    handleClickAddProductToMyList: (
      productId: number,
      productName: string,
      pharmacyName: string
    ) => void;
  }
>;

export default function ProductInGroup({
  id,
  name,
  pharmacy_name,
  discount_price,
  discount_percent,
  last_scraped_at,
  price,
  url,
  handleClickAddProductToMyList,
}: Props) {
  const lastScrapedAtDate = new Date(last_scraped_at);
  const isPossiblyUnavailable = checkIsPossiblyUnavailable(lastScrapedAtDate);
  const lastScrapedAt = new Date(last_scraped_at).toLocaleDateString('en-GB');

  return (
    <div className="border-border hover:bg-surface-sunken relative flex items-center justify-between gap-3 border-b py-3 transition-colors last:border-0">
      {!!discount_percent && (
        <Badge
          variant="accent"
          className="absolute top-1 right-0"
        >
          -{discount_percent}%
        </Badge>
      )}

      <div className="flex min-w-0 flex-col">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary focus-visible:outline-primary rounded font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {pharmacy_name}
        </a>
        <p className={`text-sm ${isPossiblyUnavailable ? 'text-danger' : 'text-text-muted'}`}>
          {`Ажурирано: ${lastScrapedAt}`}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {discount_price ? (
          <div className="flex flex-col items-end">
            <p className="text-text-muted text-sm line-through">{formatPrice(price)}</p>
            <p className="text-accent text-lg font-semibold">{formatPrice(discount_price)}</p>
          </div>
        ) : (
          <p className="text-primary text-lg font-semibold">{formatPrice(price)}</p>
        )}

        <Tooltip
          text="Додај во листа"
          placement="top"
        >
          <IconButton
            label="Додај во листа"
            variant="accentGhost"
            size="sm"
            onClick={() => {
              handleClickAddProductToMyList(id, name, pharmacy_name);
            }}
          >
            <StarIcon className="h-5 w-5" />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}
