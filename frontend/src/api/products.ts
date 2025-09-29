import type { BackendProduct, BackendProductBrand, GetProductsInput } from '../types/product';
import axiosInstance from './axios';
import type { APIResponse } from '../types/api';

export const getProducts = async (queryParams: GetProductsInput) => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(queryParams)) {
    if (key === undefined || value.length === 0) {
      continue;
    }

    if (key === 'searchQueryParam') {
      params.append(`title__icontains`, value as string);
    } else if (key === 'pharmacies') {
      params.append(`pharmacy__in`, (value as Array<string>).join(','));
    } else {
      params.append(`brand__in`, (value as Array<string>).join(','));
    }
  }
  const response = await axiosInstance.get(`api/v1/products/`, {
    params: params,
  });

  return response.data as APIResponse<Array<BackendProduct>>;
};

export const searchProducts = async (searchQuery: string) => {
  const response = await axiosInstance.get(
    `api/v1/products/?title__icontains=${encodeURIComponent(searchQuery)}`
  );

  return response.data as APIResponse<Array<BackendProduct>>;
};

export const getProductsBrands = async (title: string) => {
  const response = await axiosInstance.get(
    `api/v1/products/brands/?title=${encodeURIComponent(title)}`
  );

  return response.data as APIResponse<Array<BackendProductBrand>>;
};
