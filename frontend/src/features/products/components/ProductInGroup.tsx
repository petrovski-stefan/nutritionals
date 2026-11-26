import { StarIcon } from 'lucide-react';

import Badge from '@/components/ui/Badge';
import ExternalLink from '@/components/ui/ExternalLink';
import IconButton from '@/components/ui/IconButton';
import LastUpdated from '@/components/ui/LastUpdated';
import Tooltip from '@/components/ui/Tooltip';
import type { BackendProduct } from '@/features/products/types/products';
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
  return (
    <div className="border-border hover:bg-surface-sunken flex items-center justify-between gap-3 border-b py-3 transition-colors last:border-0">
      <div className="flex min-w-0 flex-col">
        <ExternalLink
          href={url}
          className="text-primary focus-visible:outline-primary self-start rounded font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {pharmacy_name}
        </ExternalLink>
        <LastUpdated
          isoDate={last_scraped_at}
          className="text-sm"
        />
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {discount_price ? (
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5">
              {!!discount_percent && <Badge variant="accent">-{discount_percent}%</Badge>}
              <p className="text-text-muted text-sm tabular-nums line-through">
                {formatPrice(price)}
              </p>
            </div>
            <p className="text-accent text-lg font-semibold tabular-nums">
              {formatPrice(discount_price)}
            </p>
          </div>
        ) : (
          <p className="text-primary text-lg font-semibold tabular-nums">{formatPrice(price)}</p>
        )}

        <Tooltip
          text="Додај во листа"
          placement="top"
        >
          <IconButton
            label="Додај во листа"
            variant="primaryGhost"
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
