import { useEffect, useState } from 'react';
import type { BackendProduct } from '../../types/product';
import ProductCard from './ProductCard';
import Modal from './Modal';
import { MyListService } from '../../api/mylist';
import { useAuthContext } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

type Props = {
  products: Array<BackendProduct>;
};

type ProductToMyList = {
  id: number;
  name: string;
};

type MyList = {
  id: number;
  name: string;
};

export default function ProductsGrid({ products }: Props) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [productToMyList, setProductToMyList] = useState<ProductToMyList | null>(null);
  const [myLists, setMyLists] = useState<MyList[]>([]);

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
    getMyLists();
  }, []);

  const handleClickAddProductToMyList = (id: number, name: string) => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setIsAddModalOpen(true);
    setProductToMyList({ id, name });
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

  const productCards = products.map((product) => (
    <ProductCard
      key={product.id}
      pharmacyLogo={product.pharmacy_logo}
      discountPrice={product.discount_price}
      handleClickAddProductToMyList={handleClickAddProductToMyList}
      {...product}
    />
  ));

  return (
    <div className="ml-10 flex w-[75%] flex-wrap justify-start gap-10 p-4">
      {isAddModalOpen && productToMyList && (
        <Modal
          productToMyList={productToMyList}
          myLists={myLists}
          handleAddProductToMyList={handleAddProductToMyList}
          handleCreateMyList={handleCreateMyList}
          setIsAddModalOpen={setIsAddModalOpen}
        />
      )}

      {productCards}
    </div>
  );
}
