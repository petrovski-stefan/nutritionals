import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import Button from '../../../components/ui/Button';
import Field from '../../../components/ui/Field';
import Input from '../../../components/ui/Input';
import useApiFormErrors, { getFormErrorMessage } from '../../../hooks/useApiFormErrors';
import type { APIBaseError } from '../../../shared/types/api';
import { myListsErrorMessages } from '../errorMessages';
import { buildMyListNameSchema, type MyListNameFormFields } from '../schemas';

type Props = Readonly<{
  existingNames: string[];
  placeholder: string;
  submitText: string;
  isPending: boolean;
  apiError: APIBaseError | null;
  defaultName?: string | undefined;
  onSubmit: (name: string) => void;
  children?: ReactNode;
}>;

export default function MyListNameForm({
  existingNames,
  placeholder,
  submitText,
  isPending,
  apiError,
  defaultName,
  onSubmit,
  children,
}: Props) {
  const schema = useMemo(() => buildMyListNameSchema(existingNames), [existingNames]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<MyListNameFormFields>({
    resolver: zodResolver(schema),
    defaultValues: { name: defaultName ?? '' },
  });

  useApiFormErrors(apiError, setError, myListsErrorMessages);

  const formError = getFormErrorMessage(errors);

  const onValidSubmit = (data: MyListNameFormFields) => {
    onSubmit(data.name);
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(onValidSubmit)(e)}
      className="flex flex-col gap-3"
    >
      {formError && <p className="text-danger text-sm">{formError}</p>}

      <Field
        label="Име на листата"
        error={errors.name?.message}
      >
        <Input
          type="text"
          maxLength={30}
          placeholder={placeholder}
          {...register('name')}
        />
      </Field>

      <div className="flex gap-2">
        <Button
          type="submit"
          isPending={isPending}
          className="flex-1"
        >
          {submitText}
        </Button>
        {children}
      </div>
    </form>
  );
}
