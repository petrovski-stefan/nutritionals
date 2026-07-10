import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Button from '../../../components/ui/Button';
import StateMessage from '../../../components/ui/StateMessage';
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
    <div className="flex w-full flex-col gap-6">
      {productToMyList && (
        <AddProductToMyListModal
          productToMyList={productToMyList}
          onClose={() => {
            setProductToMyList(null);
          }}
        />
      )}

      {!isPending && !isError && groups.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => (
            <ProductGroupCard
              key={group.id}
              productGroup={group}
              handleClickAddProductToMyList={handleClickAddProductToMyList}
            />
          ))}
        </div>
      )}

      {!isPending && !isError && groups.length === 0 && (
        <StateMessage
          variant="empty"
          message="Нема резултати за вашето пребарување."
        />
      )}

      {isPending && (
        <StateMessage
          variant="loading"
          className="py-16"
        />
      )}

      {isError && (
        <StateMessage
          variant="error"
          message={SEARCH_TEXT['groupsGrid']['error']['unexpectedError']}
        />
      )}

      {!isPending && !isError && groups.length > 0 && (
        <div className="flex items-center justify-center gap-6">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => {
              handlePaginationClick(true);
            }}
          >
            Претходна
          </Button>

          <span className="text-text-muted text-sm">
            {currentPage}/{totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => {
              handlePaginationClick(false);
            }}
          >
            Следна
          </Button>
        </div>
      )}
    </div>
  );
}
