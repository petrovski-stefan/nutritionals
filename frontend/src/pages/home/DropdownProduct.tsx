type Props = {
  name: string;
  price: string;
  discountPrice: string;
  pharmacyLogo: string;
};

export default function DropdownProductCard({ name, price, discountPrice, pharmacyLogo }: Props) {
  const hasDiscountPrice = discountPrice !== '';
  const priceStyles = hasDiscountPrice ? 'line-through text-dark/50' : 'text-dark';
  const discountPriceStyles = hasDiscountPrice ? 'text-primary font-semibold ml-2' : '';

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
      <p className="text-dark flex-1 truncate">{name}</p>

      {/* Prices */}
      <div className="flex items-center gap-1">
        <span className={priceStyles}>{price}</span>
        {hasDiscountPrice && <span className={discountPriceStyles}>{discountPrice}</span>}
      </div>
    </div>
  );
}
