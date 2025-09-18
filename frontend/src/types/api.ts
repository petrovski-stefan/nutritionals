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

type APIResponseFail = {
  status: false;
  code: number;
  errors_type: string;
  errors: Array<APIError>;
  data: null;
};

export type APIResponse<T> = APIResponseSuccess<T> | APIResponseFail;
