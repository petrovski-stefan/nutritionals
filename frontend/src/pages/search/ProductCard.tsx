import { Star, ExternalLink } from 'lucide-react';

type Props = {
  id: number;
  name: string;
  price: string;
  brand: string;
  discountPrice: string;
  pharmacy: string;
  pharmacyLogo: string;
  url: string;
  updated_at: string;
  handleClickAddProductToCollection: (id: number, name: string) => void;
};

export default function ProductCard({
  id,
  name,
  price,
  discountPrice,
  brand,
  pharmacy,
  pharmacyLogo,
  url,
  updated_at,
  handleClickAddProductToCollection,
}: Props) {
  const hasDiscountPrice = discountPrice !== '';
  const originalPriceStyles = hasDiscountPrice
    ? 'line-through text-accent text-sm text-primary'
    : 'text-xl font-semibold text-primary';
  const discountPriceStyles = hasDiscountPrice
    ? 'text-xl font-semibold ml-2 text-accent'
    : 'hidden';

  return (
    <div className="group relative flex h-[22rem] w-[18rem] flex-col justify-between rounded-2xl border border-neutral-300 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
      {/* Star Button */}
      <button
        onClick={() => handleClickAddProductToCollection(id, name)}
        className="hover:text-primary hover:bg-primary/10 absolute top-3 right-3 z-10 cursor-pointer rounded-full p-2 text-gray-400 transition-colors"
        aria-label="Add to collection"
      >
        <Star className="h-5 w-5 fill-current" />
      </button>

      {/* Sale Tag */}
      {hasDiscountPrice && (
        <div className="bg-accent absolute top-12 right-3 rounded-full px-3 py-1 text-xs font-medium text-white shadow-sm">
          SALE
        </div>
      )}

      {/* Top Section */}
      <div className="flex items-start justify-between p-4 pt-8">
        <img
          src={pharmacyLogo}
          alt={`${pharmacy} logo`}
          className="h-14 w-14 rounded-md border border-neutral-200 object-contain"
        />
      </div>

      {/* Product Info */}
      <div className="flex flex-col px-4">
        <h3 className="text-dark h-16 text-lg font-medium">{name}</h3>

        <div className="mt-2 flex items-center">
          <p className={originalPriceStyles}>{price.slice(0, 10)}</p>
          <p className={discountPriceStyles}>{discountPrice.slice(0, 10)}</p>
        </div>

        <p className="text-dark/60 mt-1 text-sm">{brand || <span>&nbsp;</span>}</p>
      </div>

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-2 px-4 pb-4">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-secondary hover:text-accent flex items-center gap-1 text-sm font-medium transition-colors hover:underline"
        >
          <ExternalLink className="h-4 w-4" />
          View on {pharmacy}
        </a>

        <p className="text-xs text-gray-500">
          Updated: {new Date(updated_at).toLocaleDateString('en-GB')}
        </p>
      </div>
    </div>
  );
}
