import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  BarChart3,
  X,
} from 'lucide-react';
import { classNames } from '../utils/format.js';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/incomes', label: 'Incomes', icon: Wallet },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={classNames(
          'fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden',
          open ? 'block' : 'hidden'
        )}
        onClick={onClose}
      />

      <aside
        className={classNames(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white',
          'transform transition-transform duration-200 lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white font-bold">
              ₹
            </div>
            <span className="text-base font-semibold text-slate-800">ExpenseManager</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                classNames(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ExpenseManager</p>
        </div>
      </aside>
    </>
  );
}