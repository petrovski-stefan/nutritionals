import { ExternalLink } from 'lucide-react';

type Props = {
  name: string;
  price: string;
  url: string;
  brand: string;
  discountPrice: string;
  pharmacyName: string;
};

export default function BestDealsProductCard({
  name,
  price,
  discountPrice,
  pharmacyName,
  url,
  brand,
}: Props) {
  const hasBrand = brand !== '';

  return (
    <div className="border-dark/50 relative flex w-[15%] min-w-[180px] flex-col items-center gap-4 rounded-4xl border-2 bg-white p-5 transition-transform hover:scale-105 hover:shadow-lg">
      {/* Product Name */}
      <p className="text-dark text-center text-lg font-semibold">{name}</p>

      {/* Prices */}
      <div className="flex items-center gap-3">
        <p className="text-primary line-through">{price}</p>
        <p className="text-accent text-2xl font-bold">{discountPrice}</p>
      </div>

      {/* Link */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-secondary hover:text-accent flex items-center gap-1 text-sm font-medium transition-colors hover:underline"
      >
        <ExternalLink className="h-4 w-4" />

        <p className="text-center text-sm">
          {hasBrand ? `${brand} - ${pharmacyName}` : pharmacyName}
        </p>
      </a>
    </div>
  );
}
