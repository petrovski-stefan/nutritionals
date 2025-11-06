type Props = {
  name: string;
  price: string;
  discountPrice: string;
  pharmacyName: string;
};

export default function BestDealsProductCard({ name, price, discountPrice, pharmacyName }: Props) {
  return (
    <div className="border-dark/50 relative flex w-[15%] min-w-[180px] flex-col items-center gap-4 rounded-4xl border-2 bg-white p-5 transition-transform hover:scale-105 hover:shadow-lg">
      {/* Product Name */}
      <p className="text-dark text-center text-lg font-semibold">{name}</p>

      {/* Prices */}
      <div className="flex items-center gap-3">
        <p className="text-dark/50 line-through">{price}</p>
        <p className="text-primary text-2xl font-bold">{discountPrice}</p>
      </div>

      {/* Pharmacy Name */}
      <p className="text-dark/70 text-center text-sm">{pharmacyName}</p>
    </div>
  );
}
