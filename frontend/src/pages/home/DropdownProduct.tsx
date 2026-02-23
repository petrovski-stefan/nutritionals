import { formatPrice } from '../../utils/prices';

type Props = {
  name: string;
  price: number;
  discount_price: number | null;
  discount_percent?: number;
  pharmacy_name: string;
  brand_name: string | null;
  url: string;
  last_scraped_at: string;
};

export default function DropdownProductCard({
  name,
  price,
  discount_price,
  discount_percent,
  pharmacy_name,
  brand_name,
  url,
  last_scraped_at,
}: Props) {
  const hasDiscountPrice = discount_price !== null;

  const originalPriceStyles = hasDiscountPrice
    ? 'line-through text-sm text-gray-400'
    : 'text-xl font-semibold text-primary';

  const discountPriceStyles = hasDiscountPrice
    ? 'text-xl font-semibold ml-2 text-accent'
    : 'hidden';

  return (
    <div className="relative grid grid-cols-[100px_100px_1fr_120px_150px] items-center gap-4 overflow-x-scroll rounded-lg px-4 py-2 transition-colors hover:bg-gray-500/10 md:overflow-x-hidden md:overflow-y-hidden">
      <div className="text-primary font-bold">{pharmacy_name}</div>

      <div className="text-sm">{brand_name || ''}</div>

      <div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <p className="text-dark hover:decoration-accent text-left text-sm hover:underline">
            {name}
          </p>
        </a>
      </div>

      <div className="relative flex flex-col items-center gap-1">
        {discount_percent && (
          <span className="bg-accent absolute top-5 left-30 -translate-y-1/2 rounded-full px-2 py-1 text-xs font-bold text-white shadow-sm">
            -{discount_percent}%
          </span>
        )}
        <span className={originalPriceStyles}>{formatPrice(price)}</span>
        <span className={discountPriceStyles}>{formatPrice(discount_price)}</span>
      </div>

      <div className="text-right text-sm text-gray-500">
        Ажурирано на: {new Date(last_scraped_at).toLocaleDateString('en-GB')}
      </div>
    </div>
  );
}
