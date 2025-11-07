import { useEffect, useState } from 'react';
import type { BackendProduct } from '../../types/product';
import ProductCard from './ProductCard';
import AddToCollectionModal from './AddToCollectionModal';
import { CollectionService } from '../../api/collection';
import { useAuthContext } from '../../context/AuthContext';

type Props = {
  products: Array<BackendProduct>;
};

type ProductToCollection = {
  id: number;
  name: string;
};

type Collection = {
  id: number;
  name: string;
};

export default function ProductsGrid({ products }: Props) {
  const [isAddToCollectionModalOpen, setIsAddToCollectionModalOpen] = useState(false);
  const [productToCollection, setProductToCollection] = useState<ProductToCollection | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);

  const { accessToken } = useAuthContext();

  useEffect(() => {
    const getCollections = async () => {
      const response = await CollectionService.getCollections(accessToken);
      if (response.status) {
        setCollections(response.data);
      }
    };
    getCollections();
  }, []);

  const handleClickAddProductToCollection = (id: number, name: string) => {
    setIsAddToCollectionModalOpen(true);
    setProductToCollection({ id, name });
  };

  const handleAddProductToCollection = async (productId: number, collectionId: number) => {
    console.log(`Added product ${productId} to collection ${collectionId}`);
    const response = await CollectionService.addProductToCollection(
      collectionId,
      productId,
      accessToken
    );

    if (response.status) {
      setIsAddToCollectionModalOpen(false);
      setProductToCollection(null);
    }
  };

  const handleCreateCollection = async (name: string) => {
    const response = await CollectionService.createCollection(name, accessToken);

    if (response.status) {
      setCollections((prev) => [...prev, response.data]);
    }
  };

  const productCards = products.map((product) => (
    <ProductCard
      key={product.id}
      pharmacyLogo={product.pharmacy_logo}
      discountPrice={product.discount_price}
      handleClickAddProductToCollection={handleClickAddProductToCollection}
      {...product}
    />
  ));

  return (
    <div className="ml-10 flex w-[75%] flex-wrap justify-start gap-10 p-4">
      {isAddToCollectionModalOpen && productToCollection && (
        <AddToCollectionModal
          productToCollection={productToCollection}
          collections={collections}
          handleAddProductToCollection={handleAddProductToCollection}
          handleCreateCollection={handleCreateCollection}
          setIsAddToCollectionModalOpen={setIsAddToCollectionModalOpen}
        />
      )}

      {productCards}
    </div>
  );
}
