import type { BackendProduct, ProductListQueryParams } from '../types/product';
import axiosInstance from './axios';
import type { APIResponse } from '../types/api';

const PRODUCTS_BASE_URL = 'api/v1/products/';

const GET_PRODUCTS_QUERY_PARAMS_HANDLERS_MAP = {
  searchQueryParam: (value: string) => value,
  pharmacyIds: (ids: Array<number>) => ids.join(','),
  brandIds: (ids: Array<number>) => ids.join(','),
  discount: (value: boolean) => value.toString(),
} as const;

const GET_PRODUCTS_QUERY_PARAMS_BACKEND_KEYS_MAP = {
  searchQueryParam: 'name__icontains',
  pharmacyIds: 'productdiscover__pharmacy__in',
  brandIds: 'brand__in',
  discount: 'has_discount',
} as const;

class ProductService {
  static readonly getProducts = async (queryParams: ProductListQueryParams) => {
    const params = new URLSearchParams();

    for (const key of Object.keys(queryParams) as Array<keyof ProductListQueryParams>) {
      const value = queryParams[key];

      if (
        value === undefined ||
        ((Array.isArray(value) || typeof value === 'string') && value.length === 0)
      ) {
        continue;
      }

      const handler = GET_PRODUCTS_QUERY_PARAMS_HANDLERS_MAP[key];
      const backendKey = GET_PRODUCTS_QUERY_PARAMS_BACKEND_KEYS_MAP[key];

      if (handler && backendKey) {
        params.append(backendKey, handler(value as never));
      }
    }

    const response = await axiosInstance.get(PRODUCTS_BASE_URL, { params });

    return response.data as APIResponse<Array<BackendProduct>>;
  };

  static readonly searchProducts = async (searchQuery: string, limit: number) => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('name__icontains', searchQuery);

    const response = await axiosInstance.get(PRODUCTS_BASE_URL, { params });

    return response.data as APIResponse<Array<BackendProduct>>;
  };

  static readonly smartSearchProducts = async (searchQuery: string) => {
    const response = await axiosInstance.post(`${PRODUCTS_BASE_URL}smart-search/`, {
      query: searchQuery,
    });

    return response.data as APIResponse<Array<BackendProduct>>;
  };

  static readonly getProductsOnDiscount = async () => {
    const params = new URLSearchParams({ has_discount: 'true' });

    const response = await axiosInstance.get(PRODUCTS_BASE_URL, { params });

    return response.data as APIResponse<Array<BackendProduct>>;
  };
}

export default ProductService;
