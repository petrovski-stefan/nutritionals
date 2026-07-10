import { queryOptions, useQuery } from '@tanstack/react-query';

import * as PharmacyService from '@/features/pharmacies/api';
import { pharmacyKeys } from '@/features/pharmacies/queries';

const usePharmacies = () => {
  const pharmaciesQueryOptions = queryOptions({
    queryKey: pharmacyKeys.all,
    queryFn: PharmacyService.getPharmacies,
  });

  return useQuery(pharmaciesQueryOptions);
};

export default usePharmacies;
