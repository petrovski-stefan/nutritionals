import axiosInstance from './axios';
import type { APIResponse, APIResponseFail } from '../types/api';
import type { BackendMyListWithItems, BackendMyListWithItemsCount } from '../types/mylist';

const BASE_PATH = 'api/v1/mylists/';

export class MyListService {
  static readonly getMyLists = async (accessToken: string) => {
    const response = await axiosInstance.get(`${BASE_PATH}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.data as APIResponse<Array<BackendMyListWithItemsCount>>;
  };

  static readonly getMyListById = async (myListId: number, accessToken: string) => {
    const response = await axiosInstance.get(`${BASE_PATH}${myListId}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.data as APIResponse<BackendMyListWithItems>;
  };

  static readonly createMyList = async (name: string, accessToken: string) => {
    const response = await axiosInstance.post(
      `${BASE_PATH}`,
      { name },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return response.data as APIResponse<BackendMyListWithItemsCount>;
  };

  static readonly updateMyList = async (myListId: number, name: string, accessToken: string) => {
    const response = await axiosInstance.put(
      `${BASE_PATH}${myListId}/`,
      { name },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return response.data as APIResponse<BackendMyListWithItemsCount>;
  };

  static readonly deleteMyList = async (myListId: number, accessToken: string) => {
    const response = await axiosInstance.delete(`${BASE_PATH}${myListId}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (response.status > 400) {
      return response.data as APIResponseFail;
    }

    return null;
  };

  static readonly addProductToMyList = async (
    myListId: number,
    productId: number,
    accessToken: string,
    isProductAddedBySmartSearch: boolean = false
  ) => {
    const response = await axiosInstance.post(
      `${BASE_PATH}${myListId}/products/`,
      { product_id: productId, is_added_through_smart_search: isProductAddedBySmartSearch },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return response.data as APIResponse<BackendMyListWithItemsCount>;
  };

  static readonly removeProductFromMyList = async (
    myListId: number,
    productId: number,
    accessToken: string
  ) => {
    const response = await axiosInstance.delete(`${BASE_PATH}${myListId}/products/${productId}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.data as APIResponse<null>;
  };
}
