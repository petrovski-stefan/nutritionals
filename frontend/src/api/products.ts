import type {
  BackendProduct,
  BackendBrand,
  ProductListQueryParams,
  BackendPharmacy,
} from '../types/product';
import axiosInstance from './axios';
import type { APIResponse } from '../types/api';

export const getProducts = async (queryParams: ProductListQueryParams) => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(queryParams)) {
    if (key === undefined || value.length === 0) {
      continue;
    }

    if (key === 'searchQueryParam') {
      params.append(`name__icontains`, value as string);
    } else if (key === 'pharmacyIds') {
      params.append(`productdiscover__pharmacy__in`, (value as Array<number>).join(','));
    } else if (key === 'brandIds') {
      params.append(`brand__in`, (value as Array<number>).join(','));
    }
  }
  const response = await axiosInstance.get(`api/v1/products/`, {
    params: params,
  });

  return response.data as APIResponse<Array<BackendProduct>>;
};

export const searchProducts = async (searchQuery: string) => {
  const response = await axiosInstance.get(
    `api/v1/products/?name__icontains=${encodeURIComponent(searchQuery)}`
  );

  return response.data as APIResponse<Array<BackendProduct>>;
};

export const getProductsOnDiscount = async () => {
  const response = await axiosInstance.get(`api/v1/products/?has_discount=true`);

  return response.data as APIResponse<Array<BackendProduct>>;
};

export const getProductsBrands = async (name: string) => {
  const response = await axiosInstance.get(
    `api/v1/products/brands/?name=${encodeURIComponent(name)}`
  );

  return response.data as APIResponse<Array<BackendBrand>>;
};

export const getPharmacies = async () => {
  const response = await axiosInstance.get('api/v1/products/pharmacies/');

  return response.data as APIResponse<Array<BackendPharmacy>>;
};
