import axiosInstance from '../../../lib/axios';
import type { APIPaginatedData, APIResponseSuccessV2 } from '../../../shared/types/api';
import type { BackendProductGroup } from '../types/productgroups';

const PRODUCT_GROUPS_PATH = 'api/v1/product-groups/';

export const getProductGroups = async (
  searchQuery: string,
  categoryIds: number[],
  brandIds: number[],
  page: number = 1
) => {
  const params = new URLSearchParams();

  params.append('page', String(page));

  if (searchQuery) {
    params.append('q', searchQuery);
  }

  if (categoryIds.length > 0) {
    params.append('categories', categoryIds.join(','));
  }

  if (brandIds.length > 0) {
    params.append('brand', brandIds.join(','));
  }
  const response = await axiosInstance.get(PRODUCT_GROUPS_PATH, { params: params });

  return (response.data as APIResponseSuccessV2<APIPaginatedData<BackendProductGroup>>).data;
};
