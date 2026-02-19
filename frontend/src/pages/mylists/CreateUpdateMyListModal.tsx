import { useState } from 'react';
import { XIcon } from 'lucide-react';
import MYLISTS_TEXT from '../../locale/mylists';
import Tooltip from '../../components/Tooltip';

type Error = 'unexpectedError' | 'myListNameAlreadyUsed' | null;

type Props = {
  handleCloseCreateUpdateMyListModal: () => void;
  handleCreateUpdateMyList: (
    name: string,
    myListToUpdate?: {
      id: number;
      name: string;
    }
  ) => Promise<void>;
  mode: 'create' | 'update';
  isLoading: boolean;
  error: Error;
  myListToUpdate?: {
    id: number;
    name: string;
  };
};

export default function CreateUpdateMyListModal({
  handleCloseCreateUpdateMyListModal,
  handleCreateUpdateMyList,
  mode,
  isLoading,
  error,
  myListToUpdate,
}: Props) {
  const [myListName, setMyListName] = useState(() => {
    if (myListToUpdate && mode === 'update') {
      return myListToUpdate.name;
    }
    return '';
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between border-b border-neutral-200 pb-3">
          <h2 className="text-dark text-xl font-semibold">
            {mode === 'create'
              ? MYLISTS_TEXT['modal']['createNewMyListTitle']
              : `${MYLISTS_TEXT['modal']['updateMyListTitle']} ${myListToUpdate!.name}`}
          </h2>

          <button
            onClick={handleCloseCreateUpdateMyListModal}
            className="hover:text-dark cursor-pointer text-gray-400 transition-colors"
          >
            <Tooltip text="Затвори">
              <XIcon className="h-5 w-5" />
            </Tooltip>
          </button>
        </div>

        <div>
          {!isLoading && error && <p className="text-red-600">{MYLISTS_TEXT['modal'][error]}</p>}
          {isLoading && <p>{MYLISTS_TEXT['modal']['loading']}</p>}
        </div>

        <div className="mt-2 flex gap-2">
          <input
            type="text"
            maxLength={30}
            value={myListName}
            onChange={(e) => setMyListName(e.target.value)}
            placeholder={MYLISTS_TEXT['modal']['myListPlaceholder']}
            className="focus:ring-primary flex-1 rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:outline-none"
          />
          <button
            disabled={myListName.length < 1}
            onClick={() => handleCreateUpdateMyList(myListName, myListToUpdate)}
            className="bg-primary hover:bg-primary/90 cursor-pointer rounded-lg px-4 py-2 text-white disabled:cursor-not-allowed"
          >
            {MYLISTS_TEXT['modal']['createNewMyListButton']}
          </button>
        </div>
      </div>
    </div>
  );
}
