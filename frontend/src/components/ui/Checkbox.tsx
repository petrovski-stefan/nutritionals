type Props = Readonly<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}>;

export default function Checkbox({ label, checked, onChange, className = '' }: Props) {
  return (
    <label
      className={`text-text hover:text-primary flex cursor-pointer items-center gap-2 text-sm transition-colors ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          onChange(e.target.checked);
        }}
        className="accent-primary border-border focus-visible:outline-primary h-4 w-4 rounded focus-visible:outline-2 focus-visible:outline-offset-2"
      />
      <span>{label}</span>
    </label>
  );
}
