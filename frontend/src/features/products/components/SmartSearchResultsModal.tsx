import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Modal from '../../../components/ui/Modal';
import StateMessage from '../../../components/ui/StateMessage';
import { useAuthContext } from '../../../context/AuthContext';
import AddProductToMyListModal from '../../add-product-to-mylist/components/AddProductToMyListModal';
import type { ProductToMyList } from '../../my-lists/types';
import SMART_SEARCH_TEXT from '../locale/smart-search';
import type { BackendProduct } from '../types/products';
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
    if (isPending) return SMART_SEARCH_TEXT['form']['loading'];
    if (isError) return 'Паметно пребарување';
    if (hasProducts) {
      return SMART_SEARCH_TEXT['searchResultsModal']['productsFound'](query, productsLength);
    }
    return SMART_SEARCH_TEXT['searchResultsModal']['noProductsFound'](query);
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
          message={SMART_SEARCH_TEXT['form']['unexpectedError']}
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
