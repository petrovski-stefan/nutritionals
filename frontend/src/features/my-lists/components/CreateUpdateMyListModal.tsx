import { useMemo } from 'react';

import Modal from '../../../components/ui/Modal';
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
      myListToUpdate
        ? existingNames.filter((name) => name !== myListToUpdate.name)
        : existingNames,
    [existingNames, myListToUpdate]
  );

  const handleSubmit = (name: string) => {
    if (mode === 'update' && myListToUpdate) {
      updateMyList.mutate({ myListId: myListToUpdate.id, name }, { onSuccess: onClose });
    } else {
      createMyList.mutate({ name }, { onSuccess: onClose });
    }
  };

  const title =
    mode === 'update' && myListToUpdate
      ? `${MYLISTS_TEXT['modal']['updateMyListTitle']} ${myListToUpdate.name}`
      : MYLISTS_TEXT['modal']['createNewMyListTitle'];

  return (
    <Modal
      title={title}
      onClose={onClose}
      size="md"
    >
      <MyListNameForm
        existingNames={blockedNames}
        placeholder={MYLISTS_TEXT['modal']['myListPlaceholder']}
        submitText={MYLISTS_TEXT['modal']['createNewMyListButton']}
        isPending={isPending}
        apiError={apiError}
        defaultName={myListToUpdate?.name}
        onSubmit={handleSubmit}
      />
    </Modal>
  );
}
