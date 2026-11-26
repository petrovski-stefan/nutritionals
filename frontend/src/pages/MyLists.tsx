import { ArrowLeftIcon, PlusIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import SectionCtaLink from '@/components/home/SectionCtaLink';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ConfirmModal from '@/components/ui/ConfirmModal';
import LoadingStatus from '@/components/ui/LoadingStatus';
import RetryButton from '@/components/ui/RetryButton';
import StateMessage from '@/components/ui/StateMessage';
import { useAuthContext } from '@/context/AuthContext';
import CreateUpdateMyListModal from '@/features/my-lists/components/CreateUpdateMyListModal';
import MyList from '@/features/my-lists/components/MyList';
import MyListItem from '@/features/my-lists/components/MyListItem';
import MyListItemSkeleton from '@/features/my-lists/components/MyListItemSkeleton';
import MyListSkeleton from '@/features/my-lists/components/MyListSkeleton';
import useDeleteMyList from '@/features/my-lists/hooks/useDeleteMyList';
import useMyList from '@/features/my-lists/hooks/useMyList';
import useMyLists from '@/features/my-lists/hooks/useMyLists';
import useRemoveProductFromMyList from '@/features/my-lists/hooks/useRemoveProductFromMyList';
import type { BackendMyListWithItems, MyListsLocationState } from '@/features/my-lists/types';
import useMediaQuery from '@/shared/hooks/useMediaQuery';

type SelectedMyList = Pick<BackendMyListWithItems, 'id' | 'name'>;

type ItemToRemove = { productId: number; productName: string };

const SKELETON_ROWS = 3;

export default function MyLists() {
  const location = useLocation();
  // Arriving from "Отвори ја листата" opens that list right away
  const [myListIdToView, setMyListIdToView] = useState<number | null>(
    () => (location.state as MyListsLocationState | null)?.openMyListId ?? null
  );
  const [isCreateUpdateMyListModalOpen, setIsCreateUpdateMyListModalOpen] = useState(false);
  const [myListToEdit, setMyListToEdit] = useState<SelectedMyList | null>(null);
  const [myListToDelete, setMyListToDelete] = useState<SelectedMyList | null>(null);
  const [itemToRemove, setItemToRemove] = useState<ItemToRemove | null>(null);

  const { accessToken } = useAuthContext();

  const myListsQuery = useMyLists(accessToken);
  const deleteMyList = useDeleteMyList();
  const removeProductFromMyList = useRemoveProductFromMyList();

  const myLists = myListsQuery.data ?? [];

  // From md up both panels show, so an empty detail panel would only ask for a click.
  // Below md the lists come first, so nothing opens on its own there
  const isDesktop = useMediaQuery('(min-width: 48rem)');
  const selectedMyListId = myListIdToView ?? (isDesktop ? (myLists[0]?.id ?? null) : null);
  const myListQuery = useMyList(selectedMyListId);
  const myListItems = myListQuery.data?.items ?? [];

  const existingNames = useMemo(
    () => (myListsQuery.data ?? []).map(({ name }) => name),
    [myListsQuery.data]
  );

  const handleViewMyList = (myListId: number) => {
    setMyListIdToView(myListId);
  };

  const handleBackToMyLists = () => {
    setMyListIdToView(null);
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

  const handleDeleteMyList = (myListId: number, myListName: string) => {
    deleteMyList.reset();
    setMyListToDelete({ id: myListId, name: myListName });
  };

  const handleCloseDeleteMyList = () => {
    deleteMyList.reset();
    setMyListToDelete(null);
  };

  const handleConfirmDeleteMyList = () => {
    if (myListToDelete === null) return;

    const myListId = myListToDelete.id;

    deleteMyList.mutate(
      { myListId },
      {
        onSuccess() {
          if (selectedMyListId === myListId) {
            setMyListIdToView(null);
          }
          setMyListToDelete(null);
        },
      }
    );
  };

  const handleRemoveProductFromMyList = (productId: number, productName: string) => {
    removeProductFromMyList.reset();
    setItemToRemove({ productId, productName });
  };

  const handleCloseRemoveProduct = () => {
    removeProductFromMyList.reset();
    setItemToRemove(null);
  };

  const handleConfirmRemoveProduct = () => {
    if (itemToRemove === null || selectedMyListId === null) return;

    removeProductFromMyList.mutate(
      { myListId: selectedMyListId, productId: itemToRemove.productId },
      {
        onSuccess() {
          setItemToRemove(null);
        },
      }
    );
  };

  const isThereSelectedMyList = selectedMyListId !== null;
  const selectedMyList = myLists.find(({ id }) => id === selectedMyListId);
  const selectedMyListItemsLength = isThereSelectedMyList ? myListItems.length : 0;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6">
      <title>Мои листи | Nutriceni</title>

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

      {myListToDelete !== null && (
        <ConfirmModal
          title="Избриши ја листата"
          message={`Листата „${myListToDelete.name}“ ќе биде трајно избришана, заедно со суплементите зачувани во неа.`}
          confirmText="Избриши"
          errorMessage="Листата не беше избришана. Проверете ја врската и обидете се повторно."
          isPending={deleteMyList.isPending}
          isError={deleteMyList.isError}
          onConfirm={handleConfirmDeleteMyList}
          onClose={handleCloseDeleteMyList}
        />
      )}

      {itemToRemove !== null && (
        <ConfirmModal
          title="Отстрани од листата"
          message={`„${itemToRemove.productName}“ ќе биде отстранет од листата „${selectedMyList?.name ?? ''}“.`}
          confirmText="Отстрани"
          errorMessage="Суплементот не беше отстранет. Проверете ја врската и обидете се повторно."
          isPending={removeProductFromMyList.isPending}
          isError={removeProductFromMyList.isError}
          onConfirm={handleConfirmRemoveProduct}
          onClose={handleCloseRemoveProduct}
        />
      )}

      {/* Below md one panel shows at a time: the lists, or the opened list with a way back.
          The panels only scroll on their own from md up; on a phone the page scrolls.
          min-w-0 stops long truncated names from widening the grid column */}
      <div className="grid min-h-96 items-start gap-4 md:grid-cols-[320px_1fr]">
        <Card
          className={`min-w-0 md:max-h-[70vh] md:overflow-y-auto ${isThereSelectedMyList ? 'max-md:hidden' : ''}`}
        >
          <ul>
            {myListsQuery.isSuccess &&
              myLists.map((myList) => (
                <MyList
                  key={myList.id}
                  isMyListCurrentlyViewed={selectedMyListId === myList.id}
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
                  message="Сè уште немате листи. Креирајте листа за да ги следите цените на суплементите што ве интересираат."
                >
                  <Button
                    size="sm"
                    onClick={handleClickCreateNewMyList}
                  >
                    <PlusIcon className="h-4 w-4" />
                    Креирај листа
                  </Button>
                </StateMessage>
              </li>
            )}

            {myListsQuery.isPending && (
              <>
                <li>
                  <LoadingStatus />
                </li>
                {Array.from({ length: SKELETON_ROWS }, (_, index) => (
                  <MyListSkeleton key={index} />
                ))}
              </>
            )}

            {myListsQuery.isError && (
              <li>
                <StateMessage variant="error">
                  <RetryButton
                    onRetry={() => {
                      void myListsQuery.refetch();
                    }}
                    isRetrying={myListsQuery.isFetching}
                  />
                </StateMessage>
              </li>
            )}
          </ul>
        </Card>

        <Card
          className={`min-w-0 md:max-h-[70vh] md:overflow-y-auto ${isThereSelectedMyList ? '' : 'max-md:hidden'}`}
        >
          {selectedMyList && (
            <div className="border-border flex items-center gap-2 border-b px-4 py-3">
              <Button
                variant="ghost"
                size="sm"
                className="-ml-2 shrink-0 md:hidden"
                onClick={handleBackToMyLists}
              >
                <ArrowLeftIcon
                  aria-hidden="true"
                  className="h-4 w-4"
                />
                Сите листи
              </Button>
              <h2 className="text-text truncate text-lg font-semibold">{selectedMyList.name}</h2>
            </div>
          )}

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
              <>
                <li>
                  <LoadingStatus />
                </li>
                {Array.from({ length: SKELETON_ROWS }, (_, index) => (
                  <MyListItemSkeleton key={index} />
                ))}
              </>
            )}

            {isThereSelectedMyList && myListQuery.isError && (
              <li>
                <StateMessage variant="error">
                  <RetryButton
                    onRetry={() => {
                      void myListQuery.refetch();
                    }}
                    isRetrying={myListQuery.isFetching}
                  />
                </StateMessage>
              </li>
            )}

            {isThereSelectedMyList && myListQuery.isSuccess && selectedMyListItemsLength === 0 && (
              <li>
                <StateMessage
                  variant="empty"
                  message="Листата е празна. Додадете суплементи со ѕвездичката до секоја понуда, од „Спореди цени“ или од „Паметно пребарување“."
                >
                  <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                    <SectionCtaLink to="/compare">Спореди цени</SectionCtaLink>
                    <SectionCtaLink to="/smart-search">Паметно пребарување</SectionCtaLink>
                  </div>
                </StateMessage>
              </li>
            )}

            {isThereSelectedMyList &&
              selectedMyListItemsLength > 0 &&
              myListItems.map((item) => (
                <MyListItem
                  key={item.id}
                  handleDeleteProductMyList={() => {
                    handleRemoveProductFromMyList(item.product_id, item.product_name);
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
