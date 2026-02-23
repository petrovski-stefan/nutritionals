import { useState, type PropsWithChildren } from 'react';

type Props = PropsWithChildren & {
  text: string;
  placement?: 'top' | 'bottom' | 'right' | 'left';
};

export default function Tooltip({ children, text, placement = 'top' }: Props) {
  const [visible, setVisible] = useState(false);

  const positionClasses = {
    top: '-top-10 left-1/2 -translate-x-1/2',
    bottom: 'top-10 left-1/2 -translate-x-1/2',
    left: 'left-[-120%] top-1/2 -translate-y-1/2',
    right: 'right-[-120%] top-1/2 -translate-y-1/2',
  };

  return (
    <span
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className="relative inline-block"
    >
      {children}

      {visible && (
        <span
          className={`absolute rounded bg-black px-2 py-1 text-xs text-white shadow ${positionClasses[placement]}`}
        >
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"></div>
        </span>
      )}
    </span>
  );
}
