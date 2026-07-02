import type { HTMLInputTypeAttribute } from 'react';
import type { FieldValues, Path, UseFormRegister } from 'react-hook-form';

type Props<TInput extends FieldValues> = Readonly<{
  inputType: HTMLInputTypeAttribute;
  name: string;
  placeholder: string;
  field: Path<TInput>;
  fieldError?: string | undefined;
  register: UseFormRegister<TInput>;
}>;

export default function FormField<TInput extends FieldValues>({
  inputType,
  name,
  field,
  placeholder,
  fieldError,
  register,
}: Props<TInput>) {
  return (
    <div className="flex flex-col">
      <p className="mb-2 font-medium text-red-600">{fieldError}</p>
      <label className="text-dark mb-2 font-medium">{name}</label>
      <input
        type={inputType}
        {...register(field)}
        className="border-dark/30 focus:ring-accent focus:border-accent rounded-2xl border px-4 py-3 transition focus:ring-2 focus:outline-none"
        placeholder={placeholder}
      />
    </div>
  );
}
