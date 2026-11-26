import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';

import * as ProductGroupService from '@/features/products/api/productgroups';
import { productKeys } from '@/features/products/queries';
import type { GroupOrdering } from '@/features/products/schemas';
import type { GroupFilterValue } from '@/features/products/types/productgroups';

type GroupListView = {
  page: number;
  pageSize: number;
  ordering: GroupOrdering | null;
};

const useProductGroups = (
  searchQuery: string,
  filters: GroupFilterValue,
  { page, pageSize, ordering }: GroupListView
) => {
  const options = queryOptions({
    queryKey: productKeys.groups(searchQuery, filters, page, pageSize, ordering),
    queryFn: () =>
      ProductGroupService.getProductGroups(
        searchQuery,
        filters.categoryIds,
        filters.brandIds,
        page,
        { pageSize, ordering }
      ),
    placeholderData: keepPreviousData,
  });

  return useQuery(options);
};

export default useProductGroups;
