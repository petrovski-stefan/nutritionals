import { useEffect } from 'react';
import type { FieldErrors, FieldValues, Path, UseFormSetError } from 'react-hook-form';

import type { APIBaseError } from '@/shared/types/api';
import { classifyError, type ErrorType } from '@/shared/utils/classifyErrors';
import { type ApiErrorMessages, flattenAPIErrors } from '@/shared/utils/flattenErrors';

const GENERIC_ERROR_MESSAGES: Record<ErrorType, string> = {
  validation: 'Внесените податоци не се валидни. Проверете ги полињата.',
  auth: 'Немате дозвола да извршите оваа акција.',
  server: 'Настана грешка на серверот. Обидете се повторно подоцна.',
  network: 'Нема интернет конекција. Проверете ја вашата врска.',
  unknown: 'Настана непозната грешка. Обидете се повторно.',
};

// The hook below writes form-level messages to 'root' (API-derived) or 'form'
// (generic/zod refine) — consumers must read both, so always display via this helper.
export const getFormErrorMessage = <T extends FieldValues>(
  errors: FieldErrors<T>
): string | undefined => errors.root?.message ?? errors.form?.message;

const useApiFormErrors = <T extends FieldValues>(
  error: APIBaseError | null,
  setError: UseFormSetError<T>,
  messages: ApiErrorMessages
) => {
  useEffect(() => {
    if (!error) return;

    const errorType = classifyError(error);
    const apiErrors = error.response?.data.errors;

    if (errorType !== 'network' && errorType !== 'server' && apiErrors) {
      const { fieldErrors, formErrors } = flattenAPIErrors<T>(apiErrors, messages);

      for (const [field, fieldMessages] of Object.entries(fieldErrors)) {
        const message = fieldMessages?.[0];
        if (message) setError(field as Path<T>, { message });
      }

      const formMessage = formErrors[0];
      if (formMessage) {
        setError('root', { message: formMessage });
      }

      return;
    }

    setError('form', { message: GENERIC_ERROR_MESSAGES[errorType] });
  }, [error, setError, messages]);
};

export default useApiFormErrors;
