import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';

import * as ProductGroupService from '../api/productgroups';
import type { GroupFilterValue } from '../types/productgroups';

const useProductGroups = (searchQuery: string, filters: GroupFilterValue, page: number) => {
  const options = queryOptions({
    queryKey: ['productGroups', searchQuery, filters.categoryIds, filters.brandIds, page],
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
