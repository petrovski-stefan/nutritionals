import { ExternalLink } from 'lucide-react';
import type { BackendProduct } from '../../types/product';

type Props = BackendProduct;

export default function ProductCard({ name, price, discount_price, brand, pharmacy, url }: Props) {
  const hasDiscountPrice = discount_price !== '';
  const originalPriceStyles = hasDiscountPrice
    ? 'line-through text-primary text-sm'
    : 'text-xl font-semibold text-primary';
  const discountPriceStyles = hasDiscountPrice
    ? 'text-xl font-semibold text-accent ml-2'
    : 'hidden';

  const hasBrand = brand !== '';

  return (
    <div className="border-dark/20 hover:bg-dark/20 flex cursor-pointer flex-col justify-between rounded-xl border p-4 shadow-sm transition hover:shadow-md">
      <p className="text-dark font-semibold">{name}</p>

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
