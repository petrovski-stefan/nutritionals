import axiosInstance from './axios';

import type { APIResponse } from '../types/api';
import type {
  BackendRegisterResponse,
  BackendTokenPair,
  LoginCredentials,
  RegisterCredentials,
} from '../types/user';

const USERS_BASE_URL = 'api/v1/users/';

const toBackendRegisterCredentials = (registerCredentials: RegisterCredentials) => {
  return {
    username: registerCredentials.username,
    password: registerCredentials.password,
    confirm_password: registerCredentials.confirmPassword,
  };
};

export class UserService {
  static readonly login = async (loginCredentials: LoginCredentials) => {
    const response = await axiosInstance.post(`${USERS_BASE_URL}login/`, loginCredentials);

    return response.data as APIResponse<BackendTokenPair>;
  };

  public static readonly register = async (registerCredentials: RegisterCredentials) => {
    const response = await axiosInstance.post(
      `${USERS_BASE_URL}register/`,
      toBackendRegisterCredentials(registerCredentials)
    );

    return response.data as APIResponse<BackendRegisterResponse>;
  };
}
