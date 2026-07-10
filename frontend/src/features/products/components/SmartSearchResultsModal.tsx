import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Modal from '@/components/ui/Modal';
import StateMessage from '@/components/ui/StateMessage';
import { useAuthContext } from '@/context/AuthContext';
import AddProductToMyListModal from '@/features/my-lists/components/AddProductToMyListModal';
import type { ProductToMyList } from '@/features/my-lists/types';
import type { BackendProduct } from '@/features/products/types/products';

import ProductCard from './ProductCard';

type Props = Readonly<{
  query: string;
  products: BackendProduct[];
  isPending: boolean;
  isError: boolean;
  onClose: () => void;
}>;

export default function SmartSearchResultsModal({
  query,
  products,
  isPending,
  isError,
  onClose,
}: Props) {
  const [productToMyList, setProductToMyList] = useState<ProductToMyList | null>(null);

  const { isLoggedIn } = useAuthContext();

  const navigate = useNavigate();
  const location = useLocation();

  const productsLength = products.length;
  const hasProducts = productsLength > 0;

  const handleClickAddProductToMyList = (productToMyList: ProductToMyList) => {
    if (!isLoggedIn) {
      void navigate('/login', { state: { from: location } });
      return;
    }
    setProductToMyList(productToMyList);
  };

  const getTitle = (): string => {
    if (isPending) return 'Се вчитува ...';
    if (isError) return 'Паметно пребарување';
    if (hasProducts) {
      return `Паметниот асистент пронајде ${String(productsLength)} суплементи за вашето барање: "${query}".`;
    }
    return `Паметниот асистент не пронајде суплементи за вашето барање "${query}". Обидете се повторно.`;
  };

  if (productToMyList !== null) {
    return (
      <AddProductToMyListModal
        productToMyList={productToMyList}
        onClose={() => {
          setProductToMyList(null);
        }}
        isAddedThroughSmartSearch
      />
    );
  }

  return (
    <Modal
      title={getTitle()}
      onClose={onClose}
      size="xl"
    >
      {isPending && (
        <StateMessage
          variant="loading"
          className="py-10"
        />
      )}

      {!isPending && isError && (
        <StateMessage
          variant="error"
          message="Се случи неочекувана грешка."
        />
      )}

      {!isPending && !isError && hasProducts && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              handleClickAddProductToMyList={handleClickAddProductToMyList}
              {...product}
            />
          ))}
        </div>
      )}
    </Modal>
  );
}
