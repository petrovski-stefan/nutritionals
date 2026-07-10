import { AlertTriangleIcon, ExternalLink } from 'lucide-react';

import Badge from '../../../components/ui/Badge';
import Card from '../../../components/ui/Card';
import Tooltip from '../../../components/ui/Tooltip';
import { formatPrice } from '../prices';
import { checkIsPossiblyUnavailible } from '../utils';

type Props = Readonly<{
  name: string;
  url: string;
  brand_name: string | null;
  price: number;
  discount_price: number;
  discount_percent: number;
  pharmacy_name: string;
  last_scraped_at: string;
}>;

export default function BestDealsProductCard({
  name,
  price,
  discount_price,
  discount_percent,
  pharmacy_name,
  url,
  brand_name,
  last_scraped_at,
}: Props) {
  const hasBrand = brand_name !== null;

  const lastScrapedAtDate = new Date(last_scraped_at);
  const isPossiblyUnavailable = checkIsPossiblyUnavailible(lastScrapedAtDate);
  const lastScrapedAt = new Date(last_scraped_at).toLocaleDateString('en-GB');

  return (
    <Card
      hover
      className="relative flex w-44 flex-col items-center p-4 sm:w-48"
    >
      <div className="mb-2 flex w-full justify-center">
        <Badge variant="accent">-{discount_percent}%</Badge>
      </div>

      <div className="mb-3 flex min-h-14 w-full items-center justify-center">
        <p className="text-text line-clamp-3 text-center text-sm font-semibold">{name}</p>
      </div>

      <div className="mb-3 flex min-h-10 w-full flex-col items-center gap-1">
        {discount_price ? (
          <>
            <p className="text-text-muted text-sm line-through">{formatPrice(price)}</p>
            <p className="text-accent truncate text-center text-lg font-bold">
              {formatPrice(discount_price)}
            </p>
          </>
        ) : (
          <p className="text-primary truncate text-center text-lg font-bold">
            {formatPrice(price)}
          </p>
        )}
      </div>

      <div className="mb-3 flex min-h-10 w-full justify-center">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-accent focus-visible:outline-primary flex w-full items-center justify-center gap-1 truncate rounded-lg px-3 py-2 text-center text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          <span className="truncate text-center">
            {hasBrand ? `${brand_name} - ${pharmacy_name}` : pharmacy_name}
          </span>
        </a>
      </div>

      <div className="flex w-full justify-center">
        <p className="text-text-muted text-center text-xs">Ажурирано на: {lastScrapedAt}</p>
      </div>

      {isPossiblyUnavailable && (
        <span className="text-danger absolute top-3 right-3">
          <Tooltip
            text="Достапноста е можеби застарена"
            placement="bottom"
          >
            <AlertTriangleIcon className="h-5 w-5" />
          </Tooltip>
        </span>
      )}
    </Card>
  );
}
