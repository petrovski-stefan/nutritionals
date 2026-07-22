import axiosInstance from '@/shared/lib/axios';
import type { APIResponseSuccessV2 } from '@/shared/types/api';

import type { BackendMyListWithItems, BackendMyListWithItemsCount } from './types';

const BASE_PATH = 'api/v1/mylists/';

const buildAuthConfig = (accessToken: string) => ({
  headers: { Authorization: `Bearer ${accessToken}` },
});

const toBackendAddProductPayload = (productId: number, isAddedThroughSmartSearch: boolean) => ({
  product_id: productId,
  is_added_through_smart_search: isAddedThroughSmartSearch,
});

export const getMyLists = async (accessToken: string) => {
  const response = await axiosInstance.get(BASE_PATH, buildAuthConfig(accessToken));

  return (response.data as APIResponseSuccessV2<BackendMyListWithItemsCount[]>).data;
};

export const getMyListById = async (myListId: number, accessToken: string) => {
  const url = `${BASE_PATH}${String(myListId)}/`;
  const response = await axiosInstance.get(url, buildAuthConfig(accessToken));

  return (response.data as APIResponseSuccessV2<BackendMyListWithItems>).data;
};

export const createMyList = async (name: string, accessToken: string) => {
  const response = await axiosInstance.post(BASE_PATH, { name }, buildAuthConfig(accessToken));

  return (response.data as APIResponseSuccessV2<BackendMyListWithItemsCount>).data;
};

export const updateMyList = async (myListId: number, name: string, accessToken: string) => {
  const url = `${BASE_PATH}${String(myListId)}/`;
  const response = await axiosInstance.put(url, { name }, buildAuthConfig(accessToken));

  return (response.data as APIResponseSuccessV2<BackendMyListWithItemsCount>).data;
};

export const deleteMyList = async (myListId: number, accessToken: string) => {
  const url = `${BASE_PATH}${String(myListId)}/`;
  await axiosInstance.delete(url, buildAuthConfig(accessToken));
};

export const addProductToMyList = async (
  myListId: number,
  productId: number,
  accessToken: string,
  isAddedThroughSmartSearch: boolean = false
) => {
  const url = `${BASE_PATH}${String(myListId)}/products/`;
  const response = await axiosInstance.post(
    url,
    toBackendAddProductPayload(productId, isAddedThroughSmartSearch),
    buildAuthConfig(accessToken)
  );

  return (response.data as APIResponseSuccessV2<BackendMyListWithItemsCount>).data;
};

export const removeProductFromMyList = async (
  myListId: number,
  productId: number,
  accessToken: string
) => {
  const url = `${BASE_PATH}${String(myListId)}/products/${String(productId)}/`;
  await axiosInstance.delete(url, buildAuthConfig(accessToken));
};
