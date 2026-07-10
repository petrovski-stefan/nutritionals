import { XIcon } from 'lucide-react';
import { type PropsWithChildren, type ReactNode, useEffect } from 'react';

import IconButton from './IconButton';

type Size = 'md' | 'lg' | 'xl';

const SIZE_CLASSES: Record<Size, string> = {
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

type Props = Readonly<
  PropsWithChildren & {
    title: ReactNode;
    onClose: () => void;
    size?: Size;
  }
>;

export default function Modal({ title, onClose, size = 'md', children }: Props) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`border-border bg-surface-raised max-h-[85vh] w-full overflow-y-auto rounded-xl border p-6 shadow-lg ${SIZE_CLASSES[size]}`}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="border-border mb-5 flex items-start justify-between gap-4 border-b pb-3">
          <h2 className="text-text text-xl font-semibold">{title}</h2>
          <IconButton
            label="Затвори"
            size="sm"
            onClick={onClose}
            className="shrink-0"
          >
            <XIcon className="h-5 w-5" />
          </IconButton>
        </div>

        {children}
      </div>
    </div>
  );
}
