import axiosInstance from './axios';
import type { APIResponse } from '../types/api';
import type { BackendProductGroup } from '../types/productgroup';

const PRODUCT_GROUPS_PATH = 'api/v1/product-groups/';

export const getProductGroups = async (
  searchQuery: string,
  categoryIds: number[],
  brandIds: number[]
) => {
  const params = new URLSearchParams();

  if (searchQuery) {
    params.append('name', searchQuery);
  }

  if (categoryIds && categoryIds.length > 0) {
    params.append('categories', categoryIds.join(','));
  }

  if (brandIds && brandIds.length > 0) {
    params.append('brand', brandIds.join(','));
  }
  const response = await axiosInstance.get(PRODUCT_GROUPS_PATH, { params: params });

  return response.data as APIResponse<Array<BackendProductGroup>>;
};

// class ProductGroupService {
//   static readonly getProductGroups = async (
//     searchQuery: string,
//     categoryIds: number[],
//     brandIds: number[]
//   ) => {
//     const params = new URLSearchParams();

//     if (searchQuery) {
//       params.append('name', searchQuery);
//     }

//     if (categoryIds && categoryIds.length > 0) {
//       params.append('categories', categoryIds.join(','));
//     }

//     if (brandIds && brandIds.length > 0) {
//       params.append('brand', brandIds.join(','));
//     }
//     const response = await axiosInstance.get(PRODUCT_GROUPS_PATH, { params: params });

//     return response.data as APIResponse<Array<BackendProductGroup>>;
//   };
// }

// export default ProductGroupService;
