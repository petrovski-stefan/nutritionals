import { useMutation } from '@tanstack/react-query';

import * as ProductService from '@/features/products/api/products';
import type { BackendProduct } from '@/features/products/types/products';
import type { APIBaseError } from '@/shared/types/api';

type SmartSearchVariables = {
  query: string;
  pharmacyIds: number[];
  categoryIds: number[];
};

const useSmartSearchProducts = () => {
  return useMutation<BackendProduct[], APIBaseError, SmartSearchVariables>({
    mutationFn: (variables) =>
      ProductService.smartSearchProducts(
        variables.query,
        variables.pharmacyIds,
        variables.categoryIds
      ),
  });
};

export default useSmartSearchProducts;
