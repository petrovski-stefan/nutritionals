import { useState } from 'react';
import { XIcon, FolderPlusIcon } from 'lucide-react';

import type { BackendMyListWithItemsCount, ProductToMyList } from '../../../types/mylist';
import type { RequiredMyListsModalError, RequiredMyListsModalIsLoading } from '../types';
import Tooltip from '../../../components/Tooltip';
import { CREATE_NEW_MYLIST_ERROR, MYLISTS_ERROR, PRODUCT_TO_MYLIST_ERROR } from '../locale/error';
import {
  ADD,
  CANCEL,
  CREATE_NEW_MYLIST,
  MYLIST_PLACEHOLDER,
  NO_MYLISTS_YET,
  SAVE,
  TO_MYLIST,
} from '../locale/add-product-to-mylist-modal';

type Props<E extends RequiredMyListsModalError, IL extends RequiredMyListsModalIsLoading> = {
  productToMyList: ProductToMyList;
  myLists: BackendMyListWithItemsCount[];
  handleAddProductToMyList: (productId: number, myListId: number) => void;
  handleCreateMyList: (name: string) => void;
  handleMyListsModalOnClose: () => void;
  error: E;
  isLoading: IL;
  handleErrorChange: <K extends keyof E>(key: K, value: E[K]) => void;
  handleIsLoadingChange: <K extends keyof IL>(key: K, value: IL[K]) => void;
};

export default function AddProductToMyListModal<
  E extends RequiredMyListsModalError,
  L extends RequiredMyListsModalIsLoading,
>({
  productToMyList,
  myLists,
  handleAddProductToMyList,
  handleCreateMyList,
  handleMyListsModalOnClose,
  error,
  isLoading,
  handleErrorChange,
  //   handleIsLoadingChange,
}: Props<E, L>) {
  const [newMyListName, setNewMyListName] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const {
    createNewMyList: createNewMyListError,
    myLists: myListsError,
    productToMyList: productToMyListError,
  } = error;
  const {
    createNewMyList: createNewMyListIsLoading,
    myLists: myListsIsLoading,
    productToMyList: productToMyListIsLoading,
  } = isLoading;

  const handleClickCreateNewMyList = () => {
    setIsCreatingNew(true);
    handleErrorChange('createNewMyList', null);
  };

  const handleCancelCreateNewMyList = () => {
    setIsCreatingNew(false);
    handleErrorChange('createNewMyList', null);
  };

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
            onClick={handleMyListsModalOnClose}
            className="hover:text-dark cursor-pointer text-gray-400 transition-colors"
          >
            <Tooltip text="Затвори">
              <XIcon className="h-5 w-5" />
            </Tooltip>
          </button>
        </div>

        <div className="relative">
          {!myListsIsLoading && myListsError && (
            <p className="text-center text-red-600">
              {MYLISTS_ERROR[myListsError as keyof typeof MYLISTS_ERROR]}
            </p>
          )}
          {!createNewMyListIsLoading && createNewMyListError && (
            <p className="text-center text-red-600">
              {CREATE_NEW_MYLIST_ERROR[createNewMyListError]}
            </p>
          )}
          {!productToMyListIsLoading && productToMyListError && (
            <p className="text-center text-red-600">
              {PRODUCT_TO_MYLIST_ERROR[productToMyListError]}
            </p>
          )}

          {((productToMyListIsLoading && !productToMyListError) ||
            (myListsIsLoading && !myListsError) ||
            (createNewMyListIsLoading && !createNewMyListError)) && (
            <div className="absolute ml-10 flex h-full w-[75%] flex-wrap justify-center gap-10 p-4">
              <div className="border-t-accent h-8 w-8 animate-spin rounded-full border-4 border-gray-200"></div>
            </div>
          )}
        </div>

        <div className="mb-4 flex max-h-56 flex-col gap-2 overflow-y-auto">
          {!myListsIsLoading &&
            !myListsError &&
            myLists.length > 0 &&
            myLists.map((myList) => (
              <button
                key={myList.id}
                onClick={() => handleAddProductToMyList(productToMyList.productId, myList.id)}
                className="hover:border-primary hover:bg-primary/10 w-full cursor-pointer rounded-lg border border-neutral-300 px-4 py-2 text-left transition-all duration-200"
              >
                {myList.name}
              </button>
            ))}

          {!myListsIsLoading && !myListsError && myLists.length === 0 && (
            <p className="text-sm text-gray-500 italic">{NO_MYLISTS_YET}</p>
          )}
        </div>

        {isCreatingNew ? (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={newMyListName}
              onChange={(e) => setNewMyListName(e.target.value)}
              placeholder={MYLIST_PLACEHOLDER}
              className="focus:ring-primary flex-1 rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:outline-none"
            />
            <button
              onClick={() => {
                if (newMyListName.trim()) {
                  handleCreateMyList(newMyListName);
                  setNewMyListName('');
                  setIsCreatingNew(false);
                }
              }}
              className="bg-primary hover:bg-primary/90 cursor-pointer rounded-lg px-4 py-2 text-white"
            >
              {SAVE}
            </button>
            <button
              onClick={handleCancelCreateNewMyList}
              className="bg-neutral text-dark hover:bg-neutral/80 cursor-pointer rounded-lg px-4 py-2"
            >
              {CANCEL}
            </button>
          </div>
        ) : (
          <button
            onClick={handleClickCreateNewMyList}
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
