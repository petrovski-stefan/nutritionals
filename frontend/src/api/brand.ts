import type { APIResponse } from '../types/api';
import type { BackendBrandWithGroupCount } from '../types/brand';
import axiosInstance from './axios';

const BRANDS_BASE_URL = 'api/v1/brands/';

class BrandService {
  static readonly getBrandsWithProductCount = async (name: string) => {
    const params = new URLSearchParams();

    if (name) {
      params.append('name', name);
    }

    const response = await axiosInstance.get(`${BRANDS_BASE_URL}`, { params });

    return response.data as APIResponse<Array<BackendBrandWithGroupCount>>;
  };
}

export default BrandService;
