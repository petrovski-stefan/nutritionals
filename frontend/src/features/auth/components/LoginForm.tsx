import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import { authErrorMessages } from '@/features/auth/errorMessages';
import useLocationFrom from '@/features/auth/hooks/useLocationFrom';
import useLogin from '@/features/auth/hooks/useLogin';
import { LoginSchema } from '@/features/auth/schemas';
import type { LoginFormFields } from '@/features/auth/types';
import useApiFormErrors, { getFormErrorMessage } from '@/shared/hooks/useApiFormErrors';

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
      {formError && <p className="text-danger text-center font-medium">{formError}</p>}

      <Field
        label="Корисничко име"
        error={errors.username?.message}
      >
        <Input
          type="text"
          placeholder="Внесете го вашето корисничко име"
          {...register('username')}
        />
      </Field>

      <Field
        label="Лозинка"
        error={errors.password?.message}
      >
        <PasswordInput
          placeholder="Внесете ја вашата лозинка"
          {...register('password')}
        />
      </Field>

      <Button
        type="submit"
        variant="accent"
        isPending={isPending}
        className="w-full"
      >
        Најавете се
      </Button>
    </form>
  );
}
