import { useState } from 'react';
import USER_CARD_TEXT from '../../locale/user-card';

type Props = {
  username: string;
  handleLogout: () => void;
};

export default function UserCard({ username, handleLogout }: Props) {
  const [showLogoutButton, setShowLogoutButton] = useState(false);

  return (
    <div className="group relative">
      <button
        onClick={() => setShowLogoutButton((old) => !old)}
        className="bg-accent hover:bg-accent/90 cursor-pointer rounded-lg px-4 py-2 font-medium text-white transition-colors"
      >
        {USER_CARD_TEXT['welcome']} {username}
      </button>

      {/* Dropdown menu */}
      {showLogoutButton && (
        <div className="absolute right-0 mt-2 w-32 rounded-lg bg-white shadow-lg">
          <button
            className="text-dark hover:bg-accent/10 w-full cursor-pointer rounded-lg px-4 py-2 text-center transition-colors"
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
