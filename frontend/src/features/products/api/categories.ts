import type { BackendCategory } from '@/features/products/types/categories';
import axiosInstance from '@/shared/lib/axios';
import type { APIResponseSuccessV2 } from '@/shared/types/api';

const CATEGORIES_BASE_URL = 'api/v1/categories/';

export const getCategories = async () => {
  const response = await axiosInstance.get(CATEGORIES_BASE_URL);

  return (response.data as APIResponseSuccessV2<BackendCategory[]>).data;
};
