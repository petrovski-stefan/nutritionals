import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import { authErrorMessages } from '@/features/auth/errorMessages';
import useLocationFrom from '@/features/auth/hooks/useLocationFrom';
import useRegister from '@/features/auth/hooks/useRegister';
import { RegisterFormSchema } from '@/features/auth/schemas';
import type { RegisterFormFields } from '@/features/auth/types';
import useApiFormErrors, { getFormErrorMessage } from '@/shared/hooks/useApiFormErrors';

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
        hint="Најмалку 5 карактери."
        error={errors.username?.message}
      >
        <Input
          type="text"
          {...register('username')}
        />
      </Field>

      <Field
        label="Лозинка"
        hint="Најмалку 8 карактери, од кои една голема буква и една цифра."
        error={errors.password?.message}
      >
        <PasswordInput {...register('password')} />
      </Field>

      <Field
        label="Повторете ја лозинката"
        error={errors.confirmPassword?.message}
      >
        <PasswordInput {...register('confirmPassword')} />
      </Field>

      <Button
        type="submit"
        isPending={isPending}
        className="w-full"
      >
        Регистрирајте се
      </Button>
    </form>
  );
}
