import type { BackendProduct } from '../types/product';
import axiosInstance from './axios';
import type { APIResponse } from '../types/api';

export const getProducts = async () => {
  const response = await axiosInstance.get('api/v1/products/');

  return response.data as APIResponse<Array<BackendProduct>>;
};
