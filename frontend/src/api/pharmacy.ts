import type { APIResponse } from '../types/api';
import type { BackendPharmacy } from '../types/pharmacy';
import axiosInstance from './axios';

const PHARMACIES_BASE_URL = 'api/v1/products/pharmacies/';

class PharmacyService {
  static readonly getPharmacies = async () => {
    const response = await axiosInstance.get(PHARMACIES_BASE_URL);

    return response.data as APIResponse<Array<BackendPharmacy>>;
  };
}

export default PharmacyService;
