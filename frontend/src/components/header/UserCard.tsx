import { useState } from 'react';
import USER_CARD_TEXT from '../../locale/user-card';

type Props = {
  username: string;
  handleLogout: () => void;
};

export default function UserCard({ username, handleLogout }: Props) {
  const [showLogoutButton, setShowLogoutButton] = useState(false);

  return (
    <div className="relative ml-5">
      <button
        onClick={() => setShowLogoutButton((prev) => !prev)}
        className="bg-accent hover:bg-accent/90 flex max-w-[160px] items-center rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors sm:max-w-none sm:text-base"
      >
        <span className="mr-1 hidden sm:inline">{USER_CARD_TEXT['welcome']}</span>

        <span className="truncate">{username}</span>
      </button>

      {showLogoutButton && (
        <div className="absolute right-0 z-50 mt-2 w-36 rounded-lg border bg-white shadow-lg">
          <button
            className="text-dark hover:bg-accent/10 w-full rounded-lg px-4 py-2 text-sm transition-colors"
            onClick={() => {
              handleLogout();
              setShowLogoutButton(false);
            }}
          >
            {USER_CARD_TEXT['logout']}
          </button>
        </div>
      )}
    </div>
  );
}
