import { ChevronDownCircleIcon, ChevronUpCircleIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import IconButton from '@/components/ui/IconButton';
import Tooltip from '@/components/ui/Tooltip';
import type { GroupFilterDisplay } from '@/features/products/types/productgroups';

type Props = Readonly<{
  filterTitle: string;
  handleFilterDisplayToggle: (key: keyof GroupFilterDisplay) => void;
  checkboxes: ReactNode[];
  isFilterDisplayed: GroupFilterDisplay;
  filterType: keyof GroupFilterDisplay;
}>;

export default function CheckboxesFilter({
  filterTitle,
  handleFilterDisplayToggle,
  checkboxes,
  isFilterDisplayed,
  filterType,
}: Props) {
  const isDisplayed = isFilterDisplayed[filterType];
  const toggleLabel = isDisplayed ? 'Затвори' : 'Отвори';

  return (
    <div className="border-border border-t pt-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-text font-semibold">{filterTitle}</span>

        <Tooltip
          text={toggleLabel}
          placement="left"
        >
          <IconButton
            label={toggleLabel}
            size="sm"
            aria-expanded={isDisplayed}
            onClick={() => {
              handleFilterDisplayToggle(filterType);
            }}
          >
            {isDisplayed ? (
              <ChevronUpCircleIcon className="h-5 w-5" />
            ) : (
              <ChevronDownCircleIcon className="h-5 w-5" />
            )}
          </IconButton>
        </Tooltip>
      </div>

      {isDisplayed && (
        // py-1 and pl-1 leave room for the checkboxes' focus ring inside the scroll area
        <div className="mt-1 flex max-h-80 flex-col overflow-x-hidden overflow-y-auto py-1 pl-1 transition-opacity duration-200 ease-out motion-reduce:transition-none starting:opacity-0">
          {checkboxes}
        </div>
      )}
    </div>
  );
}
