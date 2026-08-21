import { TagIcon } from 'lucide-react';

import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import type { BackendDiscountedProductGroup } from '@/features/products/types/productgroups';
import { formatPrice } from '@/shared/utils/prices';

type Props = Readonly<{
  group: BackendDiscountedProductGroup;
  onOpenOffers: (group: BackendDiscountedProductGroup) => void;
}>;

export default function BestDealGroupCard({ group, onOpenOffers }: Props) {
  const { name, brand_name, best_discount_percent, lowest_price, offer_count } = group;

  return (
    <Card
      hover
      className="flex w-44 flex-col items-center p-4 sm:w-48"
    >
      <div className="mb-2 flex w-full justify-center">
        <Badge variant="accent">-{best_discount_percent}%</Badge>
      </div>

      <div className="mb-2 flex min-h-14 w-full items-center justify-center">
        <p className="text-text line-clamp-3 text-center text-sm font-semibold">{name}</p>
      </div>

      <div className="mb-3 flex min-h-10 w-full flex-col items-center gap-1">
        {brand_name && <p className="text-text-muted truncate text-xs">{brand_name}</p>}
        <p className="text-accent truncate text-center text-lg font-bold">
          од {formatPrice(lowest_price)}
        </p>
      </div>

      <button
        type="button"
        className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-accent focus-visible:outline-primary flex w-full items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        onClick={() => {
          onOpenOffers(group);
        }}
      >
        <TagIcon className="h-4 w-4 shrink-0" />
        <span className="truncate">Спореди {offer_count} понуди</span>
      </button>
    </Card>
  );
}
