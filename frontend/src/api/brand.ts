import type { APIResponse } from '../types/api';
import type { BackendBrandWithProductCount } from '../types/brand';
import axiosInstance from './axios';

const BRANDS_BASE_URL = 'api/v1/products/brands/';

class BrandService {
  static readonly getBrandsWithProductCount = async (name: string) => {
    const params = new URLSearchParams({ name });

    const response = await axiosInstance.get(`${BRANDS_BASE_URL}`, { params });

    return response.data as APIResponse<Array<BackendBrandWithProductCount>>;
  };
}

export default BrandService;
