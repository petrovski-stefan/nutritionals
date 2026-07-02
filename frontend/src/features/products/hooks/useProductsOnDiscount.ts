import { queryOptions, useQuery } from '@tanstack/react-query';

import * as ProductService from '../api/products';

const useProductsOnDiscount = () => {
  const productsOnDiscountQueryOptions = queryOptions({
    queryKey: ['productsOnDiscount'],
    queryFn: ProductService.getProductsOnDiscount,
  });

  return useQuery(productsOnDiscountQueryOptions);
};

export default useProductsOnDiscount;
