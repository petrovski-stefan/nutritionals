import { RotateCwIcon } from 'lucide-react';

import Button from './Button';

type Props = Readonly<{
  onRetry: () => void;
  isRetrying?: boolean;
}>;

export default function RetryButton({ onRetry, isRetrying = false }: Props) {
  return (
    <Button
      variant="outline"
      size="sm"
      isPending={isRetrying}
      onClick={onRetry}
    >
      {!isRetrying && (
        <RotateCwIcon
          aria-hidden="true"
          className="h-4 w-4"
        />
      )}
      Обиди се повторно
    </Button>
  );
}
