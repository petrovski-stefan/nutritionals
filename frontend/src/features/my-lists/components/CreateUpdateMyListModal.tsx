import { XIcon } from 'lucide-react';
import { useMemo } from 'react';

import Tooltip from '../../../components/ui/Tooltip';
import useCreateMyList from '../hooks/useCreateMyList';
import useUpdateMyList from '../hooks/useUpdateMyList';
import MYLISTS_TEXT from '../locale';
import MyListNameForm from './MyListNameForm';

type MyListToUpdate = {
  id: number;
  name: string;
};

type Props = Readonly<{
  mode: 'create' | 'update';
  myListToUpdate: MyListToUpdate | undefined;
  existingNames: string[];
  onClose: () => void;
}>;

export default function CreateUpdateMyListModal({
  mode,
  myListToUpdate,
  existingNames,
  onClose,
}: Props) {
  const createMyList = useCreateMyList();
  const updateMyList = useUpdateMyList();

  const isPending = createMyList.isPending || updateMyList.isPending;
  const apiError = createMyList.error ?? updateMyList.error;

  // In update mode the input is pre-filled with the list's own name — it must
  // not count as a duplicate, otherwise the list can never be re-saved.
  const blockedNames = useMemo(
    () =>
      myListToUpdate ? existingNames.filter((name) => name !== myListToUpdate.name) : existingNames,
    [existingNames, myListToUpdate]
  );

  const handleSubmit = (name: string) => {
    if (mode === 'update' && myListToUpdate) {
      updateMyList.mutate({ myListId: myListToUpdate.id, name }, { onSuccess: onClose });
    } else {
      createMyList.mutate({ name }, { onSuccess: onClose });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between border-b border-neutral-200 pb-3">
          <h2 className="text-dark text-xl font-semibold">
            {mode === 'create' && MYLISTS_TEXT['modal']['createNewMyListTitle']}
            {mode === 'update' &&
              myListToUpdate !== undefined &&
              `${MYLISTS_TEXT['modal']['updateMyListTitle']} ${myListToUpdate.name}`}
          </h2>

          <button
            onClick={onClose}
            className="hover:text-dark cursor-pointer text-gray-400 transition-colors"
          >
            <Tooltip text="Затвори">
              <XIcon className="h-5 w-5" />
            </Tooltip>
          </button>
        </div>

        {isPending && <p>{MYLISTS_TEXT['modal']['loading']}</p>}

        <MyListNameForm
          existingNames={blockedNames}
          placeholder={MYLISTS_TEXT['modal']['myListPlaceholder']}
          submitText={MYLISTS_TEXT['modal']['createNewMyListButton']}
          isPending={isPending}
          apiError={apiError}
          defaultName={myListToUpdate?.name}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
