import { queryOptions, useQuery } from '@tanstack/react-query';

import * as BrandService from '../api/brands';

const useBrands = () => {
  const options = queryOptions({
    queryKey: ['brands'],
    queryFn: BrandService.getBrands,
  });

  return useQuery(options);
};

export default useBrands;
