import axiosInstance from '../lib/axios';
import type { APIResponse, APIResponseFail } from '../types/api';
import type { BackendMyListWithItems, BackendMyListWithItemsCount } from '../types/mylist';

const BASE_PATH = 'api/v1/mylists/';

export const getMyLists = async (accessToken: string) => {
  const response = await axiosInstance.get(BASE_PATH, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return response.data as APIResponse<Array<BackendMyListWithItemsCount>>;
};

export const getMyListById = async (myListId: number, accessToken: string) => {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const response = await axiosInstance.get(`${BASE_PATH}${myListId}/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return response.data as APIResponse<BackendMyListWithItems>;
};

export const createMyList = async (name: string, accessToken: string) => {
  const response = await axiosInstance.post(
    BASE_PATH,
    { name },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  return response.data as APIResponse<BackendMyListWithItemsCount>;
};

export const updateMyList = async (myListId: number, name: string, accessToken: string) => {
  const response = await axiosInstance.put(
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    `${BASE_PATH}${myListId}/`,
    { name },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  return response.data as APIResponse<BackendMyListWithItemsCount>;
};

export const deleteMyList = async (myListId: number, accessToken: string) => {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const response = await axiosInstance.delete(`${BASE_PATH}${myListId}/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (response.status > 400) {
    return response.data as APIResponseFail;
  }

  return null;
};

export const addProductToMyList = async (
  myListId: number,
  productId: number,
  accessToken: string,
  isProductAddedBySmartSearch: boolean = false
) => {
  const response = await axiosInstance.post(
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    `${BASE_PATH}${myListId}/products/`,
    { product_id: productId, is_added_through_smart_search: isProductAddedBySmartSearch },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  return response.data as APIResponse<BackendMyListWithItemsCount>;
};

export const removeProductFromMyList = async (
  myListId: number,
  productId: number,
  accessToken: string
) => {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const url = `${BASE_PATH}${myListId}/products/${productId}/`;
  const response = await axiosInstance.delete(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return response.data as APIResponse<null>;
};
