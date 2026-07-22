import { queryOptions, useQuery } from '@tanstack/react-query';

import * as BrandService from '@/features/products/api/brands';
import { productKeys } from '@/features/products/queries';

const useBrands = () => {
  const options = queryOptions({
    queryKey: productKeys.brands(),
    queryFn: BrandService.getBrands,
  });

  return useQuery(options);
};

export default useBrands;
