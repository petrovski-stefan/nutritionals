import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode, useMemo } from 'react';
import { useForm } from 'react-hook-form';

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
      className="mt-2 flex flex-col gap-2"
    >
      {errors.name?.message && <p className="text-red-600">{errors.name.message}</p>}
      {formError && <p className="text-red-600">{formError}</p>}

      <div className="flex gap-2">
        <input
          type="text"
          maxLength={30}
          {...register('name')}
          placeholder={placeholder}
          className="focus:ring-primary flex-1 rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary hover:bg-primary/90 cursor-pointer rounded-lg px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitText}
        </button>
        {children}
      </div>
    </form>
  );
}
