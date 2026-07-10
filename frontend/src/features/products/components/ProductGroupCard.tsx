import Card from '../../../components/ui/Card';
import type { BackendProductGroup } from '../types/productgroups';
import ProductInGroup from './ProductInGroup';

type Props = Readonly<{
  productGroup: BackendProductGroup;
  handleClickAddProductToMyList: (
    productId: number,
    productName: string,
    pharmacyName: string
  ) => void;
}>;

export default function ProductGroupCard({ productGroup, handleClickAddProductToMyList }: Props) {
  const productsLength = productGroup.products.length;

  return (
    <Card
      hover
      className="flex max-h-80 w-full flex-col p-4"
    >
      <div className="shrink-0">
        <h3 className="text-text line-clamp-2 text-lg font-semibold">{productGroup.name}</h3>

        {productGroup.brand_name && (
          <p className="text-text-muted mt-1 text-sm">{productGroup.brand_name}</p>
        )}

        <p className="text-text-muted text-sm">
          <span className="text-accent font-semibold">{productsLength}</span> понуди
        </p>
      </div>

      <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
        {productGroup.products.map((product) => (
          <ProductInGroup
            key={product.id}
            {...product}
            handleClickAddProductToMyList={handleClickAddProductToMyList}
          />
        ))}
      </div>
    </Card>
  );
}
