import Modal from '@/components/ui/Modal';
import type { BackendDiscountedProductGroup } from '@/features/products/types/productgroups';
import { getEffectivePrice } from '@/shared/utils/prices';

import DropdownGroupOffer from './DropdownGroupOffer';

type Props = Readonly<{
  group: BackendDiscountedProductGroup;
  onClose: () => void;
}>;

export default function GroupOffersModal({ group, onClose }: Props) {
  const offers = [...group.products].sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
  const cheapestPrice = offers[0] ? getEffectivePrice(offers[0]) : null;

  return (
    <Modal
      title={group.name}
      size="lg"
      onClose={onClose}
    >
      <p className="text-text-muted mb-4 text-sm">
        Најниската цена не е секогаш кај аптеката со најголемо намалување — споредете ги сите понуди
        пред да купите.
      </p>

      <div>
        {offers.map((product) => (
          <DropdownGroupOffer
            key={product.id}
            {...product}
            isCheapest={offers.length > 1 && getEffectivePrice(product) === cheapestPrice}
          />
        ))}
      </div>
    </Modal>
  );
}
