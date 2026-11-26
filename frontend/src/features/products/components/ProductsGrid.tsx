import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Button from '@/components/ui/Button';
import LoadingStatus from '@/components/ui/LoadingStatus';
import RetryButton from '@/components/ui/RetryButton';
import StateMessage from '@/components/ui/StateMessage';
import { useAuthContext } from '@/context/AuthContext';
import AddProductToMyListModal from '@/features/my-lists/components/AddProductToMyListModal';
import type { ProductToMyList } from '@/features/my-lists/types';
import { type GroupOrdering, toGroupOrdering } from '@/features/products/schemas';
import type { BackendProductGroup } from '@/features/products/types/productgroups';
import type { AuthRedirectState } from '@/shared/types/navigation';

import ProductGroupCard from './ProductGroupCard';
import ProductGroupCardSkeleton from './ProductGroupCardSkeleton';

// Matches the page size of the product-groups endpoint
const SKELETON_CARDS = 12;

type Props = Readonly<{
  groups: BackendProductGroup[];
  totalCount: number;
  query: string;
  ordering: GroupOrdering | null;
  handleSortChange: (ordering: GroupOrdering | null) => void;
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
  totalCount,
  query,
  ordering,
  handleSortChange,
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
      const state: AuthRedirectState = { from: location, reason: 'add-to-list' };
      void navigate('/login', { state });
      return;
    }
    setProductToMyList({ productId, productName, pharmacyName });
  };

  return (
    // Target of the "skip to results" link on Compare, hence the id and tabIndex
    <div
      id="compare-results"
      tabIndex={-1}
      className="flex w-full flex-col gap-6 outline-none"
    >
      {/* status: filter and search changes are announced with the new count */}
      {!isPending && !isError && totalCount > 0 && (
        // Count on the left, sorting on the right, where comparison sites put it
        <div className="-mb-2 flex flex-wrap items-center justify-between gap-3">
          <p
            role="status"
            className="text-text-muted text-sm"
          >
            <span className="text-text font-semibold tabular-nums">{totalCount}</span>{' '}
            {totalCount === 1 ? 'суплемент' : 'суплементи'}
            {query && ` за „${query}“`}
          </p>

          <label className="text-text-muted flex items-center gap-2 text-sm">
            Подреди:
            <select
              value={ordering ?? ''}
              onChange={(e) => {
                handleSortChange(toGroupOrdering(e.target.value));
              }}
              className="border-border bg-surface-raised text-text focus-visible:outline-primary cursor-pointer rounded-lg border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 pointer-coarse:text-base"
            >
              <option value="">{query ? 'Најрелевантни' : 'Најмногу понуди'}</option>
              <option value="price">Најниска цена</option>
              <option value="discount">Најголем попуст</option>
            </select>
          </label>
        </div>
      )}

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
              ? 'Нема суплементи што одговараат на пребарувањето и филтрите.'
              : 'Моментално нема суплементи.'
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
