import type { BackendDiscountedProduct, BackendProduct } from '../types/product';
import axiosInstance from './axios';
import type { APIResponse } from '../types/api';

const PRODUCTS_BASE_PATH = 'api/v1/products/';

class ProductService {
  static readonly searchProducts = async (searchQuery: string) => {
    const params = new URLSearchParams();
    params.append('q', searchQuery);

    const response = await axiosInstance.get(`${PRODUCTS_BASE_PATH}search/`, { params });

    return response.data as APIResponse<Array<BackendProduct>>;
  };

  static readonly smartSearchProducts = async (
    searchQuery: string,
    pharmacyIds: number[],
    categoryIds: number[]
  ) => {
    const response = await axiosInstance.post(`${PRODUCTS_BASE_PATH}smart-search/`, {
      query: searchQuery,
      pharmacy_ids: pharmacyIds,
      category_ids: categoryIds,
    });

    return response.data as APIResponse<Array<BackendProduct>>;
  };

  static readonly getProductsOnDiscount = async () => {
    const response = await axiosInstance.get(`${PRODUCTS_BASE_PATH}discounted/`);

    return response.data as APIResponse<Array<BackendDiscountedProduct>>;
  };
}

export default ProductService;
