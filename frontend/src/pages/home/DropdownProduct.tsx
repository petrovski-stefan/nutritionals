import { ExternalLinkIcon } from 'lucide-react';
import { formatPrice } from '../../utils/prices';
import { checkIsPossiblyUnavailible } from '../../utils/availability';

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

  const lastScrapedAtDate = new Date(last_scraped_at);
  const isPossiblyUnavailable = checkIsPossiblyUnavailible(lastScrapedAtDate);
  const lastScrapedAt = new Date(last_scraped_at).toLocaleDateString('en-GB');

  return (
    <>
      {/* Big screen */}
      <div className="relative hidden grid-cols-[100px_100px_1fr_120px_150px] items-center gap-4 rounded-lg border-b px-4 py-2 transition-colors hover:bg-gray-500/10 md:grid md:overflow-x-hidden md:overflow-y-hidden">
        <div className="text-primary font-bold">{pharmacy_name}</div>

        <div className="text-sm">{brand_name || ''}</div>

        <div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <p className="text-dark hover:decoration-accent text-left text-sm font-medium hover:underline">
              {name}
            </p>
          </a>
        </div>

        <div className="relative flex flex-col items-center gap-1">
          {discount_percent && (
            <span className="bg-accent absolute top-5 left-28 -translate-y-1/2 rounded-full px-2 py-1 text-xs font-bold text-white shadow-sm">
              -{discount_percent}%
            </span>
          )}

          <span className={originalPriceStyles}>{formatPrice(price)}</span>
          <span className={discountPriceStyles}>{formatPrice(discount_price)}</span>
        </div>

        <p
          className={`text-right text-sm ${
            isPossiblyUnavailable ? 'text-red-500' : 'text-gray-500'
          }`}
        >
          <span>Ажурирано на {lastScrapedAt}</span>
        </p>
      </div>

      {/* Mobile */}
      <div className="relative flex h-32 w-full items-center gap-3 rounded-lg border-b px-3 py-2 transition-colors hover:bg-gray-500/10 md:hidden">
        <div className="relative flex h-full w-2/3 flex-col justify-between text-left">
          <p className="line-clamp-6 font-medium">{name}</p>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary absolute top-1 -left-4"
          >
            <ExternalLinkIcon className="h-4 w-4" />
          </a>

          <p className="text-sm text-gray-500">Ажурирано на {lastScrapedAt}</p>
        </div>

        <div className="flex h-full w-1/3 flex-col justify-between">
          <div className="flex items-start justify-end gap-2 text-sm">
            {discount_percent && (
              <span className="bg-accent rounded-full px-2 py-1 text-xs font-bold text-white shadow-sm">
                -{discount_percent}%
              </span>
            )}
            <span className="text-primary font-bold">{pharmacy_name}</span>
          </div>

          <div className="flex flex-col items-center">
            {discount_price ? (
              <>
                <p className="text-sm text-gray-400 line-through">{formatPrice(price)}</p>
                <p className="text-accent text-xl font-semibold">{formatPrice(discount_price)}</p>
              </>
            ) : (
              <p className="text-primary text-xl font-semibold">{formatPrice(price)}</p>
            )}
          </div>

          <p className="text-right text-sm text-gray-600">{brand_name || ''}</p>
        </div>
      </div>
    </>
  );
}
