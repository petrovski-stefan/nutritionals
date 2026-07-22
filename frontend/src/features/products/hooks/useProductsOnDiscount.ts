import { queryOptions, useQuery } from '@tanstack/react-query';

import * as ProductService from '@/features/products/api/products';
import { productKeys } from '@/features/products/queries';

const useProductsOnDiscount = () => {
  const productsOnDiscountQueryOptions = queryOptions({
    queryKey: productKeys.discounts(),
    queryFn: ProductService.getProductsOnDiscount,
  });

  return useQuery(productsOnDiscountQueryOptions);
};

export default useProductsOnDiscount;
