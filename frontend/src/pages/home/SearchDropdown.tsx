import type { BackendProduct } from '../../types/product';
import DropdownProductCard from './DropdownProduct';

type Props = {
  products: Array<BackendProduct>;
  loading: boolean;
};

export default function SearchDropdown({ products, loading }: Props) {
  const searchProductsElements = products.map((product) => (
    <DropdownProductCard
      key={product.id}
      {...product}
      imageLink={product.image_link}
    ></DropdownProductCard>
  ));

  return (
    <div className="absolute top-20 left-9 w-[65%] rounded-2xl bg-neutral-200 p-2">
      {loading
        ? 'Loading ...'
        : searchProductsElements.length > 0
          ? searchProductsElements
          : 'No products found. Try again.'}
    </div>
  );
}
