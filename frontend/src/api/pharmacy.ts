import axiosInstance from '../lib/axios';
import type { APIResponse } from '../types/api';
import type { BackendPharmacy } from '../types/pharmacy';

const PHARMACIES_BASE_URL = 'api/v1/pharmacies/';

export const getPharmacies = async () => {
  const response = await axiosInstance.get(PHARMACIES_BASE_URL);

  return response.data as APIResponse<BackendPharmacy[]>;
};
