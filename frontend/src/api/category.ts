import type { APIResponse } from '../types/api';
import type { BackendCategory } from '../types/category';
import axiosInstance from './axios';

const CATEGORIES_BASE_URL = 'api/v1/categories/';

class CategoryService {
  static readonly getCategories = async () => {
    const response = await axiosInstance.get(CATEGORIES_BASE_URL);

    return response.data as APIResponse<Array<BackendCategory>>;
  };
}

export default CategoryService;
