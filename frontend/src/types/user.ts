export type LoginCredentials = {
  username: string;
  password: string;
};

export type RegisterCredentials = {
  username: string;
  password: string;
  confirmPassword: string;
};

export type BackendTokenPair = {
  access: string;
  refresh: string;
};

export type BackendRegisterResponse = { username: string } & BackendTokenPair;
