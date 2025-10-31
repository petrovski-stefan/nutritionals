type Props = {
  username: string;
  handleLogout: () => void;
};

export default function UserCard({ username, handleLogout }: Props) {
  return (
    <div className="bg-accent absolute right-0 h-full rounded text-white">
      <p className="h-[40%]">Hello, {username}</p>

      <div className="h-[60%]">
        <button
          className="hover:border-primary hover:bg-primary w-full cursor-pointer rounded-2xl text-center hover:border"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
