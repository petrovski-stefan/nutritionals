import { useEffect, useState } from 'react';
import Modal from './Modal';
import { MyListService } from '../../api/mylist';
import { useAuthContext } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import type { BackendMyListWithItemsCount, ProductToMyList } from '../../types/mylist';
import type { BackendProductGroup } from '../../types/productgroup';
import ProductGroupCard from './ProductGroupCard';

type Props = {
  groups: BackendProductGroup[];
  totalPages: number;
  currentPage: number;
  handlePaginationClick: (back: boolean) => void;
};

type ProductToMyListError = null | 'client_error' | 'unexpectedError';
type MyListError = null | 'unexpectedError';

type Error = {
  productToMyList: ProductToMyListError;
  myListError: MyListError;
};

const defaultError: Error = {
  productToMyList: null,
  myListError: null,
};

export default function ProductsGrid({
  groups,
  totalPages,
  currentPage,
  handlePaginationClick,
}: Props) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [productToMyList, setProductToMyList] = useState<ProductToMyList | null>(null);
  const [myLists, setMyLists] = useState<BackendMyListWithItemsCount[]>([]);
  const [error, setError] = useState(defaultError);

  const { accessToken, isLoggedIn } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const getMyLists = async () => {
      const response = await MyListService.getMyLists(accessToken);
      if (response.status) {
        setMyLists(response.data);
      }
    };
    if (isLoggedIn) getMyLists();
  }, [isLoggedIn]);

  const handleClickAddProductToMyList = (
    productId: number,
    productName: string,
    pharmacyName: string
  ) => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setIsAddModalOpen(true);
    setProductToMyList({ productId, productName, pharmacyName });
    setError((prev) => ({ ...prev, productToMyList: null }));
  };

  const handleAddProductToMyList = async (productId: number, myListId: number) => {
    setError((prev) => ({ ...prev, productToMyList: null }));

    try {
      const response = await MyListService.addProductToMyList(myListId, productId, accessToken);

      if (response.status) {
        setIsAddModalOpen(false);
        setProductToMyList(null);
      } else {
        setError((prev) => ({
          ...prev,
          productToMyList: response.errors_type as ProductToMyListError,
        }));
      }
    } catch (error) {
      setError((prev) => ({ ...prev, productToMyList: 'unexpectedError' }));
    }
  };

  const handleCreateMyList = async (name: string) => {
    const response = await MyListService.createMyList(name, accessToken);

    if (response.status) {
      setMyLists((prev) => [...prev, response.data]);
    }
  };

  return (
    <div className="flex h-full w-full flex-wrap justify-center gap-10 p-4 md:ml-10 md:w-[75%] md:justify-start">
      {isAddModalOpen && productToMyList && (
        <Modal
          productToMyList={productToMyList}
          myLists={myLists}
          handleAddProductToMyList={handleAddProductToMyList}
          handleCreateMyList={handleCreateMyList}
          setIsAddModalOpen={setIsAddModalOpen}
          error={error['productToMyList']}
        />
      )}

      {groups.map((group) => (
        <ProductGroupCard
          key={group.id}
          productGroup={group}
          handleClickAddProductToMyList={handleClickAddProductToMyList}
        />
      ))}

      {groups.length > 0 && (
        <div className="flex w-full justify-center">
          <div className="flex w-1/2 justify-around">
            <div>
              <button
                className="bg-accent cursor-pointer rounded-2xl p-2 font-bold text-white"
                disabled={currentPage === 1}
                onClick={() => handlePaginationClick(true)}
              >
                Претходна
              </button>
            </div>
            <div>
              {currentPage}/{totalPages}
            </div>
            <div>
              <button
                className="bg-primary cursor-pointer rounded-2xl p-2 font-bold text-white"
                disabled={currentPage === totalPages}
                onClick={() => handlePaginationClick(false)}
              >
                Следна
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
