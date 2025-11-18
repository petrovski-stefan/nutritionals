import { XIcon } from 'lucide-react';
import type { ProductInCollection as ProductInCollectionType } from '../../types/collection';

type Props = ProductInCollectionType & {
  collectionId: number;
  removeProduct: (collectionId: number, productId: number) => void;
};

export default function ProductInCollection({
  id,
  price,
  name,

  discount_price,
  pharmacy_logo,
  updated_at,
  collectionId,
  removeProduct,
}: Props) {
  const hasDiscountPrice = discount_price !== '';
  const originalPriceStyles = hasDiscountPrice
    ? 'line-through text-accent text-sm text-primary'
    : 'text-xl font-semibold text-primary';
  const discountPriceStyles = hasDiscountPrice
    ? 'text-xl font-semibold ml-2 text-accent'
    : 'hidden';

  return (
    <div className="flex items-center justify-between rounded-xl border p-3 shadow-sm transition hover:shadow-md">
      {/* Left */}
      <div className="mr-3 h-[10%] w-[10%]">
        <img
          src={pharmacy_logo}
          alt={`${name}'s pharmacy logo`}
        />
      </div>

      {/* Center */}
      <div className="ml-3 flex flex-1 flex-col items-start">
        <p className="text-dark hover:decoration-secondary font-semibold hover:underline">{name}</p>
        <div className="flex items-center gap-2">
          <span className={originalPriceStyles}>{price}</span>
          <span className={discountPriceStyles}>{discount_price}</span>
        </div>
        <p className="text-dark/60 text-sm">
          Updated: {new Date(updated_at).toLocaleDateString('en-GB')}
        </p>
      </div>

      {/* Right */}
      <div className="h-[10%] w-[10%]">
        <button
          onClick={() => removeProduct(collectionId, id)}
          className="ml-4 cursor-pointer rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
