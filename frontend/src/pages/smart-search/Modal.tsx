import { useState } from 'react';
import { XIcon, FolderPlusIcon } from 'lucide-react';
import SEARCH_TEXT from '../../locale/search';
import Tooltip from '../../components/Tooltip';
import type { BackendMyListWithItemsCount, ProductToMyList } from '../../types/mylist';

type Props = {
  productToMyList: ProductToMyList;
  myLists: BackendMyListWithItemsCount[];
  handleAddProductToMyList: (productId: number, myListId: number) => void;
  handleCreateMyList: (name: string) => void;
  setIsAddModalOpen: () => void;
};

export default function Modal({
  productToMyList,
  myLists,
  handleAddProductToMyList,
  handleCreateMyList,
  setIsAddModalOpen,
}: Props) {
  const [newMyListName, setNewMyListName] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between border-b border-neutral-200 pb-3">
          <h2 className="text-dark text-xl font-semibold">
            {SEARCH_TEXT['myListsModal']['add']}
            <span className="text-primary">{productToMyList.name}</span>{' '}
            {SEARCH_TEXT['myListsModal']['toMyList']}
          </h2>
          <button
            onClick={setIsAddModalOpen}
            className="hover:text-dark cursor-pointer text-gray-400 transition-colors"
          >
            <Tooltip text="Затвори">
              <XIcon className="h-5 w-5" />
            </Tooltip>
          </button>
        </div>

        {/* Existing My Lists */}
        <div className="mb-4 flex max-h-56 flex-col gap-2 overflow-y-auto">
          {myLists.length > 0 ? (
            myLists.map((myList) => (
              <button
                key={myList.id}
                onClick={() => handleAddProductToMyList(productToMyList.id, myList.id)}
                className="hover:border-primary hover:bg-primary/10 w-full cursor-pointer rounded-lg border border-neutral-300 px-4 py-2 text-left transition-all duration-200"
              >
                {myList.name}
              </button>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">
              {SEARCH_TEXT['myListsModal']['noMyListsYet']}
            </p>
          )}
        </div>

        {/* Create New My List */}
        {isCreatingNew ? (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={newMyListName}
              onChange={(e) => setNewMyListName(e.target.value)}
              placeholder={SEARCH_TEXT['myListsModal']['myListPlaceholder']}
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
              {SEARCH_TEXT['myListsModal']['create']}
            </button>
            <button
              onClick={() => setIsCreatingNew(false)}
              className="bg-neutral text-dark hover:bg-neutral/80 cursor-pointer rounded-lg px-4 py-2"
            >
              {SEARCH_TEXT['myListsModal']['cancel']}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsCreatingNew(true)}
            className="text-dark/70 hover:text-primary hover:border-primary/50 mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-400 px-4 py-2 transition-all"
          >
            <FolderPlusIcon className="h-4 w-4" />
            {SEARCH_TEXT['myListsModal']['createMyList']}
          </button>
        )}
      </div>
    </div>
  );
}
