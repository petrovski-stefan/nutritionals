import { useState } from 'react';
import { XIcon, FolderPlusIcon } from 'lucide-react';
import SEARCH_TEXT from '../../locale/search';

type Collection = {
  id: number;
  name: string;
};

type Props = {
  productToCollection: {
    id: number;
    name: string;
  };
  collections: Collection[];
  handleAddProductToCollection: (productId: number, collectionId: number) => void;
  handleCreateCollection: (name: string) => void;
  setIsAddToCollectionModalOpen: (value: boolean) => void;
};

export default function AddToCollectionModal({
  productToCollection,
  collections,
  handleAddProductToCollection,
  handleCreateCollection,
  setIsAddToCollectionModalOpen,
}: Props) {
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between border-b border-neutral-200 pb-3">
          <h2 className="text-dark text-xl font-semibold">
            {SEARCH_TEXT['collectionsModal']['add']}
            <span className="text-primary">{productToCollection.name}</span>{' '}
            {SEARCH_TEXT['collectionsModal']['toCollection']}
          </h2>
          <button
            onClick={() => setIsAddToCollectionModalOpen(false)}
            className="hover:text-dark cursor-pointer text-gray-400 transition-colors"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Existing Collections */}
        <div className="mb-4 flex max-h-56 flex-col gap-2 overflow-y-auto">
          {collections.length > 0 ? (
            collections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => handleAddProductToCollection(productToCollection.id, collection.id)}
                className="hover:border-primary hover:bg-primary/10 w-full cursor-pointer rounded-lg border border-neutral-300 px-4 py-2 text-left transition-all duration-200"
              >
                {collection.name}
              </button>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">
              {SEARCH_TEXT['collectionsModal']['noCollectionsYet']}
            </p>
          )}
        </div>

        {/* Create New Collection */}
        {isCreatingNew ? (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder={SEARCH_TEXT['collectionsModal']['collectionPlaceholder']}
              className="focus:ring-primary flex-1 rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:outline-none"
            />
            <button
              onClick={() => {
                if (newCollectionName.trim()) {
                  handleCreateCollection(newCollectionName);
                  setNewCollectionName('');
                  setIsCreatingNew(false);
                }
              }}
              className="bg-primary hover:bg-primary/90 cursor-pointer rounded-lg px-4 py-2 text-white"
            >
              {SEARCH_TEXT['collectionsModal']['create']}
            </button>
            <button
              onClick={() => setIsCreatingNew(false)}
              className="bg-neutral text-dark hover:bg-neutral/80 cursor-pointer rounded-lg px-4 py-2"
            >
              {SEARCH_TEXT['collectionsModal']['cancel']}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsCreatingNew(true)}
            className="text-dark/70 hover:text-primary hover:border-primary/50 mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-400 px-4 py-2 transition-all"
          >
            <FolderPlusIcon className="h-4 w-4" />
            {SEARCH_TEXT['collectionsModal']['createCollection']}
          </button>
        )}
      </div>
    </div>
  );
}
