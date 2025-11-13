import axiosInstance from './axios';
import type { APIResponse } from '../types/api';
import type { BackendCollection } from '../types/collection';

const COLLECTION_BASE_PATH = 'api/v1/products/collections/';

export class CollectionService {
  static readonly getCollections = async (accessToken: string) => {
    const response = await axiosInstance.get(`${COLLECTION_BASE_PATH}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.data as APIResponse<Array<BackendCollection>>;
  };

  static readonly createCollection = async (name: string, accessToken: string) => {
    const response = await axiosInstance.post(
      `${COLLECTION_BASE_PATH}`,
      { name },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return response.data as APIResponse<BackendCollection>;
  };

  static readonly addProductToCollection = async (
    collectionId: number,
    productId: number,
    accessToken: string
  ) => {
    const params = new URLSearchParams({ product_id: productId.toString() });

    const response = await axiosInstance.put(
      `${COLLECTION_BASE_PATH}${collectionId}/`,
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params,
      }
    );

    return response.data as APIResponse<BackendCollection>;
  };

  static readonly removeProductFromCollection = async (
    collectionId: number,
    productId: number,
    accessToken: string
  ) => {
    const params = new URLSearchParams({ product_id: productId.toString() });

    const response = await axiosInstance.delete(`${COLLECTION_BASE_PATH}${collectionId}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params,
    });

    return response.data as APIResponse<null>;
  };
}
