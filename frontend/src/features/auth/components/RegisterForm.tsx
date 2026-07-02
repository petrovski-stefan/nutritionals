import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import useApiFormErrors, { getFormErrorMessage } from '../../../hooks/useApiFormErrors';
import { authErrorMessages } from '../errorMessages';
import useLocationFrom from '../hooks/useLocationFrom';
import useRegister from '../hooks/useRegister';
import { RegisterFormSchema } from '../schemas';
import type { RegisterFormFields } from '../types';
import FormField from './FormField';
import SubmitButton from './SubmitButton';

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormFields>({ resolver: zodResolver(RegisterFormSchema) });

  const { from } = useLocationFrom();

  const { mutate, isPending, error } = useRegister(from);

  useApiFormErrors(error, setError, authErrorMessages);

  const onSubmit = (data: RegisterFormFields) => {
    mutate(data);
  };

  const formError = getFormErrorMessage(errors);

  return (
    <form
      onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      className="space-y-5"
    >
      {formError && <p className="text-center font-medium text-red-600">{formError}</p>}

      <FormField
        inputType="text"
        register={register}
        placeholder="Внесете корисничко име со мин. 5 карактери"
        field="username"
        name="Корисничко име"
        fieldError={errors.username?.message}
      />

      <FormField
        inputType="password"
        register={register}
        placeholder="Внесете лозинка со мин. 8 карактери"
        field="password"
        name="Лозинка"
        fieldError={errors.password?.message}
      />

      <FormField
        inputType="password"
        register={register}
        placeholder="Повторете ја лозинката"
        field="confirmPassword"
        name="Повторете ја лозинката"
        fieldError={errors.confirmPassword?.message}
      />

      <SubmitButton
        isPending={isPending}
        submitText="Најавете се"
      />
    </form>
  );
}
