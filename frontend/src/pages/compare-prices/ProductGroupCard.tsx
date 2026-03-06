import { useMemo } from 'react';
import type { BackendProductGroup } from '../../types/productgroup';
import ProductInGroup from './ProductInGroup';

type Props = {
  productGroup: BackendProductGroup;
  handleClickAddProductToMyList: (
    productId: number,
    productName: string,
    pharmacyName: string
  ) => void;
};

export default function ProductGroupCard({ productGroup, handleClickAddProductToMyList }: Props) {
  const productsLength = useMemo(() => {
    return productGroup.products.length;
  }, [productGroup]);

  const shouldOverflowY = productsLength > 2;

  return (
    <div
      className={`h-72 w-full md:w-[320px] ${shouldOverflowY ? 'overflow-y-scroll' : ''} rounded-xl border border-neutral-200 bg-white p-4 shadow-md transition-shadow hover:shadow-lg`}
    >
      <div className="">
        <h2 className="line-clamp-2 text-lg font-semibold text-gray-900">{productGroup.name}</h2>
        {productGroup.brand_name && (
          <p className="mt-1 text-sm text-gray-600">{productGroup.brand_name}</p>
        )}

        <p>
          <span className="text-accent text-md">{productsLength}</span> понуди
        </p>
      </div>

      <div className="mt-4 h-80 space-y-0">
        {productGroup.products.map((product) => (
          <ProductInGroup
            key={product.id}
            {...product}
            handleClickAddProductToMyList={handleClickAddProductToMyList}
          />
        ))}
      </div>
    </div>
  );
}
