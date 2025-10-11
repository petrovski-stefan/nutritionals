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

export default function Filter({
  filterTitle,
  handleFilterDisplayToggle,
  checkboxes,
  isFilterDisplayed,
  filterType,
}: Props) {
  return (
    <div className="px-2">
      <span className="font-bold">{filterTitle} </span>
      <button
        onClick={(_) => handleFilterDisplayToggle(filterType)}
        className="cursor-pointer align-middle"
      >
        {isFilterDisplayed[filterType] === true ? (
          <ChevronUpCircleIcon />
        ) : (
          <ChevronDownCircleIcon />
        )}
      </button>

      {isFilterDisplayed[filterType] && checkboxes}
      <hr />
    </div>
  );
}
