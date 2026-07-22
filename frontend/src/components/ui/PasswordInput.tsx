import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { type InputHTMLAttributes, type Ref, useState } from 'react';

import IconButton from './IconButton';
import Input from './Input';

type Props = Readonly<
  Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
    ref?: Ref<HTMLInputElement>;
  }
>;

export default function PasswordInput({ className = '', ...rest }: Props) {
  const [isVisible, setIsVisible] = useState(false);

  const label = isVisible ? 'Сокриј ја лозинката' : 'Прикажи ја лозинката';

  return (
    <div className="relative">
      <Input
        type={isVisible ? 'text' : 'password'}
        className={`pr-11 ${className}`}
        {...rest}
      />
      <IconButton
        label={label}
        size="sm"
        aria-pressed={isVisible}
        className="absolute top-1/2 right-2 -translate-y-1/2"
        onClick={() => {
          setIsVisible((prev) => !prev);
        }}
      >
        {isVisible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
      </IconButton>
    </div>
  );
}
