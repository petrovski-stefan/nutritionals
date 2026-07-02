import { useMutation } from '@tanstack/react-query';

import type { APIBaseError } from '../../../shared/types/api';
import * as ProductService from '../api/products';
import type { BackendProduct } from '../types/products';

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
