import { FolderPlusIcon, XIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

import Tooltip from '../../../components/ui/Tooltip';
import { useAuthContext } from '../../../context/AuthContext';
import MyListNameForm from '../../my-lists/components/MyListNameForm';
import { myListsErrorMessages } from '../../my-lists/errorMessages';
import useAddProductToMyList from '../../my-lists/hooks/useAddProductToMyList';
import useCreateMyList from '../../my-lists/hooks/useCreateMyList';
import useMyLists from '../../my-lists/hooks/useMyLists';
import type { ProductToMyList } from '../../my-lists/types';
import {
  ADD,
  CANCEL,
  CREATE_NEW_MYLIST,
  MYLIST_PLACEHOLDER,
  NO_MYLISTS_YET,
  SAVE,
  TO_MYLIST,
} from '../locale/add-product-to-mylist-modal';
import { MYLISTS_ERROR } from '../locale/error';

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

  const isPending =
    myListsQuery.isPending || addProductToMyList.isPending || createMyList.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between border-b border-neutral-200 pb-3">
          <h2 className="text-dark text-xl font-semibold">
            {ADD}
            <span>({productToMyList.pharmacyName}) </span>
            <span className="text-primary">{productToMyList.productName}</span> {TO_MYLIST}
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

        <div className="relative">
          {myListsQuery.isError && <p className="text-center text-red-600">{MYLISTS_ERROR}</p>}
          {addProductErrorMessage && (
            <p className="text-center text-red-600">{addProductErrorMessage}</p>
          )}

          {isPending && (
            <div className="absolute ml-10 flex h-full w-[75%] flex-wrap justify-center gap-10 p-4">
              <div className="border-t-accent h-8 w-8 animate-spin rounded-full border-4 border-gray-200"></div>
            </div>
          )}
        </div>

        <div className="mb-4 flex max-h-56 flex-col gap-2 overflow-y-auto">
          {myListsQuery.isSuccess &&
            myLists.map((myList) => (
              <button
                key={myList.id}
                onClick={() => {
                  handleClickMyList(myList.id);
                }}
                className="hover:border-primary hover:bg-primary/10 w-full cursor-pointer rounded-lg border border-neutral-300 px-4 py-2 text-left transition-all duration-200"
              >
                {myList.name}
              </button>
            ))}

          {myListsQuery.isSuccess && myLists.length === 0 && (
            <p className="text-sm text-gray-500 italic">{NO_MYLISTS_YET}</p>
          )}
        </div>

        {isCreatingNew ? (
          <MyListNameForm
            existingNames={existingNames}
            placeholder={MYLIST_PLACEHOLDER}
            submitText={SAVE}
            isPending={createMyList.isPending}
            apiError={createMyList.error}
            onSubmit={handleCreateSubmit}
          >
            <button
              type="button"
              onClick={handleCancelCreateNewMyList}
              className="bg-neutral text-dark hover:bg-neutral/80 cursor-pointer rounded-lg px-4 py-2"
            >
              {CANCEL}
            </button>
          </MyListNameForm>
        ) : (
          <button
            onClick={() => {
              setIsCreatingNew(true);
            }}
            className="text-dark/70 hover:text-primary hover:border-primary/50 mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-400 px-4 py-2 transition-all"
          >
            <FolderPlusIcon className="h-4 w-4" />
            {CREATE_NEW_MYLIST}
          </button>
        )}
      </div>
    </div>
  );
}
