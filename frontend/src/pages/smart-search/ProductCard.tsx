import type { BackendProduct } from '../../types/product';

type Props = BackendProduct;

export default function ProductCard({ name, price, discount_price, brand, pharmacy, url }: Props) {
  const hasDiscountPrice = true;
  const originalPriceStyles = hasDiscountPrice
    ? 'line-through text-primary text-sm'
    : 'text-xl font-semibold text-primary';
  const discountPriceStyles = hasDiscountPrice
    ? 'text-xl font-semibold text-accent ml-2'
    : 'hidden';

  const hasBrand = brand !== '';

  return (
    <div className="border-dark/20 hover:bg-dark/20 flex cursor-pointer flex-col justify-between rounded-xl border p-4 shadow-sm transition hover:shadow-md">
      <a
        href={url}
        target="_blank"
      >
        <p className="text-dark font-semibold">{name}</p>

        <div className="mt-2 flex items-center">
          <p className={originalPriceStyles}>{price.slice(0, 10)}</p>
          <p className={discountPriceStyles}>{discount_price.slice(0, 10)}</p>
        </div>

        <p className="text-dark/70 mt-2 text-sm">
          {hasBrand ? `${brand} - ${pharmacy}` : `${pharmacy}`}
        </p>
      </a>
    </div>
  );
}
