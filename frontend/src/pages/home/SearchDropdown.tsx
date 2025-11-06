import type { BackendProduct } from '../../types/product';
import DropdownProductCard from './DropdownProduct';

type Props = {
  products: Array<BackendProduct>;
  loading: boolean;
};

export default function SearchDropdown({ products, loading }: Props) {
  const searchProductsDropdownCards = products.map((product) => (
    <DropdownProductCard
      key={product.id}
      pharmacyLogo={product.pharmacy_logo}
      discountPrice={product.discount_price}
      {...product}
    />
  ));

  const hasProducts = searchProductsDropdownCards.length > 0;

  return (
    <div className="bg-neutral absolute top-20 z-50 max-h-96 w-full max-w-2xl overflow-y-auto rounded-2xl p-2 shadow-lg">
      {loading && <p className="text-dark/50 py-4 text-center">Loading ...</p>}
      {!loading && hasProducts && searchProductsDropdownCards}
      {!loading && !hasProducts && (
        <p className="text-dark/50 py-4 text-center">No products found. Try again.</p>
      )}
    </div>
  );
}
