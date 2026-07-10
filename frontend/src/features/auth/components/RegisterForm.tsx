import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import Button from '../../../components/ui/Button';
import Field from '../../../components/ui/Field';
import Input from '../../../components/ui/Input';
import PasswordInput from '../../../components/ui/PasswordInput';
import useApiFormErrors, { getFormErrorMessage } from '../../../hooks/useApiFormErrors';
import { authErrorMessages } from '../errorMessages';
import useLocationFrom from '../hooks/useLocationFrom';
import useRegister from '../hooks/useRegister';
import { RegisterFormSchema } from '../schemas';
import type { RegisterFormFields } from '../types';

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
      {formError && <p className="text-danger text-center font-medium">{formError}</p>}

      <Field
        label="Корисничко име"
        error={errors.username?.message}
      >
        <Input
          type="text"
          placeholder="Внесете корисничко име со мин. 5 карактери"
          {...register('username')}
        />
      </Field>

      <Field
        label="Лозинка"
        error={errors.password?.message}
      >
        <PasswordInput
          placeholder="Внесете лозинка со мин. 8 карактери"
          {...register('password')}
        />
      </Field>

      <Field
        label="Повторете ја лозинката"
        error={errors.confirmPassword?.message}
      >
        <PasswordInput
          placeholder="Повторете ја лозинката"
          {...register('confirmPassword')}
        />
      </Field>

      <Button
        type="submit"
        variant="accent"
        isPending={isPending}
        className="w-full"
      >
        Регистрирајте се
      </Button>
    </form>
  );
}
