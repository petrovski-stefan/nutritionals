import type { BackendDiscountedProduct, BackendProduct } from '@/features/products/types/products';
import axiosInstance from '@/shared/lib/axios';
import type { APIResponseSuccessV2 } from '@/shared/types/api';

const PRODUCTS_BASE_PATH = 'api/v1/products/';

export const searchProducts = async (searchQuery: string) => {
  const params = new URLSearchParams();
  params.append('q', searchQuery);

  const url = `${PRODUCTS_BASE_PATH}search/`;
  const response = await axiosInstance.get(url, { params });

  return (response.data as APIResponseSuccessV2<BackendProduct[]>).data;
};

export const smartSearchProducts = async (
  searchQuery: string,
  pharmacyIds: number[],
  categoryIds: number[]
) => {
  const url = `${PRODUCTS_BASE_PATH}smart-search/`;
  const response = await axiosInstance.post(url, {
    query: searchQuery,
    pharmacy_ids: pharmacyIds,
    category_ids: categoryIds,
  });

  return (response.data as APIResponseSuccessV2<BackendProduct[]>).data;
};

export const getProductsOnDiscount = async () => {
  const url = `${PRODUCTS_BASE_PATH}discounted/`;
  const response = await axiosInstance.get(url);

  return (response.data as APIResponseSuccessV2<BackendDiscountedProduct[]>).data;
};
