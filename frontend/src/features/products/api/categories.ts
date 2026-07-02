import axiosInstance from '../../../lib/axios';
import type { APIResponseSuccessV2 } from '../../../shared/types/api';
import type { BackendCategory } from '../types/categories';

const CATEGORIES_BASE_URL = 'api/v1/categories/';

export const getCategories = async () => {
  const response = await axiosInstance.get(CATEGORIES_BASE_URL);

  return (response.data as APIResponseSuccessV2<BackendCategory[]>).data;
};
