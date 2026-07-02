import { XIcon } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Tooltip from '../../../components/ui/Tooltip';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      {productToMyList === null && (
        <div className="relative max-h-[80vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
          <button
            onClick={onClose}
            className="text-dark/50 hover:text-dark absolute top-4 right-4 cursor-pointer transition"
          >
            <Tooltip
              text="Затвори"
              placement="left"
            >
              <XIcon className="h-6 w-6" />
            </Tooltip>
          </button>

          <h2 className="text-dark mb-4 text-xl font-bold">
            {!isPending &&
              !isError &&
              hasProducts &&
              SMART_SEARCH_TEXT['searchResultsModal']['productsFound'](query, productsLength)}
            {!isPending &&
              !isError &&
              !hasProducts &&
              SMART_SEARCH_TEXT['searchResultsModal']['noProductsFound'](query)}
            {!isPending && isError && SMART_SEARCH_TEXT['form']['unexpectedError']}

            {isPending && <p>{SMART_SEARCH_TEXT['form']['loading']}</p>}
          </h2>

          {!isPending && !isError && (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  handleClickAddProductToMyList={handleClickAddProductToMyList}
                  {...product}
                />
              ))}
            </div>
          )}

          {isPending && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <div className="border-t-accent h-16 w-16 animate-spin rounded-full border-4 border-gray-200"></div>
            </div>
          )}
        </div>
      )}

      {productToMyList !== null && (
        <AddProductToMyListModal
          productToMyList={productToMyList}
          onClose={() => {
            setProductToMyList(null);
          }}
          isAddedThroughSmartSearch
        />
      )}
    </div>
  );
}
