import axiosInstance from '@/shared/lib/axios';
import type { APIResponseSuccessV2 } from '@/shared/types/api';

import type { BackendPharmacy } from './types';

const PHARMACIES_BASE_URL = 'api/v1/pharmacies/';

export const getPharmacies = async () => {
  const response = await axiosInstance.get(PHARMACIES_BASE_URL);

  return (response.data as APIResponseSuccessV2<BackendPharmacy[]>).data;
};
