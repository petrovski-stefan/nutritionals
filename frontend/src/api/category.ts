import axiosInstance from '../lib/axios';
import type { APIResponse } from '../types/api';
import type { BackendCategory } from '../types/category';

const CATEGORIES_BASE_URL = 'api/v1/categories/';

export const getCategories = async () => {
  const response = await axiosInstance.get(CATEGORIES_BASE_URL);

  return response.data as APIResponse<Array<BackendCategory>>;
};
