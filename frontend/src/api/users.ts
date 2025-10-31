import axiosInstance from './axios';

import type { APIResponse } from '../types/api';
import type {
  BackendRegisterResponse,
  BackendTokenPair,
  LoginCredentials,
  RegisterCredentials,
} from '../types/users';

const USERS_BASE_PATH = 'api/v1/users/';

const toBackendRegisterCredentials = (registerCredentials: RegisterCredentials) => {
  return {
    username: registerCredentials.username,
    password: registerCredentials.password,
    confirm_password: registerCredentials.confirmPassword,
  };
};

export class UserService {
  static readonly login = async (loginCredentials: LoginCredentials) => {
    const response = await axiosInstance.post(`${USERS_BASE_PATH}login/`, loginCredentials);

    return response.data as APIResponse<BackendTokenPair>;
  };

  public static readonly register = async (registerCredentials: RegisterCredentials) => {
    const response = await axiosInstance.post(
      `${USERS_BASE_PATH}register/`,
      toBackendRegisterCredentials(registerCredentials)
    );

    return response.data as APIResponse<BackendRegisterResponse>;
  };
}
