import { useState } from 'react';

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
        Hello, {username}
      </button>

      {/* Dropdown menu */}
      {showLogoutButton && (
        <div className="absolute right-0 mt-2 w-32 rounded-lg bg-white shadow-lg">
          <button
            className="text-dark hover:bg-accent/10 w-full cursor-pointer rounded-lg px-4 py-2 text-left transition-colors"
            onClick={() => {
              handleLogout();
              setShowLogoutButton(false);
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
