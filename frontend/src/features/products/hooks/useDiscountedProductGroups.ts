import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';

import * as ProductGroupService from '@/features/products/api/productgroups';
import { productKeys } from '@/features/products/queries';

const useDiscountedProductGroups = (categoryId: number | null) => {
  const discountedProductGroupsQueryOptions = queryOptions({
    queryKey: productKeys.discountedGroups(categoryId),
    queryFn: () => ProductGroupService.getDiscountedProductGroups(categoryId),
    placeholderData: keepPreviousData,
  });

  return useQuery(discountedProductGroupsQueryOptions);
};

export default useDiscountedProductGroups;
