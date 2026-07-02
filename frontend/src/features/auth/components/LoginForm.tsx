import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import useApiFormErrors, { getFormErrorMessage } from '../../../hooks/useApiFormErrors';
import { authErrorMessages } from '../errorMessages';
import useLocationFrom from '../hooks/useLocationFrom';
import useLogin from '../hooks/useLogin';
import { LoginSchema } from '../schemas';
import type { LoginFormFields } from '../types';
import FormField from './FormField';
import SubmitButton from './SubmitButton';

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormFields>({ resolver: zodResolver(LoginSchema) });

  const { from } = useLocationFrom();

  const { mutate, isPending, error } = useLogin(from);

  useApiFormErrors(error, setError, authErrorMessages);

  const onSubmit = (data: LoginFormFields) => {
    mutate(data);
  };

  const formError = getFormErrorMessage(errors);

  return (
    <form
      onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      className="space-y-5"
    >
      {formError && <p className="font-medium text-red-600">{formError}</p>}

      <FormField
        inputType="text"
        register={register}
        placeholder="Внесете го вашето корисничко име"
        field="username"
        name="Корисничко име"
        fieldError={errors.username?.message}
      />

      <FormField
        inputType="password"
        register={register}
        placeholder="Внесете ја вашата лозинка"
        field="password"
        name="Лозинка"
        fieldError={errors.password?.message}
      />

      <SubmitButton
        isPending={isPending}
        submitText="Најавете се"
      />
    </form>
  );
}
