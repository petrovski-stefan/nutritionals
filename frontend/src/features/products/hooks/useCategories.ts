import { queryOptions, useQuery } from '@tanstack/react-query';

import * as CategoryService from '@/features/products/api/categories';
import { productKeys } from '@/features/products/queries';

const useCategories = () => {
  const options = queryOptions({
    queryKey: productKeys.categories(),
    queryFn: CategoryService.getCategories,
  });

  return useQuery(options);
};

export default useCategories;
