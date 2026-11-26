import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Button from '@/components/ui/Button';
import LoadingStatus from '@/components/ui/LoadingStatus';
import Modal from '@/components/ui/Modal';
import RetryButton from '@/components/ui/RetryButton';
import StateMessage from '@/components/ui/StateMessage';
import { useAuthContext } from '@/context/AuthContext';
import AddProductToMyListModal from '@/features/my-lists/components/AddProductToMyListModal';
import type { ProductToMyList } from '@/features/my-lists/types';
import type { BackendProductGroup } from '@/features/products/types/productgroups';

import ProductGroupCard from './ProductGroupCard';
import ProductGroupCardSkeleton from './ProductGroupCardSkeleton';

const SKELETON_CARDS = 3;

type Props = Readonly<{
  query: string;
  groups: BackendProductGroup[];
  isPending: boolean;
  isError: boolean;
  handleRetry: () => void;
  onClose: () => void;
}>;

export default function SmartSearchResultsModal({
  query,
  groups,
  isPending,
  isError,
  handleRetry,
  onClose,
}: Props) {
  const [productToMyList, setProductToMyList] = useState<ProductToMyList | null>(null);

  const { isLoggedIn } = useAuthContext();

  const navigate = useNavigate();
  const location = useLocation();

  const groupsLength = groups.length;
  const hasGroups = groupsLength > 0;

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

  const getTitle = (): string => {
    if (isPending) return 'Паметниот асистент бара суплементи ...';
    if (isError) return 'Паметно пребарување';
    if (hasGroups) {
      return `Паметниот асистент пронајде ${String(groupsLength)} производи за вашето барање: "${query}".`;
    }
    return `Не се пронајдени производи за „${query}“`;
  };

  if (productToMyList !== null) {
    return (
      <AddProductToMyListModal
        productToMyList={productToMyList}
        onClose={() => {
          setProductToMyList(null);
        }}
        isAddedThroughSmartSearch
      />
    );
  }

  return (
    <Modal
      title={getTitle()}
      onClose={onClose}
      size="xl"
    >
      {isPending && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <LoadingStatus message="Паметниот асистент бара суплементи ..." />
          {Array.from({ length: SKELETON_CARDS }, (_, index) => (
            <ProductGroupCardSkeleton key={index} />
          ))}
        </div>
      )}

      {!isPending && isError && (
        <StateMessage
          variant="error"
          message="Паметното пребарување не успеа. Проверете ја врската и обидете се повторно."
        >
          <RetryButton onRetry={handleRetry} />
        </StateMessage>
      )}

      {!isPending && !isError && !hasGroups && (
        <StateMessage
          variant="empty"
          message="Пробајте да ја опишете целта со други зборови, на пример „подобар сон“ или „повеќе енергија“."
        >
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Ново пребарување
          </Button>
        </StateMessage>
      )}

      {!isPending && !isError && hasGroups && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <ProductGroupCard
              key={group.id}
              productGroup={group}
              handleClickAddProductToMyList={handleClickAddProductToMyList}
            />
          ))}
        </div>
      )}
    </Modal>
  );
}
