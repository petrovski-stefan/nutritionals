import { useEffect, useState } from 'react';
import { MyListService } from '../../api/mylist';
import { useAuthContext } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import type { BackendMyListWithItemsCount, ProductToMyList } from '../../types/mylist';
import type { BackendProductGroup } from '../../types/productgroup';
import ProductGroupCard from './ProductGroupCard';
import type { Error, IsLoading } from './types';
import AddProductToMyListModal from '../../features/add-product-to-mylist/components/AddProductToMyListModal';

type Props = {
  groups: BackendProductGroup[];
  totalPages: number;
  currentPage: number;
  handlePaginationClick: (back: boolean) => void;
  error: Error;
  isLoading: IsLoading;
  handleErrorChange: <K extends keyof Error>(key: K, value: Error[K]) => void;
  handleIsLoadingChange: <K extends keyof IsLoading>(key: K, value: IsLoading[K]) => void;
};

export default function ProductsGrid({
  groups,
  totalPages,
  currentPage,
  handlePaginationClick,
  error,
  isLoading,
  handleErrorChange,
  handleIsLoadingChange,
}: Props) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [productToMyList, setProductToMyList] = useState<ProductToMyList | null>(null);
  const [myLists, setMyLists] = useState<BackendMyListWithItemsCount[]>([]);

  const { accessToken, isLoggedIn } = useAuthContext();

  const navigate = useNavigate();
  const location = useLocation();

  const { groups: groupsIsLoading } = isLoading;
  const { groups: groupsError } = error;

  useEffect(() => {
    const getMyLists = async () => {
      handleErrorChange('myLists', null);
      handleIsLoadingChange('myLists', true);
      try {
        const response = await MyListService.getMyLists(accessToken);
        if (response.status) {
          setMyLists(response.data);
        }
      } catch (error) {
        handleErrorChange('myLists', 'unexpectedError');
      } finally {
        handleIsLoadingChange('myLists', false);
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
    handleErrorChange('productToMyList', null);
    handleErrorChange('myLists', null);
    handleErrorChange('createNewMyList', null);
  };

  const handleAddProductToMyList = async (productId: number, myListId: number) => {
    handleErrorChange('productToMyList', null);
    handleIsLoadingChange('productToMyList', true);

    try {
      const response = await MyListService.addProductToMyList(myListId, productId, accessToken);

      if (response.status) {
        setIsAddModalOpen(false);
        setProductToMyList(null);
      } else {
        handleErrorChange('productToMyList', 'client_error');
      }
    } catch (error) {
      handleErrorChange('productToMyList', 'unexpectedError');
    } finally {
      handleIsLoadingChange('productToMyList', false);
    }
  };

  const alreadyUsedMyListNamesSet = new Set(myLists.map(({ name }) => name));

  const handleCreateMyList = async (name: string) => {
    handleIsLoadingChange('createNewMyList', true);
    handleErrorChange('createNewMyList', null);

    if (alreadyUsedMyListNamesSet.has(name)) {
      handleErrorChange('createNewMyList', 'myListNameAlreadyUsed');
      handleIsLoadingChange('createNewMyList', false);

      return;
    }

    try {
      const response = await MyListService.createMyList(name, accessToken);

      if (response.status) {
        setMyLists((prev) => [response.data, ...prev]);
      }
    } catch (error) {
      handleErrorChange('createNewMyList', 'unexpectedError');
    } finally {
      handleIsLoadingChange('createNewMyList', false);
    }
  };

  const handleMyListsModalOnClose = () => {
    setIsAddModalOpen(false);
    handleErrorChange('createNewMyList', null);
    handleErrorChange('myLists', null);
    handleErrorChange('productToMyList', null);
  };

  return (
    <div className="flex h-full w-full flex-wrap justify-center gap-10 p-4 md:ml-10 md:w-[75%] md:justify-start">
      {isAddModalOpen && productToMyList && (
        <AddProductToMyListModal
          productToMyList={productToMyList}
          myLists={myLists}
          handleAddProductToMyList={handleAddProductToMyList}
          handleCreateMyList={handleCreateMyList}
          handleMyListsModalOnClose={handleMyListsModalOnClose}
          error={error}
          handleErrorChange={handleErrorChange}
          isLoading={isLoading}
          handleIsLoadingChange={handleIsLoadingChange}
        />
      )}

      {!groupsIsLoading &&
        !groupsError &&
        groups.map((group) => (
          <ProductGroupCard
            key={group.id}
            productGroup={group}
            handleClickAddProductToMyList={handleClickAddProductToMyList}
          />
        ))}

      {groupsIsLoading && (
        <div className="ml-10 flex h-full w-[75%] flex-wrap justify-center gap-10 p-4">
          <div className="border-t-accent h-16 w-16 animate-spin rounded-full border-4 border-gray-200"></div>
        </div>
      )}

      {!groupsIsLoading && !groupsError && groups.length > 0 && (
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
