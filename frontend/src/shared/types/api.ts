import type { AxiosError } from 'axios';

export type APIResponseSuccessV2<T> = {
  success: true;
  data: T;
};

export type APIPaginatedData<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type APIErrorItem = {
  code: string;
  detail: string;
  attr: string | null;
};

export type APIResponseFailV2 = {
  success: boolean;
  type: 'client_error' | 'validation_error' | 'server_error';
  errors: APIErrorItem[];
};

export type APIBaseError = AxiosError<APIResponseFailV2>;
