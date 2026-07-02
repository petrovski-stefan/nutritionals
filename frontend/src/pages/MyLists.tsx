import { PlusIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useAuthContext } from '../context/AuthContext';
import CreateUpdateMyListModal from '../features/my-lists/components/CreateUpdateMyListModal';
import MyList from '../features/my-lists/components/MyList';
import MyListItem from '../features/my-lists/components/MyListItem';
import useDeleteMyList from '../features/my-lists/hooks/useDeleteMyList';
import useMyList from '../features/my-lists/hooks/useMyList';
import useMyLists from '../features/my-lists/hooks/useMyLists';
import useRemoveProductFromMyList from '../features/my-lists/hooks/useRemoveProductFromMyList';
import MYLISTS_TEXT from '../features/my-lists/locale';
import type { BackendMyListWithItems } from '../features/my-lists/types';

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
    <div className="flex flex-col gap-4 p-4">
      <div className="flex h-[20%] w-full items-center justify-center px-2 md:w-[30%] md:justify-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{MYLISTS_TEXT['hero']['h1']}</h2>
        </div>
        <div className="ml-5">
          <button
            onClick={handleClickCreateNewMyList}
            className="bg-primary hover:text-accent cursor-pointer rounded-3xl align-middle"
          >
            <PlusIcon />
          </button>
        </div>
      </div>

      {isCreateUpdateMyListModalOpen && (
        <CreateUpdateMyListModal
          onClose={handleCloseCreateUpdateMyList}
          mode={myListToEdit ? 'update' : 'create'}
          myListToUpdate={myListToEdit ?? undefined}
          existingNames={existingNames}
        />
      )}

      <div className="flex min-h-[400px] flex-col gap-4 md:flex-row">
        <ul className="max-h-[70vh] w-full overflow-y-auto rounded bg-white shadow-sm md:w-[30%]">
          {myListsQuery.isSuccess &&
            myLists.map((myList, i) => (
              <MyList
                key={myList.id}
                arrayIndex={i}
                isMyListCurrentlyViewed={myListIdToView ? myListIdToView === myList.id : false}
                handleMyListToView={handleViewMyList}
                handleDeleteMyList={handleDeleteMyList}
                handleClickMyListToEdit={handleClickUpdateMyList}
                {...myList}
              />
            ))}
          {myListsQuery.isSuccess && myLists.length === 0 && (
            <li className="p-4 text-gray-500">{MYLISTS_TEXT['myLists']['noMyLists']}</li>
          )}

          {myListsQuery.isPending && (
            <li className="p-4 text-gray-500">{MYLISTS_TEXT['myLists']['loading']}</li>
          )}

          {myListsQuery.isError && (
            <li className="p-4 text-gray-500">{MYLISTS_TEXT['myLists']['unexpectedError']}</li>
          )}
        </ul>

        <ul className="max-h-[70vh] w-full overflow-y-auto rounded bg-white shadow-sm md:w-[70%]">
          {isThereSelectedMyList && myListQuery.isPending && (
            <li className="p-4 text-gray-500">{MYLISTS_TEXT['products']['loading']}</li>
          )}

          {isThereSelectedMyList && myListQuery.isError && (
            <li className="p-4 text-gray-500">{MYLISTS_TEXT['products']['unexpectedError']}</li>
          )}

          {isThereSelectedMyList && myListQuery.isSuccess && selectedMyListItemsLength === 0 && (
            <li className="p-4 text-gray-500">{MYLISTS_TEXT['products']['noProducts']}</li>
          )}

          {isThereSelectedMyList &&
            selectedMyListItemsLength > 0 &&
            myListItems.map((item, i) => (
              <MyListItem
                key={item.id}
                arrayIndex={i}
                handleDeleteProductMyList={() => {
                  handleRemoveProductFromMyList(myListIdToView, item.product_id);
                }}
                {...item}
              />
            ))}
        </ul>
      </div>
    </div>
  );
}
