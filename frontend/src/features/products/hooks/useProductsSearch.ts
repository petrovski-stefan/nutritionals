import { queryOptions, useQuery } from '@tanstack/react-query';

import * as ProductService from '../api/products';

const useProductsSearch = (searchQuery: string, enabled: boolean) => {
  const options = queryOptions({
    queryKey: ['productsSearch', searchQuery],
    queryFn: () => ProductService.searchProducts(searchQuery),
    enabled,
  });

  return useQuery(options);
};

export default useProductsSearch;
