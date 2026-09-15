import { Menu, User2 } from 'lucide-react';
import { useUser } from '../context/UserContext.jsx';

export default function Header({ onMenuClick }) {
  const { userId, updateUser } = useUser();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <h1 className="text-lg font-semibold text-slate-800">Expense Management</h1>

      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
          <User2 size={16} className="text-slate-500" />
          <input
            value={userId}
            onChange={(e) => updateUser(e.target.value)}
            className="w-28 bg-transparent text-sm text-slate-700 focus:outline-none sm:w-40"
            placeholder="user-id"
            aria-label="User ID"
          />
        </div>
      </div>
    </header>
  );
}