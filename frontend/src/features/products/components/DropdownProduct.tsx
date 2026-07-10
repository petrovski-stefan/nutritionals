import Badge from '../../../components/ui/Badge';
import { formatPrice } from '../prices';
import { checkIsPossiblyUnavailible } from '../utils';

type Props = Readonly<{
  name: string;
  price: number;
  discount_price: number | null;
  discount_percent?: number;
  pharmacy_name: string;
  brand_name: string | null;
  url: string;
  last_scraped_at: string;
}>;

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

  const lastScrapedAtDate = new Date(last_scraped_at);
  const isPossiblyUnavailable = checkIsPossiblyUnavailible(lastScrapedAtDate);
  const lastScrapedAt = new Date(last_scraped_at).toLocaleDateString('en-GB');

  return (
    <div className="border-border hover:bg-surface-sunken border-b px-3 py-2.5 transition-colors last:border-0 md:grid md:grid-cols-[minmax(6.5rem,auto)_1fr_auto_minmax(8rem,auto)] md:items-center md:gap-4">
      <div className="flex items-center justify-between gap-2 md:block">
        <span className="text-primary text-sm font-bold">{pharmacy_name}</span>
        <span className="text-text-muted text-xs md:mt-0.5 md:block">{brand_name ?? ''}</span>
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-text hover:decoration-accent focus-visible:outline-primary mt-1 block rounded text-sm font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 md:mt-0"
      >
        {name}
      </a>

      <div className="mt-1 flex items-center gap-2 md:mt-0 md:justify-end">
        {!!discount_percent && <Badge variant="accent">-{discount_percent}%</Badge>}

        {hasDiscountPrice ? (
          <>
            <span className="text-text-muted text-sm line-through">{formatPrice(price)}</span>
            <span className="text-accent text-lg font-semibold">
              {formatPrice(discount_price)}
            </span>
          </>
        ) : (
          <span className="text-primary text-lg font-semibold">{formatPrice(price)}</span>
        )}
      </div>

      <p
        className={`mt-1 text-xs md:mt-0 md:text-right md:text-sm ${
          isPossiblyUnavailable ? 'text-danger' : 'text-text-muted'
        }`}
      >
        Ажурирано на {lastScrapedAt}
      </p>
    </div>
  );
}
