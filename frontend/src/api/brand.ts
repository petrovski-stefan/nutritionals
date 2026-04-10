import axiosInstance from '../lib/axios';
import type { APIResponse } from '../types/api';
import type { BackendBrand } from '../types/brand';

const BRANDS_BASE_URL = 'api/v1/brands/';

export const getBrands = async (name: string) => {
  const params = new URLSearchParams();

  if (name) {
    params.append('name', name);
  }

  const response = await axiosInstance.get(`${BRANDS_BASE_URL}`, { params });

  return response.data as APIResponse<Array<BackendBrand>>;
};
