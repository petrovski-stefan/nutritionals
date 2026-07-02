import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuthContext } from '../../../context/AuthContext';
import AddProductToMyListModal from '../../add-product-to-mylist/components/AddProductToMyListModal';
import type { ProductToMyList } from '../../my-lists/types';
import SEARCH_TEXT from '../locale/search';
import type { BackendProductGroup } from '../types/productgroups';
import ProductGroupCard from './ProductGroupCard';

type Props = Readonly<{
  groups: BackendProductGroup[];
  totalPages: number;
  currentPage: number;
  handlePaginationClick: (back: boolean) => void;
  isPending: boolean;
  isError: boolean;
}>;

export default function ProductsGrid({
  groups,
  totalPages,
  currentPage,
  handlePaginationClick,
  isPending,
  isError,
}: Props) {
  const [productToMyList, setProductToMyList] = useState<ProductToMyList | null>(null);

  const { isLoggedIn } = useAuthContext();

  const navigate = useNavigate();
  const location = useLocation();

  const handleClickAddProductToMyList = (
    productId: number,
    productName: string,
    pharmacyName: string
  ) => {
    if (!isLoggedIn) {
      void navigate('/login', { state: { from: location } });
      return;
    }
    setProductToMyList({ productId, productName, pharmacyName });
  };

  return (
    <div className="flex h-full w-full flex-wrap justify-center gap-10 p-4 md:ml-10 md:w-[75%] md:justify-start">
      {productToMyList && (
        <AddProductToMyListModal
          productToMyList={productToMyList}
          onClose={() => {
            setProductToMyList(null);
          }}
        />
      )}

      {!isPending &&
        !isError &&
        groups.map((group) => (
          <ProductGroupCard
            key={group.id}
            productGroup={group}
            handleClickAddProductToMyList={handleClickAddProductToMyList}
          />
        ))}

      {isPending && (
        <div className="ml-10 flex h-full w-[75%] flex-wrap justify-center gap-10 p-4">
          <div className="border-t-accent h-16 w-16 animate-spin rounded-full border-4 border-gray-200"></div>
        </div>
      )}

      {isError && (
        <p className="p-4 text-gray-500">{SEARCH_TEXT['groupsGrid']['error']['unexpectedError']}</p>
      )}

      {!isPending && !isError && groups.length > 0 && (
        <div className="flex w-full justify-center">
          <div className="flex w-1/2 justify-around">
            <div>
              <button
                className="bg-accent cursor-pointer rounded-2xl p-2 font-bold text-white"
                disabled={currentPage === 1}
                onClick={() => {
                  handlePaginationClick(true);
                }}
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
                onClick={() => {
                  handlePaginationClick(false);
                }}
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
