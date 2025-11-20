import type { BackendProduct } from '../../types/product';
import DropdownProductCard from './DropdownProduct';
import HOME_TEXT from '../../locale/home';

type Props = {
  products: Array<BackendProduct>;
  isLoading: boolean;
  error: 'unexpectedError' | 'noProductsFoundError' | null;
};

export default function SearchDropdown({ products, isLoading, error }: Props) {
  const searchProductsDropdownCards = products.map((product) => (
    <DropdownProductCard
      key={product.id}
      pharmacyLogo={product.pharmacy_logo}
      discountPrice={product.discount_price}
      {...product}
    />
  ));

  return (
    <div className="bg-neutral absolute top-20 z-50 max-h-96 w-full max-w-2xl overflow-y-auto rounded-2xl p-2 shadow-lg">
      {isLoading && <p className="text-dark/50 py-4 text-center">{HOME_TEXT['form']['loading']}</p>}
      {!isLoading && !error && searchProductsDropdownCards}
      {!isLoading && error && (
        <p className="text-dark/50 py-4 text-center">{HOME_TEXT['form'][error]}</p>
      )}
    </div>
  );
}
