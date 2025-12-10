import type { BackendMyListWithItemsCount } from '../../types/mylist';
import { EyeIcon, Edit2Icon, DeleteIcon } from 'lucide-react';
import MYLISTS_TEXT from '../../locale/mylists';
import { useAuthContext } from '../../context/AuthContext';
import Tooltip from '../../components/Tooltip';

type Props = BackendMyListWithItemsCount & {
  arrayIndex: number;
  isMyListCurrentlyViewed: boolean;
  handleMyListToView: (myListId: number) => void;
  handleDeleteMyList: (myListId: number, accessToken: string) => Promise<void>;
  handleClickMyListToEdit: (myListId: number, myListName: string) => void;
};

export default function MyList({
  id,
  arrayIndex,
  isMyListCurrentlyViewed,
  name,
  items_count,
  updated_at,
  handleMyListToView,
  handleDeleteMyList,
  handleClickMyListToEdit,
}: Props) {
  const { accessToken } = useAuthContext();

  const isEven = arrayIndex % 2 === 0;
  const backgroundColor = isEven ? 'bg-primary' : 'bg-white';
  const textColor = isMyListCurrentlyViewed
    ? 'text-accent'
    : isEven
      ? 'text-white'
      : 'text-gray-800';
  const secondaryTextColor = isEven ? 'text-gray-200' : 'text-gray-500';

  return (
    <li
      className={`${backgroundColor} flex h-20 items-center justify-between rounded-md border-b border-gray-200 px-4`}
    >
      {/* Info */}
      <div className="flex flex-col justify-center gap-1">
        <p className={`text-xl font-semibold ${textColor}`}>{name}</p>
        <p className={`${secondaryTextColor}`}>
          {items_count === 0 && MYLISTS_TEXT['myLists']['noProducts']}
          {items_count === 1 && `${items_count} ${MYLISTS_TEXT['myLists']['oneProduct']}`}
          {items_count > 1 && `${items_count} ${MYLISTS_TEXT['myLists']['products']}`}
        </p>
        <p className={`text-xs ${secondaryTextColor}`}>
          {MYLISTS_TEXT['myLists']['lastUpdatedAt']}{' '}
          {new Date(updated_at).toLocaleDateString('en-GB')}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Tooltip
          text="Прегледај"
          placement="bottom"
        >
          <button
            className="cursor-pointer rounded p-1 transition hover:bg-gray-100"
            onClick={() => handleMyListToView(id)}
          >
            <EyeIcon className={`hover:text-accent ${textColor}`} />
          </button>
        </Tooltip>

        <Tooltip
          text="Измени"
          placement="bottom"
        >
          <button
            onClick={() => handleClickMyListToEdit(id, name)}
            className="cursor-pointer rounded p-1 transition hover:bg-gray-100"
          >
            <Edit2Icon className={`hover:text-secondary ${textColor}`} />
          </button>
        </Tooltip>

        <Tooltip
          text="Избриши"
          placement="bottom"
        >
          <button
            onClick={() => handleDeleteMyList(id, accessToken)}
            className="cursor-pointer rounded p-1 transition hover:bg-gray-100"
          >
            <DeleteIcon className={`hover:text-red-700 ${textColor}`} />
          </button>
        </Tooltip>
      </div>
    </li>
  );
}
