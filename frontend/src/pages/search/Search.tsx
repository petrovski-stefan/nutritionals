import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import * as ProductAPI from '../../api/products';
import type { BackendProduct } from '../../types/product';
import ProductCard from './ProductCard';
import Filters from './Filters';

export default function Search() {
  const [products, setProducts] = useState<Array<BackendProduct>>([]);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const search = queryParams.get('query');

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await ProductAPI.getProducts();

      if (response.status) {
        setProducts(response.data);
      } else {
        setProducts([]);
        setError(response.errors_type);
      }
    };

    fetchProducts();
  }, []);

  const productsElements = products.map((product) => (
    <ProductCard
      key={product.id}
      imageLink={product.image_link}
      {...product}
    />
  ));

  return (
    <div className="mx-auto w-full">
      <div>Search {search}</div>
      <div className="flex justify-around">
        <Filters />
        {error ?? (
          <div className="flex w-[75%] flex-wrap justify-around gap-2">{productsElements}</div>
        )}
      </div>
    </div>
  );
}
