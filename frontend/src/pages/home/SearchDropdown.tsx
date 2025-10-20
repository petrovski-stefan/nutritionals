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
      {...product}
    ></DropdownProductCard>
  ));

  return (
    <div className="absolute top-20 w-[65%] rounded-2xl bg-neutral-200 p-2">
      {loading
        ? 'Loading ...'
        : searchProductsDropdownCards.length > 0
          ? searchProductsDropdownCards
          : 'No products found. Try again.'}
    </div>
  );
}
