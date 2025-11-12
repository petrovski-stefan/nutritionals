import { ChevronDownCircleIcon, ChevronUpCircleIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ProductFiltersDisplay } from '../../types/product';

type Props = {
  filterTitle: string;
  handleFilterDisplayToggle: (key: keyof ProductFiltersDisplay) => void;
  checkboxes: ReactNode[];
  isFilterDisplayed: ProductFiltersDisplay;
  filterType: keyof ProductFiltersDisplay;
};

export default function CheckboxesFilter({
  filterTitle,
  handleFilterDisplayToggle,
  checkboxes,
  isFilterDisplayed,
  filterType,
}: Props) {
  const shouldOverflow = checkboxes.length > 10;
  const shouldDisplayScroller = shouldOverflow && isFilterDisplayed[filterType];

  return (
    <div
      className={`max-h-96 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm transition-all hover:shadow-md ${shouldDisplayScroller ? 'overflow-y-scroll' : ''}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-dark font-semibold">{filterTitle}</span>
        <button
          onClick={() => handleFilterDisplayToggle(filterType)}
          className={`hover:text-primary text-gray-400 transition-colors ${shouldDisplayScroller ? '' : 'mr-4'}`}
        >
          {isFilterDisplayed[filterType] ? (
            <ChevronUpCircleIcon className="h-5 w-5" />
          ) : (
            <ChevronDownCircleIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {isFilterDisplayed[filterType] && (
        <div className="mt-2 flex flex-col gap-2 pl-1">{checkboxes}</div>
      )}
    </div>
  );
}
