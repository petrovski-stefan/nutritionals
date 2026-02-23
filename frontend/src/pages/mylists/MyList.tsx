import type { BackendMyListWithItemsCount } from '../../types/mylist';
import { EyeIcon, Edit2Icon, TrashIcon } from 'lucide-react';
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
      : 'text-primary';
  const secondaryTextColor = isEven ? 'text-white/70' : 'text-primary/70';

  return (
    <li
      className={`${backgroundColor} flex flex-row justify-between gap-0 rounded-lg border-b border-gray-200 px-4 py-4 shadow-sm sm:w-full md:items-center md:gap-4`}
    >
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p className={`text-lg font-semibold ${textColor}`}>{name}</p>
        <p className={`mt-1 text-sm ${secondaryTextColor}`}>
          {items_count === 0 && MYLISTS_TEXT['myLists']['noProducts']}
          {items_count === 1 && `${items_count} ${MYLISTS_TEXT['myLists']['oneProduct']}`}
          {items_count > 1 && `${items_count} ${MYLISTS_TEXT['myLists']['products']}`}
        </p>
        <p className={`mt-1 text-xs italic ${secondaryTextColor}`}>
          {MYLISTS_TEXT['myLists']['lastUpdatedAt']}{' '}
          {new Date(updated_at).toLocaleDateString('en-GB')}
        </p>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2 md:gap-3">
        <Tooltip
          text="Прегледај"
          placement="bottom"
        >
          <button
            className="cursor-pointer rounded-full bg-blue-500 p-2 text-white hover:bg-blue-600"
            onClick={() => handleMyListToView(id)}
          >
            <EyeIcon className="h-5 w-5" />
          </button>
        </Tooltip>

        <Tooltip
          text="Измени"
          placement="bottom"
        >
          <button
            onClick={() => handleClickMyListToEdit(id, name)}
            className="cursor-pointer rounded-full bg-yellow-500 p-2 text-white hover:bg-yellow-600"
          >
            <Edit2Icon className="h-5 w-5" />
          </button>
        </Tooltip>

        <Tooltip
          text="Избриши"
          placement="bottom"
        >
          <button
            onClick={() => handleDeleteMyList(id, accessToken)}
            className="cursor-pointer rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </Tooltip>
      </div>
    </li>
  );
}
