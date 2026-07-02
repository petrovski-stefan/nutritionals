import axiosInstance from '../../lib/axios';
import type { APIResponseSuccessV2 } from '../../shared/types/api';
import type {
  BackendRegisterResponse,
  BackendTokenPair,
  LoginFormFields,
  RegisterFormFields,
} from './types';

const USERS_BASE_PATH = 'api/v1/users/';

const toBackendRegisterCredentials = (registerCredentials: RegisterFormFields) => {
  return {
    username: registerCredentials.username,
    password: registerCredentials.password,
    confirm_password: registerCredentials.confirmPassword,
  };
};

export const loginUser = async (loginCredentials: LoginFormFields) => {
  const url = `${USERS_BASE_PATH}login/`;
  const response = await axiosInstance.post(url, loginCredentials);

  return (response.data as APIResponseSuccessV2<BackendTokenPair>).data;
};

export const registerUser = async (registerCredentials: RegisterFormFields) => {
  const url = `${USERS_BASE_PATH}register/`;
  const response = await axiosInstance.post(url, toBackendRegisterCredentials(registerCredentials));

  return (response.data as APIResponseSuccessV2<BackendRegisterResponse>).data;
};
