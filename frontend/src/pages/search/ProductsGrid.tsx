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
};

export default function ProductsGrid({ groups }: Props) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [productToMyList, setProductToMyList] = useState<ProductToMyList | null>(null);
  const [myLists, setMyLists] = useState<BackendMyListWithItemsCount[]>([]);

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
  };

  const handleAddProductToMyList = async (productId: number, myListId: number) => {
    const response = await MyListService.addProductToMyList(myListId, productId, accessToken);

    if (response.status) {
      setIsAddModalOpen(false);
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
    <div className="flex h-full w-full flex-wrap justify-center gap-10 p-4 md:ml-10 md:w-[75%] md:justify-start">
      {isAddModalOpen && productToMyList && (
        <Modal
          productToMyList={productToMyList}
          myLists={myLists}
          handleAddProductToMyList={handleAddProductToMyList}
          handleCreateMyList={handleCreateMyList}
          setIsAddModalOpen={setIsAddModalOpen}
        />
      )}

      {groups.map((group) => (
        <ProductGroupCard
          key={group.id}
          productGroup={group}
          handleClickAddProductToMyList={handleClickAddProductToMyList}
        />
      ))}
    </div>
  );
}
