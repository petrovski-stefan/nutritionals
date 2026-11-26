import { FolderPlusIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

import Button from '@/components/ui/Button';
import LoadingStatus from '@/components/ui/LoadingStatus';
import Modal from '@/components/ui/Modal';
import RetryButton from '@/components/ui/RetryButton';
import Skeleton from '@/components/ui/Skeleton';
import Spinner from '@/components/ui/Spinner';
import StateMessage from '@/components/ui/StateMessage';
import { useAuthContext } from '@/context/AuthContext';
import { myListsErrorMessages } from '@/features/my-lists/errorMessages';
import useAddProductToMyList from '@/features/my-lists/hooks/useAddProductToMyList';
import useCreateMyList from '@/features/my-lists/hooks/useCreateMyList';
import useMyLists from '@/features/my-lists/hooks/useMyLists';
import type { ProductToMyList } from '@/features/my-lists/types';

import MyListNameForm from './MyListNameForm';

const SKELETON_LIST_BUTTONS = 3;

type Props = Readonly<{
  productToMyList: ProductToMyList;
  onClose: () => void;
  isAddedThroughSmartSearch?: boolean;
}>;

export default function AddProductToMyListModal({
  productToMyList,
  onClose,
  isAddedThroughSmartSearch = false,
}: Props) {
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const { accessToken } = useAuthContext();
  const myListsQuery = useMyLists(accessToken);
  const addProductToMyList = useAddProductToMyList();
  const createMyList = useCreateMyList();

  const myLists = myListsQuery.data ?? [];
  const existingNames = useMemo(
    () => (myListsQuery.data ?? []).map(({ name }) => name),
    [myListsQuery.data]
  );

  const handleClickMyList = (myListId: number) => {
    addProductToMyList.mutate(
      { myListId, productId: productToMyList.productId, isAddedThroughSmartSearch },
      { onSuccess: onClose }
    );
  };

  const handleCreateSubmit = (name: string) => {
    createMyList.mutate(
      { name },
      {
        onSuccess() {
          setIsCreatingNew(false);
        },
      }
    );
  };

  const handleCancelCreateNewMyList = () => {
    createMyList.reset();
    setIsCreatingNew(false);
  };

  let addProductErrorMessage: string | null = null;
  if (addProductToMyList.error) {
    const code = addProductToMyList.error.response?.data.errors[0]?.code ?? '';
    addProductErrorMessage = myListsErrorMessages.form[code] ?? myListsErrorMessages.fallback;
  }

  const isMutationPending = addProductToMyList.isPending || createMyList.isPending;

  const title = (
    <>
      Додај го
      <span>({productToMyList.pharmacyName}) </span>
      <span className="text-primary">{productToMyList.productName}</span> во листа
    </>
  );

  return (
    <Modal
      title={title}
      onClose={onClose}
      size="md"
    >
      {myListsQuery.isError && (
        <StateMessage
          variant="error"
          message="Листите не можеа да се вчитаат."
        >
          <RetryButton
            onRetry={() => {
              void myListsQuery.refetch();
            }}
            isRetrying={myListsQuery.isFetching}
          />
        </StateMessage>
      )}
      {addProductErrorMessage && (
        <StateMessage
          variant="error"
          message={addProductErrorMessage}
          className="p-2"
        />
      )}

      {myListsQuery.isPending && (
        <div className="mb-4 flex flex-col gap-2">
          <LoadingStatus />
          {Array.from({ length: SKELETON_LIST_BUTTONS }, (_, index) => (
            <Skeleton
              key={index}
              className="h-10 w-full"
            />
          ))}
        </div>
      )}

      {isMutationPending && (
        <div className="mb-3 flex justify-center">
          <Spinner size="sm" />
        </div>
      )}

      <div className="mb-4 flex max-h-56 flex-col gap-2 overflow-y-auto">
        {myListsQuery.isSuccess &&
          myLists.map((myList) => (
            <Button
              key={myList.id}
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                handleClickMyList(myList.id);
              }}
            >
              {myList.name}
            </Button>
          ))}

        {myListsQuery.isSuccess && myLists.length === 0 && (
          <p className="text-text-muted text-sm italic">Немате креирано листи</p>
        )}
      </div>

      {isCreatingNew ? (
        <MyListNameForm
          existingNames={existingNames}
          placeholder="Моја листа ..."
          submitText="Зачувај"
          isPending={createMyList.isPending}
          apiError={createMyList.error}
          onSubmit={handleCreateSubmit}
        >
          <Button
            variant="outline"
            onClick={handleCancelCreateNewMyList}
          >
            Откажи
          </Button>
        </MyListNameForm>
      ) : (
        <Button
          variant="ghost"
          className="border-border hover:border-primary/50 hover:text-primary w-full border border-dashed"
          onClick={() => {
            setIsCreatingNew(true);
          }}
        >
          <FolderPlusIcon className="h-4 w-4" />
          Креирајте нова листа
        </Button>
      )}
    </Modal>
  );
}
