import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';

import * as ProductGroupService from '@/features/products/api/productgroups';
import { productKeys } from '@/features/products/queries';
import type { GroupFilterValue } from '@/features/products/types/productgroups';

const useProductGroups = (searchQuery: string, filters: GroupFilterValue, page: number) => {
  const options = queryOptions({
    queryKey: productKeys.groups(searchQuery, filters, page),
    queryFn: () =>
      ProductGroupService.getProductGroups(
        searchQuery,
        filters.categoryIds,
        filters.brandIds,
        page
      ),
    placeholderData: keepPreviousData,
  });

  return useQuery(options);
};

export default useProductGroups;
