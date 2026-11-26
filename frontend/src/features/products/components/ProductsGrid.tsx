import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Button from '@/components/ui/Button';
import LoadingStatus from '@/components/ui/LoadingStatus';
import RetryButton from '@/components/ui/RetryButton';
import StateMessage from '@/components/ui/StateMessage';
import { useAuthContext } from '@/context/AuthContext';
import AddProductToMyListModal from '@/features/my-lists/components/AddProductToMyListModal';
import type { ProductToMyList } from '@/features/my-lists/types';
import type { BackendProductGroup } from '@/features/products/types/productgroups';

import ProductGroupCard from './ProductGroupCard';
import ProductGroupCardSkeleton from './ProductGroupCardSkeleton';

// Matches the page size of the product-groups endpoint
const SKELETON_CARDS = 6;

type Props = Readonly<{
  groups: BackendProductGroup[];
  totalPages: number;
  currentPage: number;
  handlePaginationClick: (back: boolean) => void;
  isPending: boolean;
  isError: boolean;
  isRefetching: boolean;
  handleRetry: () => void;
  hasActiveSearch: boolean;
  handleResetSearch: () => void;
}>;

export default function ProductsGrid({
  groups,
  totalPages,
  currentPage,
  handlePaginationClick,
  isPending,
  isError,
  isRefetching,
  handleRetry,
  hasActiveSearch,
  handleResetSearch,
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
          message={
            hasActiveSearch
              ? 'Нема производи што одговараат на пребарувањето и филтрите.'
              : 'Моментално нема производи.'
          }
        >
          {hasActiveSearch && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetSearch}
            >
              Исчисти пребарување и филтри
            </Button>
          )}
        </StateMessage>
      )}

      {isPending && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <LoadingStatus />
          {Array.from({ length: SKELETON_CARDS }, (_, index) => (
            <ProductGroupCardSkeleton key={index} />
          ))}
        </div>
      )}

      {isError && (
        <StateMessage variant="error">
          <RetryButton
            onRetry={handleRetry}
            isRetrying={isRefetching}
          />
        </StateMessage>
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

          <span className="text-text-muted text-sm tabular-nums">
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
