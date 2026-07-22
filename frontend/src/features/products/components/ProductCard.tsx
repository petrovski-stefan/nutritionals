import { ExternalLink, StarIcon } from 'lucide-react';

import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import IconButton from '@/components/ui/IconButton';
import Tooltip from '@/components/ui/Tooltip';
import type { ProductToMyList } from '@/features/my-lists/types';
import type { BackendProduct } from '@/features/products/types/products';
import { formatPrice } from '@/shared/utils/prices';

type Props = Readonly<
  BackendProduct & {
    handleClickAddProductToMyList: (productToMyList: ProductToMyList) => void;
  }
>;

export default function ProductCard({
  id,
  name,
  price,
  discount_price,
  discount_percent,
  brand_name,
  pharmacy_name,
  url,
  handleClickAddProductToMyList,
}: Props) {
  const hasBrand = brand_name !== null;

  return (
    <Card
      hover
      className="relative flex flex-col justify-between p-4"
    >
      <div className="absolute top-2 right-2 z-10">
        <Tooltip
          text="Додај во листа"
          placement="bottom"
        >
          <IconButton
            label="Додај во листа"
            variant="accentGhost"
            size="sm"
            onClick={() => {
              handleClickAddProductToMyList({
                productId: id,
                productName: name,
                pharmacyName: pharmacy_name,
              });
            }}
          >
            <StarIcon className="h-5 w-5" />
          </IconButton>
        </Tooltip>
      </div>

      <h3 className="text-text pr-8 text-lg font-semibold break-words">{name}</h3>

      <div className="mt-4 flex items-center">
        {discount_price ? (
          <div className="flex items-baseline gap-2">
            <p className="text-text-muted text-sm line-through">{formatPrice(price)}</p>
            <p className="text-primary text-xl font-bold">{formatPrice(discount_price)}</p>
            <Badge variant="accent">-{discount_percent}%</Badge>
          </div>
        ) : (
          <p className="text-primary text-xl font-bold">{formatPrice(price)}</p>
        )}
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-info focus-visible:outline-primary mt-2 flex items-center gap-1 rounded text-sm transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <ExternalLink className="h-4 w-4" />
        {hasBrand ? `${brand_name} - ${pharmacy_name}` : pharmacy_name}
      </a>
    </Card>
  );
}
