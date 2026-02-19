import { XIcon } from 'lucide-react';
import type { BackendProduct } from '../../types/product';
import ProductCard from './ProductCard';
import SMART_SEARCH_TEXT from '../../locale/smart-search';
import Tooltip from '../../components/Tooltip';
import { useEffect, useState } from 'react';
import type { BackendMyListWithItemsCount, ProductToMyList } from '../../types/mylist';
import Modal from './Modal';
import { MyListService } from '../../api/mylist';
import { useAuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type Error = 'unexpectedError' | 'noProductsFoundError' | null;

type Props = {
  query: string;
  products: BackendProduct[];
  error: Error;
  isLoading: boolean;
  onClose: () => void;
};

export default function SmartSearchResultsModal({
  query,
  products,
  onClose,
  error,
  isLoading,
}: Props) {
  const [productToMyList, setProductToMyList] = useState<ProductToMyList | null>(null);
  const [myLists, setMyLists] = useState<BackendMyListWithItemsCount[]>([]);

  const { accessToken, isLoggedIn } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    const getMyLists = async () => {
      const response = await MyListService.getMyLists(accessToken);
      if (response.status) {
        setMyLists(response.data);
      }
    };
    if (isLoggedIn) getMyLists();
  }, [isLoggedIn]);

  const productsLength = products.length;
  const hasProducts = productsLength > 0;

  const handleClickAddProductToMyList = (productToMyList: ProductToMyList) => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setProductToMyList(productToMyList);
  };

  const handleCloseAddProductToMyList = () => {
    setProductToMyList(null);
  };

  const handleAddProductToMyList = async (productId: number, myListId: number) => {
    const response = await MyListService.addProductToMyList(myListId, productId, accessToken, true);

    if (response.status) {
      setProductToMyList(null);
    }
  };

  const handleCreateMyList = async (name: string) => {
    const response = await MyListService.createMyList(name, accessToken);

    if (response.status) {
      setMyLists((prev) => [...prev, response.data]);
    }
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
            {!isLoading &&
              !error &&
              hasProducts &&
              SMART_SEARCH_TEXT['modal']['productsFound'](query, productsLength)}
            {!isLoading &&
              !error &&
              !hasProducts &&
              SMART_SEARCH_TEXT['modal']['noProductsFound'](query)}

            {isLoading && <p>{SMART_SEARCH_TEXT['form']['loading']}</p>}
          </h2>

          {!isLoading && !error && (
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

          {!isLoading && error && <p>{SMART_SEARCH_TEXT['form'][error]}</p>}

          {isLoading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <div className="border-t-accent h-16 w-16 animate-spin rounded-full border-4 border-gray-200"></div>
            </div>
          )}
        </div>
      )}

      {productToMyList !== null && (
        <Modal
          setIsAddModalOpen={handleCloseAddProductToMyList}
          myLists={myLists}
          productToMyList={productToMyList}
          handleCreateMyList={handleCreateMyList}
          handleAddProductToMyList={handleAddProductToMyList}
        />
      )}
    </div>
  );
}
