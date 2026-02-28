import { ExternalLink, StarIcon } from 'lucide-react';
import type { BackendProduct } from '../../types/product';
import type { ProductToMyList } from '../../types/mylist';
import Tooltip from '../../components/Tooltip';
import { formatPrice } from '../../utils/prices';

type Props = BackendProduct & {
  handleClickAddProductToMyList: (productToMyList: ProductToMyList) => void;
};

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
    <div className="relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <button
        onClick={() =>
          handleClickAddProductToMyList({
            productId: id,
            productName: name,
            pharmacyName: pharmacy_name,
          })
        }
        className="absolute top-2 right-2 z-10 text-gray-400 transition-colors hover:text-yellow-500"
      >
        <Tooltip
          text="Додај во листа"
          placement="bottom"
        >
          <StarIcon className="h-5 w-5" />
        </Tooltip>
      </button>

      <h3 className="pr-8 text-lg font-semibold break-words">{name}</h3>

      <div className="mt-4 flex items-center">
        {discount_price ? (
          <div className="flex items-baseline gap-2">
            <p className="text-sm text-gray-500 line-through">{formatPrice(price)}</p>
            <p className="text-primary text-xl font-bold">{formatPrice(discount_price)}</p>
            <span className="text-accent text-base font-semibold">-{discount_percent}%</span>
          </div>
        ) : (
          <p className="text-primary text-xl font-bold">{formatPrice(price)}</p>
        )}
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 flex items-center gap-1 text-sm text-blue-600 transition-colors hover:text-blue-800 hover:underline"
      >
        <ExternalLink className="h-4 w-4" />
        {hasBrand ? `${brand_name} - ${pharmacy_name}` : pharmacy_name}
      </a>
    </div>
  );
}
