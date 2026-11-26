import type { ReactNode } from 'react';

import Button from './Button';
import Modal from './Modal';

type Props = Readonly<{
  title: string;
  message: ReactNode;
  confirmText: string;
  errorMessage: string;
  isPending: boolean;
  isError: boolean;
  onConfirm: () => void;
  onClose: () => void;
}>;

export default function ConfirmModal({
  title,
  message,
  confirmText,
  errorMessage,
  isPending,
  isError,
  onConfirm,
  onClose,
}: Props) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      size="md"
    >
      <p className="text-text mb-4">{message}</p>

      {isError && (
        <p
          role="alert"
          className="text-danger mb-4 text-sm"
        >
          {errorMessage}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={onClose}
        >
          Откажи
        </Button>
        <Button
          variant="danger"
          isPending={isPending}
          onClick={onConfirm}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
