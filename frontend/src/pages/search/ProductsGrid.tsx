import type { BackendProduct } from '../../types/product';
import ProductCard from './ProductCard';

type Props = {
  products: Array<BackendProduct>;
};

export default function ProductsGrid({ products }: Props) {
  const productsElements = products.map((product) => (
    <ProductCard
      key={product.id}
      imageLink={product.image_link}
      {...product}
    />
  ));
  return (
    <div className="ml-10 flex w-[75%] flex-wrap justify-start gap-10 p-4">{productsElements}</div>
  );
}
