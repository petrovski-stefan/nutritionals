import { BrainIcon, XIcon } from 'lucide-react';

import Badge from '../../../components/ui/Badge';
import IconButton from '../../../components/ui/IconButton';
import Tooltip from '../../../components/ui/Tooltip';
import { formatPrice } from '../../products/prices';
import { checkIsPossiblyUnavailible } from '../../products/utils';
import MYLISTS_TEXT from '../locale';
import type { BackendMyListItem } from '../types';

type Props = Readonly<
  BackendMyListItem & {
    handleDeleteProductMyList: () => void;
  }
>;

export default function MyListItem({
  is_added_through_smart_search,
  product_brand_name,
  product_discount_price,
  product_discount_percent,
  product_name,
  product_price,
  product_last_scraped_at,
  product_url,
  product_pharmacy_name,
  created_at,
  handleDeleteProductMyList,
}: Props) {
  const lastScrapedAtDate = new Date(product_last_scraped_at);
  const isPossiblyUnavailable = checkIsPossiblyUnavailible(lastScrapedAtDate);
  const lastScrapedAt = new Date(product_last_scraped_at).toLocaleDateString('en-GB');

  const scrapedDateClasses = isPossiblyUnavailable ? 'text-danger' : 'text-warning';

  const deleteButton = (
    <Tooltip text="Избриши">
      <IconButton
        label="Избриши"
        variant="danger"
        size="sm"
        onClick={handleDeleteProductMyList}
      >
        <XIcon className="h-4 w-4" />
      </IconButton>
    </Tooltip>
  );

  const priceBlock = product_discount_price ? (
    <div className="flex flex-col items-end">
      <p className="text-text-muted truncate text-sm line-through">{formatPrice(product_price)}</p>
      <p className="flex items-center gap-2 truncate text-xl font-bold">
        <span className="text-accent">{formatPrice(product_discount_price)}</span>
        <Badge variant="accent">-{product_discount_percent}%</Badge>
      </p>
    </div>
  ) : (
    <p className="text-text truncate text-xl font-bold">{formatPrice(product_price)}</p>
  );

  return (
    <li className="border-border bg-surface-raised odd:bg-surface-sunken flex flex-col justify-between gap-4 border-b px-4 py-4 transition-colors last:border-0 md:flex-row md:items-center md:gap-0">
      <div className="mr-3 flex w-full flex-row items-start justify-between md:w-auto md:flex-col md:items-center md:justify-start">
        <Badge
          variant="neutral"
          className="max-w-32 truncate"
        >
          {product_pharmacy_name}
        </Badge>

        <div className="flex items-center gap-4 md:hidden">
          {priceBlock}
          {deleteButton}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <h3 className="flex w-full min-w-0 items-center gap-1 text-lg font-semibold">
          {is_added_through_smart_search && (
            <Tooltip text="Паметно пребаруван суплемент">
              <BrainIcon className="text-info h-5 w-5 shrink-0" />
            </Tooltip>
          )}
          <a
            href={product_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text hover:decoration-accent focus-visible:outline-primary rounded break-words hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 md:truncate"
          >
            {product_name}
          </a>
        </h3>

        <p className="text-text-muted mt-1 w-full truncate text-sm">
          <span>{product_brand_name}</span>
          <span> / </span>
          <span>
            {MYLISTS_TEXT.products.productAddedToMyListAt}{' '}
            {new Date(created_at).toLocaleDateString('en-GB')}
          </span>
        </p>
      </div>

      <div className="hidden shrink-0 flex-col items-end md:flex">
        <div className="flex items-center gap-4">
          {priceBlock}
          {deleteButton}
        </div>

        <p className={`mt-2 text-right text-xs italic ${scrapedDateClasses}`}>
          {MYLISTS_TEXT.products.productPriceUpdatedAt} {lastScrapedAt}
        </p>
      </div>

      <p className={`text-left text-xs italic md:hidden ${scrapedDateClasses}`}>
        {MYLISTS_TEXT.products.productPriceUpdatedAt} {lastScrapedAt}
      </p>
    </li>
  );
}
