import type { GroupOrdering } from './schemas';
import type { GroupFilterValue } from './types/productgroups';

export const productKeys = {
  all: ['products'] as const,
  discountedGroups: (categoryId: number | null) =>
    [...productKeys.all, 'discounted-groups', categoryId] as const,
  groups: (
    searchQuery: string,
    filters: GroupFilterValue,
    page: number,
    pageSize: number,
    ordering: GroupOrdering | null
  ) =>
    [
      ...productKeys.all,
      'groups',
      searchQuery,
      filters.categoryIds,
      filters.brandIds,
      page,
      pageSize,
      ordering,
    ] as const,
  groupsSearch: (searchQuery: string) =>
    [...productKeys.all, 'groups-search', searchQuery] as const,
  brands: () => [...productKeys.all, 'brands'] as const,
  categories: () => [...productKeys.all, 'categories'] as const,
};
