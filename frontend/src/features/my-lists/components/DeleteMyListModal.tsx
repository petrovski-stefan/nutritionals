import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

type Props = Readonly<{
  myListName: string;
  isPending: boolean;
  isError: boolean;
  onConfirm: () => void;
  onClose: () => void;
}>;

export default function DeleteMyListModal({
  myListName,
  isPending,
  isError,
  onConfirm,
  onClose,
}: Props) {
  return (
    <Modal
      title="Избриши ја листата"
      onClose={onClose}
      size="md"
    >
      <p className="text-text mb-4">
        Листата „{myListName}“ ќе биде трајно избришана, заедно со суплементите зачувани во неа.
      </p>

      {isError && (
        <p
          role="alert"
          className="text-danger mb-4 text-sm"
        >
          Листата не беше избришана. Проверете ја врската и обидете се повторно.
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
          Избриши
        </Button>
      </div>
    </Modal>
  );
}
