type Props = {
  name: string;
  price: string;
  discountPrice: string;
  pharmacyLogo: string;
};

export default function DropdownProductCard({ name, price, discountPrice, pharmacyLogo }: Props) {
  const hasDiscountPrice = discountPrice !== '';
  const priceStyles = hasDiscountPrice ? 'line-through' : '';
  const discountPriceStyles = hasDiscountPrice ? 'text-primary font-bold' : 'hidden';

  return (
    <div className="flex justify-between border-b-2 px-2 py-2">
      <div className="w-[10%]">
        <img
          src={pharmacyLogo}
          alt={name}
        />
      </div>
      <p className="text-md w-[50%]">{name}</p>
      <p>
        <span className={`text-center ${priceStyles}`}>{price}</span>
        <span> </span>
        <span className={`text-center ${discountPriceStyles}`}>{discountPrice}</span>
      </p>
    </div>
  );
}
