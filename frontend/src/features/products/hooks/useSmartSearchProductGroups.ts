import { useMutation } from '@tanstack/react-query';

import * as ProductService from '@/features/products/api/products';
import type { BackendProductGroup } from '@/features/products/types/productgroups';
import type { APIBaseError } from '@/shared/types/api';

type SmartSearchVariables = {
  query: string;
};

const useSmartSearchProductGroups = () => {
  return useMutation<BackendProductGroup[], APIBaseError, SmartSearchVariables>({
    mutationFn: (variables) => ProductService.smartSearchProductGroups(variables.query),
  });
};

export default useSmartSearchProductGroups;
