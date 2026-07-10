import { queryOptions, useQuery } from '@tanstack/react-query';

import * as ProductService from '@/features/products/api/products';
import { productKeys } from '@/features/products/queries';

const useProductsSearch = (searchQuery: string, enabled: boolean) => {
  const options = queryOptions({
    queryKey: productKeys.search(searchQuery),
    queryFn: () => ProductService.searchProducts(searchQuery),
    enabled,
  });

  return useQuery(options);
};

export default useProductsSearch;
