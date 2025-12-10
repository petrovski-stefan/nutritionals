import { BrainIcon, XIcon } from 'lucide-react';
import type { BackendMyListItem } from '../../types/mylist';
import MYLISTS_TEXT from '../../locale/mylists';
import Tooltip from '../../components/Tooltip';

type Props = BackendMyListItem & {
  arrayIndex: number;

  handleDeleteProductMyList: () => void;
};

export default function MyListItem({
  is_added_through_smart_search,
  product_brand_name,
  product_discount_price,
  product_name,
  product_price,
  product_updated_at,
  product_url,
  pharmacy_logo,
  created_at,
  arrayIndex,
  handleDeleteProductMyList,
}: Props) {
  const isEven = arrayIndex % 2 === 0;
  const backgroundColor = isEven ? 'bg-primary' : 'bg-white';
  const hasDiscountPrice = product_discount_price !== '';
  const originalPriceStyles = hasDiscountPrice
    ? `line-through text-center text-accent text-sm ${isEven ? 'text-white' : 'text-primary'}`
    : `text-xl text-center font-semibold ${isEven ? 'text-white' : 'text-primary'}`;
  const discountPriceStyles = hasDiscountPrice
    ? 'text-xl text-center font-semibold ml-2 text-accent'
    : 'hidden';

  return (
    <li
      className={`${backgroundColor} flex h-20 items-center justify-between rounded-md border-b border-gray-200 px-4`}
    >
      {/* Left */}
      <div className="mr-3 h-[10%] w-[10%]">
        <img
          src={pharmacy_logo}
          alt={`${product_name}'s pharmacy logo`}
        />
      </div>

      {/* Product info */}
      <div className="ml-3 flex flex-1 flex-col items-start">
        <span>
          <a
            href={product_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-dark hover:decoration-secondary font-semibold hover:underline"
          >
            {product_name}
          </a>{' '}
          {is_added_through_smart_search && (
            <Tooltip text="Паметно пребаруван продукт">
              <BrainIcon className="text-primary inline" />
            </Tooltip>
          )}
        </span>

        <p className="text-dark/50 text-sm">
          <span>{product_brand_name}</span>
          <span> / </span>
          <span>
            {MYLISTS_TEXT['products']['productAddedToMyListAt']}{' '}
            {new Date(created_at).toLocaleDateString('en-GB')}
          </span>
        </p>
      </div>

      {/* Price */}
      <div className="ml-3 flex flex-1 flex-col items-center justify-center">
        <div className="flex items-center gap-2">
          <span className={originalPriceStyles}>{product_price}</span>
          <span className={discountPriceStyles}>{product_discount_price}</span>
        </div>
        <p className="text-dark/60 text-sm">
          {MYLISTS_TEXT['products']['productPriceUpdatedAt']}{' '}
          {new Date(product_updated_at).toLocaleDateString('en-GB')}
        </p>
      </div>

      {/* Right */}
      <div className="flex h-[10%] w-[10%] items-center justify-end">
        <Tooltip text="Избриши">
          <button
            onClick={handleDeleteProductMyList}
            className="ml-4 cursor-pointer rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </Tooltip>
      </div>
    </li>
  );
}
