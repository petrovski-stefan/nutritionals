type APIResponseSuccess<T> = {
  status: true;
  code: number;
  data: T;
};

type APIError = {
  code: string;
  detail: string;
  attr: unknown;
};

export type APIResponseFail = {
  status: false;
  code: number;
  errors_type: string;
  errors: Array<APIError>;
  data: null;
};

export type APIPaginatedResponseSuccess<T> = {
  status: true;
  code: number;
  data: {
    count: number;
    results: T;
  };
};

export type APIResponse<T> = APIResponseSuccess<T> | APIResponseFail;
export type APIPaginatedResponse<T> = APIPaginatedResponseSuccess<T> | APIResponseFail;
