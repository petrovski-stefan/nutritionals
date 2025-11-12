import { useEffect, useState } from 'react';
import type { BackendCollection, ProductInCollection } from '../../types/collection';
import { CollectionService } from '../../api/collection';
import { useAuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { XIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

export default function MyCollections() {
  const [collections, setCollections] = useState<Array<BackendCollection>>([]);
  const [expandedCollections, setExpandedCollections] = useState<number[]>([]);
  const { accessToken, logout } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    const getCollections = async () => {
      const response = await CollectionService.getCollections(accessToken);

      if (response.code === 401) {
        logout();
        navigate('/login');
        return;
      }

      if (response.status) {
        setCollections(response.data);
      }
    };
    getCollections();
  }, []);

  const toggleCollection = (collectionId: number) => {
    setExpandedCollections((prev) =>
      prev.includes(collectionId)
        ? prev.filter((id) => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  const removeProduct = async (collectionId: number, productId: number) => {
    await CollectionService.removeProductFromCollection(collectionId, productId, accessToken);

    setCollections((prev) =>
      prev.map((col) =>
        col.id === collectionId
          ? { ...col, products: col.products.filter((p) => p.id !== productId) }
          : col
      )
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-dark mb-6 text-3xl font-bold">My Collections</h1>
      {collections.length === 0 && <p className="text-dark/70">No collections yet.</p>}

      <div className="flex flex-col gap-6">
        {collections.map((collection) => (
          <div
            key={collection.id}
            className="border-dark/30 rounded-3xl border-2 bg-white p-4 shadow-sm"
          >
            {/* Collection Header */}
            <div className="flex items-center justify-between">
              <p className="text-dark text-xl font-semibold">{collection.name}</p>
              <button
                className="hover:bg-primary/60 cursor-pointer rounded-3xl shadow-md"
                onClick={() => toggleCollection(collection.id)}
              >
                {expandedCollections.includes(collection.id) ? (
                  <ChevronUpIcon className="text-dark/70 h-6 w-6" />
                ) : (
                  <ChevronDownIcon className="text-dark/70 h-6 w-6" />
                )}
              </button>
            </div>

            {/* Products */}
            {expandedCollections.includes(collection.id) && collection.products.length > 0 && (
              <div className="mt-4 flex flex-col gap-3">
                {collection.products.map((product: ProductInCollection) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-xl border p-3 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex flex-col">
                      <p className="text-dark hover:decoration-secondary font-semibold hover:underline">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2">
                        {product.discount_price ? (
                          <>
                            <span className="text-dark/50 line-through">{product.price}</span>
                            <span className="text-primary font-bold">{product.discount_price}</span>
                          </>
                        ) : (
                          <span className="text-dark font-bold">{product.price}</span>
                        )}
                      </div>
                      <p className="text-dark/60 text-sm">
                        Updated: {new Date(product.updated_at).toLocaleDateString('en-GB')}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeProduct(collection.id, product.id)}
                      className="ml-4 cursor-pointer rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
                    >
                      <XIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {expandedCollections.includes(collection.id) && collection.products.length === 0 && (
              <p className="text-dark/70 mt-3 italic">No products in this collection.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
