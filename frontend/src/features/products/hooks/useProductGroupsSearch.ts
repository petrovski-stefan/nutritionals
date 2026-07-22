import { queryOptions, useQuery } from '@tanstack/react-query';

import * as ProductGroupService from '@/features/products/api/productgroups';
import { productKeys } from '@/features/products/queries';

const useProductGroupsSearch = (searchQuery: string, enabled: boolean) => {
  const options = queryOptions({
    queryKey: productKeys.groupsSearch(searchQuery),
    queryFn: () => ProductGroupService.getProductGroups(searchQuery, [], [], 1),
    enabled,
  });

  return useQuery(options);
};

export default useProductGroupsSearch;
