import { ExternalLink, StarIcon } from 'lucide-react';
import type { BackendProduct } from '../../types/product';
import type { ProductToMyList } from '../../types/mylist';
import Tooltip from '../../components/Tooltip';

type Props = BackendProduct & {
  handleClickAddProductToMyList: (productToMyList: ProductToMyList) => void;
};

export default function ProductCard({
  id,
  name,
  price,
  discount_price,
  brand,
  pharmacy,
  url,
  handleClickAddProductToMyList,
}: Props) {
  const hasDiscountPrice = discount_price !== '';
  const originalPriceStyles = hasDiscountPrice
    ? 'line-through text-primary text-sm'
    : 'text-xl font-semibold text-primary';
  const discountPriceStyles = hasDiscountPrice
    ? 'text-xl font-semibold text-accent ml-2'
    : 'hidden';

  const hasBrand = brand !== '';

  return (
    <div className="border-dark/20 hover:bg-dark/20 relative flex cursor-pointer flex-col justify-between rounded-xl border p-4 shadow-sm transition hover:shadow-md">
      <p className="text-dark mr-5 font-semibold">{name}</p>

      <button
        onClick={() => handleClickAddProductToMyList({ id, name })}
        className="hover:text-primary hover:bg-primary/10 absolute top-3 right-3 z-10 cursor-pointer rounded-full p-2 text-gray-400 transition-colors"
      >
        <Tooltip
          text="Додај во листа"
          placement="bottom"
        >
          <StarIcon className="h-5 w-5 fill-current" />
        </Tooltip>
      </button>

      {/* Prices */}
      <div className="mt-2 flex items-center">
        <p className={originalPriceStyles}>{price.slice(0, 10)}</p>
        <p className={discountPriceStyles}>{discount_price.slice(0, 10)}</p>
      </div>
      {/* Link */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-secondary hover:text-accent flex items-center gap-1 text-sm font-medium transition-colors hover:underline"
      >
        <ExternalLink className="h-4 w-4" />

        <p className="text-center text-sm">{hasBrand ? `${brand} - ${pharmacy}` : pharmacy}</p>
      </a>
    </div>
  );
}
