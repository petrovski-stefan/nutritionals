import { XIcon } from 'lucide-react';
import type { BackendProduct } from '../../types/product';
import ProductCard from './ProductCard';

type Props = {
  query: string;
  products: BackendProduct[];
  onClose: () => void;
};

export default function SmartSearchResultsModal({ query, products, onClose }: Props) {
  const productsLength = products.length;
  const hasProducts = productsLength > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative max-h-[80vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        {/* Close modal button */}
        <button
          onClick={onClose}
          className="text-dark/50 hover:text-dark absolute top-4 right-4 cursor-pointer transition"
        >
          <XIcon className="h-6 w-6" />
        </button>

        {/* Results text */}
        <h2 className="text-dark mb-4 text-xl font-bold">
          {hasProducts
            ? `AI found ${productsLength} products that match your query: "${query}".`
            : `AI didn't find any products that match your query "${query}".`}
        </h2>

        {/* Product cards */}
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
