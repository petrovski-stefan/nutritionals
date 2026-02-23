import { ExternalLink } from 'lucide-react';
import { formatPrice } from '../../utils/prices';

type Props = {
  name: string;
  url: string;
  brand_name: string | null;
  price: number;
  discount_price: number;
  discount_percent: number;
  pharmacy_name: string;
  last_scraped_at: string | null;
};

export default function BestDealsProductCard({
  name,
  price,
  discount_price,
  discount_percent,
  pharmacy_name,
  url,
  brand_name,
  last_scraped_at,
}: Props) {
  const hasBrand = brand_name !== null;
  const lastScrapedAt = last_scraped_at
    ? new Date(last_scraped_at).toLocaleDateString('en-GB')
    : '/';

  return (
    <div className="flex w-[190px] flex-col items-center rounded-3xl border border-gray-200 bg-white p-4 shadow-md transition-transform hover:scale-105 hover:shadow-xl">
      <div className="mb-2 flex w-full justify-center">
        <span className="bg-accent rounded-full px-3 py-1 text-sm font-bold text-white shadow-sm">
          -{discount_percent}%
        </span>
      </div>

      <div className="mb-3 flex min-h-[3.5rem] w-full items-center justify-center">
        <p className="line-clamp-3 text-center text-sm font-semibold text-black">{name}</p>
      </div>

      <div className="mb-3 flex min-h-[2.5rem] w-full flex-col items-center gap-1">
        {discount_price ? (
          <>
            <p className="text-primary text-sm line-through">{formatPrice(price)}</p>
            <p className="text-accent truncate text-center text-lg font-bold">
              {formatPrice(discount_price)}
            </p>
          </>
        ) : (
          <p className="text-primary truncate text-center text-lg font-bold">
            {formatPrice(price)}
          </p>
        )}
      </div>

      <div className="mb-3 flex min-h-[2.5rem] w-full justify-center">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-accent flex w-full items-center justify-center gap-1 truncate rounded-lg px-3 py-2 text-center text-xs font-medium transition-colors"
        >
          <ExternalLink className="h-4 w-4 flex-shrink-0" />
          <span className="truncate text-center">
            {hasBrand ? `${brand_name} - ${pharmacy_name}` : pharmacy_name}
          </span>
        </a>
      </div>

      <div className="flex w-full justify-center">
        <p className="text-center text-xs text-gray-400">Ажурирано на: {lastScrapedAt}</p>
      </div>
    </div>
  );
}
