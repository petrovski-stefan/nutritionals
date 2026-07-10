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
    <div className="border-border bg-surface-raised max-h-96 overflow-x-hidden overflow-y-auto rounded-xl border p-3">
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

      {isDisplayed && <div className="mt-2 flex flex-col gap-2 pl-1">{checkboxes}</div>}
    </div>
  );
}
