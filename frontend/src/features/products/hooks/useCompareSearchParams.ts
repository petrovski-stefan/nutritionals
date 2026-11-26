import { useSearchParams } from 'react-router-dom';

import { type GroupOrdering, toGroupOrdering } from '@/features/products/schemas';
import type { GroupFilterValue } from '@/features/products/types/productgroups';

const parseIds = (value: string | null) =>
  value
    ? value
        .split(',')
        .map(Number)
        .filter((id) => Number.isInteger(id) && id > 0)
    : [];

type CompareParamsUpdate = {
  query?: string;
  filters?: GroupFilterValue;
  ordering?: GroupOrdering | null;
  page?: number;
};

// Compare's search lives in the URL (?q=&categories=&brands=&sort=&page=), so reloading, Back,
// sharing a link and returning from sign-in all keep it
const useCompareSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('q') ?? '';
  const filters: GroupFilterValue = {
    categoryIds: parseIds(searchParams.get('categories')),
    brandIds: parseIds(searchParams.get('brands')),
  };
  const ordering = toGroupOrdering(searchParams.get('sort'));
  const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);

  // Every change is its own history entry, so Back undoes one search, filter or page at a time
  const updateSearchParams = (next: CompareParamsUpdate) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      // Empty values leave the URL, so a plain /compare means "no search"
      const setOrDelete = (key: string, value: string) => {
        if (value) params.set(key, value);
        else params.delete(key);
      };

      if (next.query !== undefined) setOrDelete('q', next.query);
      if (next.filters) {
        setOrDelete('categories', next.filters.categoryIds.join(','));
        setOrDelete('brands', next.filters.brandIds.join(','));
      }
      if (next.ordering !== undefined) setOrDelete('sort', next.ordering ?? '');
      if (next.page !== undefined) setOrDelete('page', next.page > 1 ? String(next.page) : '');

      return params;
    });
  };

  return { query, filters, ordering, page, updateSearchParams };
};

export default useCompareSearchParams;
