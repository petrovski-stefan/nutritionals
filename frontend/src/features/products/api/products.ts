import type { BackendProductGroup } from '@/features/products/types/productgroups';
import axiosInstance from '@/shared/lib/axios';
import type { APIResponseSuccessV2 } from '@/shared/types/api';

const PRODUCTS_BASE_PATH = 'api/v1/products/';

export const smartSearchProductGroups = async (searchQuery: string) => {
  const url = `${PRODUCTS_BASE_PATH}smart-search/`;
  const response = await axiosInstance.post(url, {
    query: searchQuery,
  });

  return (response.data as APIResponseSuccessV2<BackendProductGroup[]>).data;
};
