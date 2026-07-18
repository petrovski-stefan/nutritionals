import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Modal from '@/components/ui/Modal';
import StateMessage from '@/components/ui/StateMessage';
import { useAuthContext } from '@/context/AuthContext';
import AddProductToMyListModal from '@/features/my-lists/components/AddProductToMyListModal';
import type { ProductToMyList } from '@/features/my-lists/types';
import type { BackendProductGroup } from '@/features/products/types/productgroups';

import ProductGroupCard from './ProductGroupCard';

type Props = Readonly<{
  query: string;
  groups: BackendProductGroup[];
  isPending: boolean;
  isError: boolean;
  onClose: () => void;
}>;

export default function SmartSearchResultsModal({
  query,
  groups,
  isPending,
  isError,
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
    if (isPending) return 'Се вчитува ...';
    if (isError) return 'Паметно пребарување';
    if (hasGroups) {
      return `Паметниот асистент пронајде ${String(groupsLength)} производи за вашето барање: "${query}".`;
    }
    return `Паметниот асистент не пронајде производи за вашето барање "${query}". Обидете се повторно.`;
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
        <StateMessage
          variant="loading"
          className="py-10"
        />
      )}

      {!isPending && isError && (
        <StateMessage
          variant="error"
          message="Се случи неочекувана грешка."
        />
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
