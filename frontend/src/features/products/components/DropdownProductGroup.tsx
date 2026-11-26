import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';

import type { BackendProductGroup } from '@/features/products/types/productgroups';
import { formatPrice, getEffectivePrice } from '@/shared/utils/prices';

import DropdownGroupOffer from './DropdownGroupOffer';

type Props = Readonly<{
  productGroup: BackendProductGroup;
}>;

export default function DropdownProductGroup({ productGroup }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const offersId = `group-offers-${String(productGroup.id)}`;

  const offersCount = productGroup.products.length;
  // The API returns offers in no particular order
  const offers = [...productGroup.products].sort(
    (a, b) => getEffectivePrice(a) - getEffectivePrice(b)
  );
  const offerPrices = offers.map(getEffectivePrice);
  const minPrice = offerPrices.length > 0 ? Math.min(...offerPrices) : null;

  return (
    <div className="border-border border-b last:border-0">
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={offersId}
        onClick={() => {
          setIsExpanded((prev) => !prev);
        }}
        className="hover:bg-surface-sunken focus-visible:outline-primary flex w-full items-center justify-between gap-3 rounded px-3 py-2.5 text-left transition duration-150 ease-out focus-visible:outline-2 focus-visible:-outline-offset-2 active:scale-[0.98] motion-reduce:transition-none"
      >
        <div className="min-w-0">
          <p className="text-text truncate text-sm font-medium">{productGroup.name}</p>
          <p className="text-text-muted mt-0.5 text-xs">
            {productGroup.brand_name && <>{productGroup.brand_name} · </>}
            {offersCount} понуди
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {minPrice !== null && (
            <span className="text-primary text-sm font-semibold tabular-nums">
              од {formatPrice(minPrice)}
            </span>
          )}
          <ChevronDownIcon
            aria-hidden="true"
            className={`text-text-muted h-4 w-4 transition-transform duration-200 ease-out motion-reduce:transition-none ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {isExpanded && (
        <div
          id={offersId}
          className="px-3 pb-2 transition-opacity duration-200 ease-out motion-reduce:transition-none starting:opacity-0"
        >
          {offers.map((product) => (
            <DropdownGroupOffer
              key={product.id}
              {...product}
              isCheapest={offers.length > 1 && getEffectivePrice(product) === minPrice}
            />
          ))}
        </div>
      )}
    </div>
  );
}
