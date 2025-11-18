type Props = {
  name: string;
  price: string;
  discountPrice: string;
  pharmacyLogo: string;
  url: string;
};

export default function DropdownProductCard({
  name,
  price,
  discountPrice,
  pharmacyLogo,
  url,
}: Props) {
  const hasDiscountPrice = discountPrice !== '';
  const originalPriceStyles = hasDiscountPrice
    ? 'line-through text-accent text-sm text-primary'
    : 'text-xl font-semibold text-primary';
  const discountPriceStyles = hasDiscountPrice
    ? 'text-xl font-semibold ml-2 text-accent'
    : 'hidden';

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg px-4 py-2 transition-colors hover:bg-gray-500/20">
      {/* Pharmacy Logo */}
      <div className="h-10 w-10 flex-shrink-0">
        <img
          src={pharmacyLogo}
          alt={name}
          className="h-full w-full object-contain"
        />
      </div>

      {/* Product Name */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <p className="text-dark flex-1 truncate">{name}</p>
      </a>

      {/* Prices */}
      <div className="flex items-center gap-1">
        <span className={originalPriceStyles}>{price}</span>
        <span className={discountPriceStyles}>{discountPrice}</span>
      </div>
    </div>
  );
}
