import { Inbox } from 'lucide-react';

export default function EmptyState({
  title = 'Nothing here yet',
  description = 'Add your first entry to get started.',
  action = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Inbox size={22} />
      </div>
      <div>
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}