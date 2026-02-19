import { BrainIcon, XIcon } from 'lucide-react';
import type { BackendMyListItem } from '../../types/mylist';
import MYLISTS_TEXT from '../../locale/mylists';
import Tooltip from '../../components/Tooltip';
import { formatPrice } from '../../utils/prices';

type Props = BackendMyListItem & {
  arrayIndex: number;
  handleDeleteProductMyList: () => void;
};

export default function MyListItem({
  is_added_through_smart_search,
  product_brand_name,
  product_discount_price,
  product_discount_percent,
  product_name,
  product_price,
  product_last_scraped_at,
  product_url,
  product_pharmacy_name,
  created_at,
  arrayIndex,
  handleDeleteProductMyList,
}: Props) {
  const isEven = arrayIndex % 2 === 0;
  const backgroundColor = isEven ? 'bg-primary' : 'bg-white';
  const textColor = isEven ? 'text-white' : 'text-primary';
  const secondaryTextColor = isEven ? 'text-white/70' : 'text-primary/70';
  const scrapedTextColor = isEven ? 'text-amber-300' : 'text-amber-600';

  return (
    <li
      className={`${backgroundColor} flex flex-col justify-between gap-4 rounded-lg border-b border-gray-200 px-4 py-4 shadow-sm md:flex-row md:items-center md:gap-0`}
    >
      <div className="mr-3 flex w-full flex-row items-start justify-between md:w-auto md:flex-col md:items-center md:justify-start">
        <div className="flex-shrink-0">
          <p className="bg-accent w-24 rounded-full px-3 py-1 text-center text-sm font-medium">
            <span className={`${textColor} truncate`}>{product_pharmacy_name}</span>
          </p>
        </div>

        <div className="flex items-center gap-4 md:hidden">
          {product_discount_price ? (
            <div className="flex flex-col items-end">
              <p className={`${secondaryTextColor} truncate text-sm line-through`}>
                {formatPrice(product_price)}
              </p>
              <p className="flex items-center truncate text-xl font-bold">
                <span className={`${textColor} mr-2`}>{formatPrice(product_discount_price)}</span>
                <span className="text-accent text-base font-semibold">
                  -{product_discount_percent}%
                </span>
              </p>
            </div>
          ) : (
            <p className={`${textColor} truncate text-xl font-bold`}>
              {formatPrice(product_price)}
            </p>
          )}

          <Tooltip text="Избриши">
            <button
              onClick={handleDeleteProductMyList}
              className="cursor-pointer rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <h2 className="flex w-full min-w-0 items-center gap-1 text-lg font-semibold">
          {is_added_through_smart_search && (
            <Tooltip text="Паметно пребаруван суплемент">
              <BrainIcon className={`${textColor} h-5 w-5`} />
            </Tooltip>
          )}
          <a
            href={product_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${textColor} hover:decoration-accent break-words hover:underline md:truncate`}
          >
            {product_name}
          </a>
        </h2>

        <p className={`${secondaryTextColor} mt-1 w-full truncate text-sm`}>
          <span>{product_brand_name}</span>
          <span> / </span>
          <span>
            {MYLISTS_TEXT.products.productAddedToMyListAt}{' '}
            {new Date(created_at).toLocaleDateString('en-GB')}
          </span>
        </p>
      </div>

      <div className="hidden flex-shrink-0 flex-col items-end md:flex">
        <div className="flex items-center gap-4">
          {product_discount_price ? (
            <div className="flex max-w-[140px] flex-col items-end">
              <p className={`${secondaryTextColor} truncate text-sm line-through`}>
                {formatPrice(product_price)}
              </p>
              <p className="flex items-center truncate text-xl font-bold">
                <span className={`${textColor} mr-2`}>{formatPrice(product_discount_price)}</span>
                <span className="text-accent text-base font-semibold">
                  -{product_discount_percent}%
                </span>
              </p>
            </div>
          ) : (
            <p className={`${textColor} max-w-[140px] truncate text-xl font-bold`}>
              {formatPrice(product_price)}
            </p>
          )}

          <Tooltip text="Избриши">
            <button
              onClick={handleDeleteProductMyList}
              className="cursor-pointer rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </Tooltip>
        </div>

        <p className={`${scrapedTextColor} mt-2 text-right text-xs italic`}>
          {MYLISTS_TEXT.products.productPriceUpdatedAt}{' '}
          {new Date(product_last_scraped_at).toLocaleDateString('en-GB')}
        </p>
      </div>

      <p className={`${scrapedTextColor} text-left text-xs italic md:hidden`}>
        {MYLISTS_TEXT.products.productPriceUpdatedAt}{' '}
        {new Date(product_last_scraped_at).toLocaleDateString('en-GB')}
      </p>
    </li>
  );
}
