import { StarIcon } from 'lucide-react';
import SEARCH_TEXT from '../../locale/search';
import Tooltip from '../../components/Tooltip';
import type { BackendProduct } from '../../types/product';
import { formatPrice } from '../../utils/prices';

type Props = BackendProduct & {
  handleClickAddProductToMyList: (
    productId: number,
    productName: string,
    pharmacyName: string
  ) => void;
};

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
    <div className="relative flex items-center justify-between border-b border-neutral-200 py-3 transition-colors hover:bg-neutral-50">
      {discount_percent && (
        <p className="bg-accent/20 text-accent absolute top-0 right-0 rounded px-2.5 py-0.5 text-xs font-medium">
          -{discount_percent}%
        </p>
      )}
      <div className="flex flex-col">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-medium hover:underline"
        >
          {pharmacy_name}
        </a>
        <p className="text-xs text-gray-500">
          {`${SEARCH_TEXT['productCard']['updatedAt']} ${new Date(last_scraped_at).toLocaleDateString('en-GB')}`}
        </p>
      </div>

      <div className="flex w-56 items-center justify-end space-x-4">
        {discount_price ? (
          <>
            <p className="text-primary text-sm line-through">{formatPrice(price)}</p>
            <p className="text-accent text-lg font-semibold">{formatPrice(discount_price)}</p>
          </>
        ) : (
          <p className="text-primary text-lg font-semibold">{formatPrice(price)}</p>
        )}

        <button
          onClick={() => handleClickAddProductToMyList(id, name, pharmacy_name)}
          className="text-gray-400 transition-colors hover:text-yellow-500"
        >
          <Tooltip
            text="Додај во листа"
            placement="top"
          >
            <StarIcon className="h-5 w-5" />
          </Tooltip>
        </button>
      </div>
    </div>
  );
}
