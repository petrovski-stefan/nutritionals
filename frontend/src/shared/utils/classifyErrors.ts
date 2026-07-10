import type { APIBaseError } from '@/shared/types/api';

const isAuthError = (apiBaseError: APIBaseError) => {
  return apiBaseError.response?.status === 401;
};

const isValidationError = (apiBaseError: APIBaseError) => {
  // 409 and 422 possibly in the future
  return apiBaseError.response?.status === 400;
};

const isServerError = (apiBaseError: APIBaseError) => {
  const status = apiBaseError.response?.status;
  return typeof status === 'number' && status >= 500;
};

const isNetworkError = (apiBaseError: APIBaseError) => {
  return apiBaseError.response === undefined;
};

export type ErrorType = 'auth' | 'validation' | 'server' | 'network' | 'unknown';

export const classifyError = (apiBaseError: APIBaseError): ErrorType => {
  const isAuth = isAuthError(apiBaseError);
  const isValidation = isValidationError(apiBaseError);
  const isServer = isServerError(apiBaseError);
  const isNetwork = isNetworkError(apiBaseError);

  if (isAuth) return 'auth';
  if (isValidation) return 'validation';
  if (isServer) return 'server';
  if (isNetwork) return 'network';

  return 'unknown'; // Fallback
};
