import type { BackendBrand } from '@/features/products/types/brands';
import axiosInstance from '@/shared/lib/axios';
import type { APIResponseSuccessV2 } from '@/shared/types/api';

const BRANDS_BASE_URL = 'api/v1/brands/';

export const getBrands = async () => {
  const response = await axiosInstance.get(BRANDS_BASE_URL);

  return (response.data as APIResponseSuccessV2<BackendBrand[]>).data;
};
