import { Search, X } from 'lucide-react';

export default function FilterBar({ filters, onChange, onReset, extra }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="card p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <label className="label">Search description</label>
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="input pl-9"
              placeholder="e.g. lunch, cab…"
              value={filters.search || ''}
              onChange={(e) => set('search', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label">Start date</label>
          <input
            type="date"
            className="input"
            value={filters.startDate || ''}
            onChange={(e) => set('startDate', e.target.value)}
          />
        </div>

        <div>
          <label className="label">End date</label>
          <input
            type="date"
            className="input"
            value={filters.endDate || ''}
            onChange={(e) => set('endDate', e.target.value)}
          />
        </div>

        {extra}

        <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
          <button className="btn-secondary" onClick={onReset}>
            <X size={16} /> Reset filters
          </button>
        </div>
      </div>
    </div>
  );
}