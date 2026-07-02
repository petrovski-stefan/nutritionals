type Props = Readonly<{
  isPending: boolean;
  submitText: string;
}>;

export default function SubmitButton({ isPending, submitText }: Props) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="bg-accent hover:bg-accent/90 w-full rounded-2xl py-3 font-bold text-white transition disabled:opacity-70"
    >
      {isPending ? 'Ве молиме почекајте ...' : submitText}
    </button>
  );
}
