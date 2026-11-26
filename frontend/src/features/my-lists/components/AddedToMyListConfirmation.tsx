import { CircleCheckIcon } from 'lucide-react';

import SectionCtaLink from '@/components/home/SectionCtaLink';
import Button from '@/components/ui/Button';
import type { MyListsLocationState } from '@/features/my-lists/types';

type Props = Readonly<{
  productName: string;
  myListId: number;
  myListName: string;
  onClose: () => void;
}>;

export default function AddedToMyListConfirmation({
  productName,
  myListId,
  myListName,
  onClose,
}: Props) {
  const openMyListState: MyListsLocationState = { openMyListId: myListId };

  return (
    <div className="flex flex-col items-center gap-3 py-2 text-center">
      <CircleCheckIcon
        aria-hidden="true"
        className="text-success h-10 w-10"
      />

      <p
        role="status"
        className="text-text"
      >
        „{productName}“ е додаден во „{myListName}“.
      </p>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        <SectionCtaLink
          to="/my-lists"
          state={openMyListState}
        >
          Отвори ја листата
        </SectionCtaLink>
        <Button onClick={onClose}>Затвори</Button>
      </div>
    </div>
  );
}
