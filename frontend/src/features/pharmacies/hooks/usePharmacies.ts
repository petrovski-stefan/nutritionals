import { queryOptions, useQuery } from '@tanstack/react-query';

import * as PharmacyService from '../api';

const usePharmacies = () => {
  const pharmaciesQueryOptions = queryOptions({
    queryKey: ['pharmacies'],
    queryFn: PharmacyService.getPharmacies,
  });

  return useQuery(pharmaciesQueryOptions);
};

export default usePharmacies;
