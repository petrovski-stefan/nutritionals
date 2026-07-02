import { queryOptions, useQuery } from '@tanstack/react-query';

import * as CategoryService from '../api/categories';

const useCategories = () => {
  const options = queryOptions({
    queryKey: ['categories'],
    queryFn: CategoryService.getCategories,
  });

  return useQuery(options);
};

export default useCategories;
