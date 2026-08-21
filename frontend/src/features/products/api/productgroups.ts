import type {
  BackendDiscountedGroups,
  BackendProductGroup,
} from '@/features/products/types/productgroups';
import axiosInstance from '@/shared/lib/axios';
import type { APIPaginatedData, APIResponseSuccessV2 } from '@/shared/types/api';

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

export const getDiscountedProductGroups = async (categoryId: number | null) => {
  const params = new URLSearchParams();

  if (categoryId !== null) {
    params.append('category_id', String(categoryId));
  }

  const url = `${PRODUCT_GROUPS_PATH}discounted/`;
  const response = await axiosInstance.get(url, { params: params });

  return (response.data as APIResponseSuccessV2<BackendDiscountedGroups>).data;
};
