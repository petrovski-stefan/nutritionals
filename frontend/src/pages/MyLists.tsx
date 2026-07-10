import { PlusIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import StateMessage from '@/components/ui/StateMessage';
import { useAuthContext } from '@/context/AuthContext';
import CreateUpdateMyListModal from '@/features/my-lists/components/CreateUpdateMyListModal';
import MyList from '@/features/my-lists/components/MyList';
import MyListItem from '@/features/my-lists/components/MyListItem';
import useDeleteMyList from '@/features/my-lists/hooks/useDeleteMyList';
import useMyList from '@/features/my-lists/hooks/useMyList';
import useMyLists from '@/features/my-lists/hooks/useMyLists';
import useRemoveProductFromMyList from '@/features/my-lists/hooks/useRemoveProductFromMyList';
import type { BackendMyListWithItems } from '@/features/my-lists/types';

type EditMyList = Pick<BackendMyListWithItems, 'id' | 'name'>;

export default function MyLists() {
  const [myListIdToView, setMyListIdToView] = useState<number | null>(null);
  const [isCreateUpdateMyListModalOpen, setIsCreateUpdateMyListModalOpen] = useState(false);
  const [myListToEdit, setMyListToEdit] = useState<EditMyList | null>(null);

  const { accessToken } = useAuthContext();

  const myListsQuery = useMyLists(accessToken);
  const myListQuery = useMyList(myListIdToView);
  const deleteMyList = useDeleteMyList();
  const removeProductFromMyList = useRemoveProductFromMyList();

  const myLists = myListsQuery.data ?? [];
  const myListItems = myListQuery.data?.items ?? [];

  const existingNames = useMemo(
    () => (myListsQuery.data ?? []).map(({ name }) => name),
    [myListsQuery.data]
  );

  const handleViewMyList = (myListId: number) => {
    setMyListIdToView(myListId);
  };

  const handleClickCreateNewMyList = () => {
    setMyListToEdit(null);
    setIsCreateUpdateMyListModalOpen(true);
  };

  const handleCloseCreateUpdateMyList = () => {
    setMyListToEdit(null);
    setIsCreateUpdateMyListModalOpen(false);
  };

  const handleClickUpdateMyList = (myListId: number, myListName: string) => {
    setMyListToEdit({ id: myListId, name: myListName });
    setIsCreateUpdateMyListModalOpen(true);
  };

  const handleDeleteMyList = (myListId: number) => {
    deleteMyList.mutate(
      { myListId },
      {
        onSuccess() {
          if (myListIdToView === myListId) {
            setMyListIdToView(null);
          }
        },
      }
    );
  };

  const handleRemoveProductFromMyList = (myListId: number | null, productId: number) => {
    if (myListId === null) return;

    removeProductFromMyList.mutate({ myListId, productId });
  };

  const isThereSelectedMyList = myListIdToView !== null;
  const selectedMyListItemsLength = isThereSelectedMyList ? myListItems.length : 0;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex w-full flex-wrap items-center justify-between gap-4">
        <h1 className="text-text text-2xl font-bold sm:text-3xl">Мои листи</h1>

        <Button onClick={handleClickCreateNewMyList}>
          <PlusIcon className="h-4 w-4" />
          Креирај нова листа
        </Button>
      </div>

      {isCreateUpdateMyListModalOpen && (
        <CreateUpdateMyListModal
          onClose={handleCloseCreateUpdateMyList}
          mode={myListToEdit ? 'update' : 'create'}
          myListToUpdate={myListToEdit ?? undefined}
          existingNames={existingNames}
        />
      )}

      <div className="grid min-h-96 items-start gap-4 md:grid-cols-[320px_1fr]">
        <Card className="max-h-[70vh] overflow-y-auto">
          <ul>
            {myListsQuery.isSuccess &&
              myLists.map((myList) => (
                <MyList
                  key={myList.id}
                  isMyListCurrentlyViewed={myListIdToView === myList.id}
                  handleMyListToView={handleViewMyList}
                  handleDeleteMyList={handleDeleteMyList}
                  handleClickMyListToEdit={handleClickUpdateMyList}
                  {...myList}
                />
              ))}

            {myListsQuery.isSuccess && myLists.length === 0 && (
              <li>
                <StateMessage
                  variant="empty"
                  message="Моментално немате креирано листи."
                />
              </li>
            )}

            {myListsQuery.isPending && (
              <li>
                <StateMessage variant="loading" />
              </li>
            )}

            {myListsQuery.isError && (
              <li>
                <StateMessage
                  variant="error"
                  message="Се случи неочекувана грешка."
                />
              </li>
            )}
          </ul>
        </Card>

        <Card className="max-h-[70vh] overflow-y-auto">
          <ul>
            {!isThereSelectedMyList && (
              <li>
                <StateMessage
                  variant="empty"
                  message="Изберете листа за преглед."
                />
              </li>
            )}

            {isThereSelectedMyList && myListQuery.isPending && (
              <li>
                <StateMessage
                  variant="loading"
                  message="Се вчитува ..."
                />
              </li>
            )}

            {isThereSelectedMyList && myListQuery.isError && (
              <li>
                <StateMessage
                  variant="error"
                  message="Се случи неочекувана грешка."
                />
              </li>
            )}

            {isThereSelectedMyList && myListQuery.isSuccess && selectedMyListItemsLength === 0 && (
              <li>
                <StateMessage
                  variant="empty"
                  message="Листата е празна."
                />
              </li>
            )}

            {isThereSelectedMyList &&
              selectedMyListItemsLength > 0 &&
              myListItems.map((item) => (
                <MyListItem
                  key={item.id}
                  handleDeleteProductMyList={() => {
                    handleRemoveProductFromMyList(myListIdToView, item.product_id);
                  }}
                  {...item}
                />
              ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
