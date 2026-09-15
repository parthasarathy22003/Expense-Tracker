import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) return null;

  const { currentPage, totalPages, totalItems, pageSize } = meta;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  const pages = [];
  const windowSize = 5;
  let from = Math.max(1, currentPage - 2);
  let to = Math.min(totalPages, from + windowSize - 1);
  if (to - from < windowSize - 1) from = Math.max(1, to - windowSize + 1);
  for (let i = from; i <= to; i += 1) pages.push(i);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row">
      <p className="text-xs text-slate-500">
        Showing <span className="font-medium text-slate-700">{start}</span>–
        <span className="font-medium text-slate-700">{end}</span> of{' '}
        <span className="font-medium text-slate-700">{totalItems}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          className="btn-ghost px-2 py-1"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={
              p === currentPage
                ? 'btn bg-brand-600 text-white px-3 py-1'
                : 'btn-ghost px-3 py-1'
            }
          >
            {p}
          </button>
        ))}

        <button
          className="btn-ghost px-2 py-1"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}