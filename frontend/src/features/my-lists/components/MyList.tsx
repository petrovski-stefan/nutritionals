import { Edit2Icon, EyeIcon, TrashIcon } from 'lucide-react';

import IconButton from '@/components/ui/IconButton';
import Tooltip from '@/components/ui/Tooltip';
import type { BackendMyListWithItemsCount } from '@/features/my-lists/types';

type Props = Readonly<
  BackendMyListWithItemsCount & {
    isMyListCurrentlyViewed: boolean;
    handleMyListToView: (myListId: number) => void;
    handleDeleteMyList: (myListId: number) => void;
    handleClickMyListToEdit: (myListId: number, myListName: string) => void;
  }
>;

export default function MyList({
  id,
  isMyListCurrentlyViewed,
  name,
  items_count,
  updated_at,
  handleMyListToView,
  handleDeleteMyList,
  handleClickMyListToEdit,
}: Props) {
  const rowClasses = isMyListCurrentlyViewed
    ? 'border-l-primary bg-primary/10 border-l-4'
    : 'bg-surface-raised odd:bg-surface-sunken';

  return (
    <li
      className={`border-border flex flex-row items-center justify-between gap-2 border-b px-4 py-4 transition-colors last:border-0 md:gap-4 ${rowClasses}`}
    >
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p
          className={`truncate text-lg font-semibold ${
            isMyListCurrentlyViewed ? 'text-primary' : 'text-text'
          }`}
        >
          {name}
        </p>
        <p className="text-text-muted mt-1 text-sm">
          {items_count === 0 && 'Листата е празна'}
          {items_count === 1 && '1 суплемент'}
          {items_count > 1 && `${String(items_count)} суплементи`}
        </p>
        <p className="text-text-muted mt-1 text-xs italic">
          Последно ажурирана на: {new Date(updated_at).toLocaleDateString('en-GB')}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Tooltip
          text="Прегледај"
          placement="bottom"
        >
          <IconButton
            label="Прегледај"
            variant="info"
            size="sm"
            onClick={() => {
              handleMyListToView(id);
            }}
          >
            <EyeIcon className="h-4 w-4" />
          </IconButton>
        </Tooltip>

        <Tooltip
          text="Измени"
          placement="bottom"
        >
          <IconButton
            label="Измени"
            variant="warning"
            size="sm"
            onClick={() => {
              handleClickMyListToEdit(id, name);
            }}
          >
            <Edit2Icon className="h-4 w-4" />
          </IconButton>
        </Tooltip>

        <Tooltip
          text="Избриши"
          placement="bottom"
        >
          <IconButton
            label="Избриши"
            variant="danger"
            size="sm"
            onClick={() => {
              handleDeleteMyList(id);
            }}
          >
            <TrashIcon className="h-4 w-4" />
          </IconButton>
        </Tooltip>
      </div>
    </li>
  );
}
