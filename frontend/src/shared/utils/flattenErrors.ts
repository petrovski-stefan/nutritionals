import type { APIErrorItem } from '../types/api';
import type { FlattenedClientError } from '../types/errors';

export const GLOBAL_ZOD_FORM_ERROR_KEY = 'form';

const snakeToCamel = (value: string) =>
  value.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());

export type ApiErrorMessages = {
  field: Record<string, Record<string, string>>;
  form: Record<string, string>;
  fallback: string;
};

export const flattenAPIErrors = <T extends object>(
  errors: APIErrorItem[],
  messages: ApiErrorMessages
): FlattenedClientError<T> => {
  const flattened: FlattenedClientError<T> = { formErrors: [], fieldErrors: {} };

  for (const error of errors) {
    if (error.attr === null) {
      flattened.formErrors.push(messages.form[error.code] ?? messages.fallback);
      continue;
    }

    const field = snakeToCamel(error.attr) as keyof T;
    const message = messages.field[error.attr]?.[error.code] ?? messages.fallback;

    const fieldErrors = (flattened.fieldErrors[field] ??= []);
    fieldErrors.push(message);
  }

  return flattened;
};
