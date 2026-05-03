import axiosInstance from '../lib/axios';
import type { APIResponse } from '../types/api';
import type {
  BackendRegisterResponse,
  BackendTokenPair,
  LoginCredentials,
  RegisterCredentials,
} from '../types/user';

const USERS_BASE_PATH = 'api/v1/users/';

const toBackendRegisterCredentials = (registerCredentials: RegisterCredentials) => {
  return {
    username: registerCredentials.username,
    password: registerCredentials.password,
    confirm_password: registerCredentials.confirmPassword,
  };
};

export const loginUser = async (loginCredentials: LoginCredentials) => {
  const url = `${USERS_BASE_PATH}login/`;
  const response = await axiosInstance.post(url, loginCredentials);

  return response.data as APIResponse<BackendTokenPair>;
};

export const registerUser = async (registerCredentials: RegisterCredentials) => {
  const url = `${USERS_BASE_PATH}register/`;
  const response = await axiosInstance.post(url, toBackendRegisterCredentials(registerCredentials));

  return response.data as APIResponse<BackendRegisterResponse>;
};
