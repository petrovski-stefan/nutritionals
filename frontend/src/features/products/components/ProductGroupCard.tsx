import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import type { BackendProductGroup } from '@/features/products/types/productgroups';
import { getEffectivePrice } from '@/shared/utils/prices';

import ProductInGroup from './ProductInGroup';

// Enough to compare at a glance; the rest open on request instead of scrolling inside the card
const VISIBLE_OFFERS = 3;

const offersLabel = (count: number) => (count === 1 ? 'понуда' : 'понуди');

type Props = Readonly<{
  productGroup: BackendProductGroup;
  handleClickAddProductToMyList: (
    productId: number,
    productName: string,
    pharmacyName: string
  ) => void;
}>;

export default function ProductGroupCard({ productGroup, handleClickAddProductToMyList }: Props) {
  const [showAllOffers, setShowAllOffers] = useState(false);

  // Cheapest first, so the collapsed card always shows the best prices
  const offers = [...productGroup.products].sort(
    (a, b) => getEffectivePrice(a) - getEffectivePrice(b)
  );
  // Only worth marking when there is something to compare against
  const cheapestPrice = offers.length > 1 && offers[0] ? getEffectivePrice(offers[0]) : null;
  const hiddenOffersCount = offers.length - VISIBLE_OFFERS;
  const visibleOffers = showAllOffers ? offers : offers.slice(0, VISIBLE_OFFERS);
  const offersId = `group-card-offers-${String(productGroup.id)}`;

  return (
    <Card className="flex w-full flex-col p-4">
      <h3 className="text-text line-clamp-2 text-lg font-semibold">{productGroup.name}</h3>

      {productGroup.brand_name && (
        <p className="text-text-muted mt-1 text-sm">{productGroup.brand_name}</p>
      )}

      <p className="text-text-muted text-sm">
        <span className="text-text font-semibold">{offers.length}</span>{' '}
        {offersLabel(offers.length)}
      </p>

      <div
        id={offersId}
        className="mt-3"
      >
        {visibleOffers.map((product) => (
          <ProductInGroup
            key={product.id}
            {...product}
            isCheapest={getEffectivePrice(product) === cheapestPrice}
            handleClickAddProductToMyList={handleClickAddProductToMyList}
          />
        ))}
      </div>

      {hiddenOffersCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-1 w-full"
          aria-expanded={showAllOffers}
          aria-controls={offersId}
          onClick={() => {
            setShowAllOffers((prev) => !prev);
          }}
        >
          {showAllOffers
            ? 'Прикажи помалку'
            : `Прикажи уште ${String(hiddenOffersCount)} ${offersLabel(hiddenOffersCount)}`}
          <ChevronDownIcon
            aria-hidden="true"
            className={`h-4 w-4 transition-transform duration-200 ease-out motion-reduce:transition-none ${showAllOffers ? 'rotate-180' : ''}`}
          />
        </Button>
      )}
    </Card>
  );
}
