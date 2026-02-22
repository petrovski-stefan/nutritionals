import axiosInstance from './axios';
import type { APIPaginatedResponse } from '../types/api';
import type { BackendProductGroup } from '../types/productgroup';

const PRODUCT_GROUPS_PATH = 'api/v1/product-groups/';

export const getProductGroups = async (
  searchQuery: string,
  categoryIds: number[],
  brandIds: number[],
  page: number = 1
) => {
  const params = new URLSearchParams();

  params.append('page', `${page}`);

  if (searchQuery) {
    params.append('name', searchQuery);
  }

  if (categoryIds && categoryIds.length > 0) {
    params.append('categories', categoryIds.join(','));
  }

  if (brandIds && brandIds.length > 0) {
    params.append('brand', brandIds.join(','));
  }
  const response = await axiosInstance.get(PRODUCT_GROUPS_PATH, { params: params });

  return response.data as APIPaginatedResponse<Array<BackendProductGroup>>;
};
