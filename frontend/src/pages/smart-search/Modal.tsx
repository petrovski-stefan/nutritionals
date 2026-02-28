import { useState } from 'react';
import { XIcon, FolderPlusIcon } from 'lucide-react';
import TEXT from '../../locale/smart-search';
import Tooltip from '../../components/Tooltip';
import type { BackendMyListWithItemsCount, ProductToMyList } from '../../types/mylist';
import type { IsLoading, Error } from './types';

type Props = {
  productToMyList: ProductToMyList;
  myLists: BackendMyListWithItemsCount[];
  handleAddProductToMyList: (productId: number, myListId: number) => void;
  handleCreateMyList: (name: string) => void;
  handleMyListsModalOnClose: () => void;
  error: Error;
  isLoading: IsLoading;
};

export default function Modal({
  productToMyList,
  myLists,
  handleAddProductToMyList,
  handleCreateMyList,
  handleMyListsModalOnClose,
  error,
  isLoading,
}: Props) {
  const [newMyListName, setNewMyListName] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const {
    productToMyList: productToMyListError,
    myLists: myListsError,
    createNewMyList: createNewMyListError,
  } = error;
  const {
    productToMyList: productToMyListIsLoading,
    myLists: myListsIsLoading,
    createNewMyList: createNewMyListIsLoading,
  } = isLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between border-b border-neutral-200 pb-3">
          <h2 className="text-dark text-xl font-semibold">
            {TEXT['myListsModal']['add']}
            <span className="text-primary">{productToMyList.productName}</span>{' '}
            {TEXT['myListsModal']['toMyList']}
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

        <div className="mb-4 flex max-h-56 flex-col gap-2 overflow-y-auto">
          {!productToMyListIsLoading && productToMyListError && (
            <p className="text-center text-red-600">
              {TEXT['myListsModal']['errors'][productToMyListError]}
            </p>
          )}

          {!createNewMyListIsLoading && createNewMyListError && (
            <p className="text-center text-red-600">
              {TEXT['myListsModal']['errors'][createNewMyListError]}
            </p>
          )}

          {productToMyListIsLoading && !productToMyListError && (
            <div className="ml-10 flex h-full w-[75%] flex-wrap justify-center gap-10 p-4">
              <div className="border-t-accent h-8 w-8 animate-spin rounded-full border-4 border-gray-200"></div>
            </div>
          )}

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
            <p className="text-sm text-gray-500 italic">{TEXT['myListsModal']['noMyListsYet']}</p>
          )}
          {myListsIsLoading && !myListsError && (
            <div className="ml-10 flex h-full w-[75%] flex-wrap justify-center gap-10 p-4">
              <div className="border-t-accent h-16 w-16 animate-spin rounded-full border-4 border-gray-200"></div>
            </div>
          )}
          {!myListsIsLoading && myListsError && (
            <p>{TEXT['myListsModal']['errors'][myListsError]}</p>
          )}
        </div>

        {isCreatingNew ? (
          <div className="mt-2 flex gap-1 md:gap-2">
            <input
              type="text"
              value={newMyListName}
              onChange={(e) => setNewMyListName(e.target.value)}
              placeholder={TEXT['myListsModal']['myListPlaceholder']}
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
              {TEXT['myListsModal']['create']}
            </button>
            <button
              onClick={() => setIsCreatingNew(false)}
              className="bg-neutral text-dark hover:bg-neutral/80 cursor-pointer rounded-lg px-4 py-2"
            >
              {TEXT['myListsModal']['cancel']}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsCreatingNew(true)}
            className="text-dark/70 hover:text-primary hover:border-primary/50 mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-400 px-4 py-2 transition-all"
          >
            <FolderPlusIcon className="h-4 w-4" />
            {TEXT['myListsModal']['createMyList']}
          </button>
        )}
      </div>
    </div>
  );
}
